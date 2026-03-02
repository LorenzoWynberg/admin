import { api } from '@/lib/api/client';

type InvoiceData = App.Data.Invoice.InvoiceData;
type Paginated<T> = Api.Response.Paginated<T>;
type Single<T> = Api.Response.Single<T>;

export const InvoiceService = {
  /**
   * List invoices with pagination and filters
   */
  async list(
    params: {
      page?: number;
      perPage?: number;
      order?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<Paginated<InvoiceData>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.perPage) query.set('per_page', String(params.perPage));
    if (params.order) query.set('order', params.order);
    if (params.type) query.set('type', params.type);
    if (params.dateFrom) query.set('date_from', params.dateFrom);
    if (params.dateTo) query.set('date_to', params.dateTo);
    const qs = query.toString();
    return api.get<Paginated<InvoiceData>>(`/invoices${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get a single invoice by publicId
   */
  async getById(publicId: string): Promise<InvoiceData> {
    const response = await api.get<Single<InvoiceData>>(`/invoices/${publicId}`);
    return response.item;
  },

  /**
   * Get invoices for a specific order
   */
  async getByOrderPublicId(orderPublicId: string): Promise<InvoiceData[]> {
    const response = await api.get<Paginated<InvoiceData>>(
      `/invoices?order=${orderPublicId}&per_page=100`
    );
    return response.items;
  },

  /**
   * Get the PDF download URL for an invoice
   */
  getPdfUrl(publicId: string): string {
    return `/invoices/${publicId}/pdf`;
  },
};
