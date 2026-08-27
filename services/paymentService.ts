import { api } from '@/lib/api/client';

type PaymentData = App.Data.Payment.PaymentData;
type RefundData = App.Data.Payment.RefundData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;

export interface RecordPaymentParams {
  method: string;
  amount: number;
  reference?: string | null;
  notes?: string | null;
  proof?: File | null;
}

export interface RefundParams {
  amount: number;
  /** How the refund is settled: a card reversal, or credit on the account. */
  method: string;
  reason?: string | null;
}

interface ListParams {
  page?: number;
  perPage?: number;
  orderId?: number;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.orderId) query.set('filter[order_id]', String(params.orderId));
  return query.toString();
}

export const PaymentService = {
  /**
   * List payments with pagination and filters
   */
  async list(params: ListParams = {}): Promise<Paginated<PaymentData>> {
    const query = buildQueryString(params);
    const url = `/payments${query ? `?${query}` : ''}`;
    return api.get<Paginated<PaymentData>>(url);
  },

  /**
   * Get a single payment by publicId
   */
  async getById(id: string): Promise<PaymentData> {
    const response = await api.get<Single<PaymentData>>(`/payments/${id}`);
    return response.item;
  },

  /**
   * Get payments for a specific order
   */
  async getByOrderPublicId(orderPublicId: string): Promise<PaymentData[]> {
    const response = await api.get<Paginated<PaymentData>>(
      `/payments?order=${orderPublicId}&perPage=100`
    );
    return response.items;
  },

  /**
   * Process a refund for a payment (admin only). Multipart because of the
   * optional proof / signed-handover-slip evidence images.
   */
  async refund(paymentPublicId: string, data: RefundParams): Promise<RefundData> {
    const response = await api.post<Single<RefundData>>(`/payments/${paymentPublicId}/refund`, {
      amount: data.amount,
      method: data.method,
      reason: data.reason ?? null,
    });
    return response.item;
  },

  /**
   * Get refunds for a specific payment
   */
  async getRefunds(paymentPublicId: string): Promise<RefundData[]> {
    const response = await api.get<Paginated<RefundData>>(
      `/payments/${paymentPublicId}/refunds?perPage=100`
    );
    return response.items;
  },

  /**
   * Record a manual (cash / SINPE Móvil) payment for an order (admin only).
   * Multipart because of the optional proof image.
   */
  async recordPayment(orderPublicId: string, data: RecordPaymentParams): Promise<PaymentData> {
    const formData = new FormData();
    formData.append('method', data.method);
    formData.append('amount', String(data.amount));
    if (data.reference) formData.append('reference', data.reference);
    if (data.notes) formData.append('notes', data.notes);
    if (data.proof) formData.append('proof', data.proof);

    const response = await api.postMultipart<Single<PaymentData>>(
      `/orders/${orderPublicId}/payments/record`,
      formData
    );
    return response.item;
  },

  /**
   * Void a manual payment (admin only). Order reverts to unpaid and a fresh
   * collect-on-delivery intent is recreated if the order isn't terminal.
   */
  async voidPayment(paymentPublicId: string): Promise<PaymentData> {
    const response = await api.post<Single<PaymentData>>(`/payments/${paymentPublicId}/void`);
    return response.item;
  },
};
