import { api } from '@/lib/api/client';

type PaymentData = App.Data.Payment.PaymentData;
type RefundData = App.Data.Payment.RefundData;
type StoreRefundData = App.Data.Payment.StoreRefundData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;

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
  async getByOrderId(orderId: number): Promise<PaymentData[]> {
    const response = await api.get<Paginated<PaymentData>>(
      `/payments?filter[order_id]=${orderId}&perPage=100`
    );
    return response.items;
  },

  /**
   * Process a refund for a payment (admin only)
   */
  async refund(paymentPublicId: string, data: StoreRefundData): Promise<RefundData> {
    const response = await api.post<Single<RefundData>>(
      `/payments/${paymentPublicId}/refund`,
      data
    );
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
};
