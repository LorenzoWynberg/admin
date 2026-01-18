import { api } from '@/lib/api/client';

type OrderData = App.Data.Order.OrderData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.status) query.set('filter[status]', params.status);
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const OrderService = {
  /**
   * List orders with pagination and filters
   */
  async list(params: ListParams = {}): Promise<Paginated<OrderData>> {
    const query = buildQueryString(params);
    const url = `/orders${query ? `?${query}` : ''}`;
    return api.get<Paginated<OrderData>>(url);
  },

  /**
   * Get a single order by ID
   */
  async getById(id: number): Promise<OrderData> {
    const response = await api.get<Single<OrderData>>(`/orders/${id}`);
    return response.item;
  },

  /**
   * Delete an order (admin only)
   */
  async destroy(id: number): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/orders/${id}`);
  },
};
