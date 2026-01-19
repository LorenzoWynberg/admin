import { api } from '@/lib/api/client';

type QuoteData = App.Data.Quote.QuoteData;
type StoreQuoteData = App.Data.Quote.StoreQuoteData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  status?: string;
  orderId?: number;
  search?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.status) query.set('filter[status]', params.status);
  if (params.orderId) query.set('filter[orderId]', String(params.orderId));
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const QuoteService = {
  /**
   * List quotes with pagination and filters
   */
  async list(params: ListParams = {}): Promise<Paginated<QuoteData>> {
    const query = buildQueryString(params);
    const url = `/quotes${query ? `?${query}` : ''}`;
    return api.get<Paginated<QuoteData>>(url);
  },

  /**
   * Get a single quote by publicId
   */
  async getById(id: string): Promise<QuoteData> {
    const response = await api.get<Single<QuoteData>>(`/quotes/${id}`);
    return response.item;
  },

  /**
   * Create a new quote for an order
   */
  async create(data: StoreQuoteData): Promise<QuoteData> {
    const response = await api.post<Single<QuoteData>>('/quotes', data);
    return response.item;
  },

  /**
   * Update a quote (only draft quotes can be updated)
   */
  async update(id: string, data: Partial<StoreQuoteData>): Promise<QuoteData> {
    const response = await api.patch<Single<QuoteData>>(`/quotes/${id}`, data);
    return response.item;
  },

  /**
   * Send a quote to the customer
   */
  async send(id: string): Promise<SuccessBasic> {
    return api.post<SuccessBasic>(`/quotes/${id}/send`);
  },

  /**
   * Delete a quote (draft quotes only)
   */
  async destroy(id: string): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/quotes/${id}`);
  },
};
