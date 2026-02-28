import { api } from '@/lib/api/client';

type OrderData = App.Data.Order.OrderData;
type RouteStopData = App.Data.Route.RouteStopData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
  pickupFrom?: string;
  pickupTo?: string;
  deliveryFrom?: string;
  deliveryTo?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.status) query.set('filter[status]', params.status);
  if (params.search) query.set('search', params.search);
  if (params.pickupFrom) query.set('pickupFrom', params.pickupFrom);
  if (params.pickupTo) query.set('pickupTo', params.pickupTo);
  if (params.deliveryFrom) query.set('deliveryFrom', params.deliveryFrom);
  if (params.deliveryTo) query.set('deliveryTo', params.deliveryTo);
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
   * Get a single order by publicId
   */
  async getById(id: string): Promise<OrderData> {
    const response = await api.get<Single<OrderData>>(`/orders/${id}`);
    return response.item;
  },

  /**
   * Get proof of delivery for a completed order
   */
  async getPod(id: string): Promise<RouteStopData | null> {
    try {
      const response = await api.get<Single<RouteStopData>>(`/orders/${id}/pod`);
      return response.item;
    } catch {
      return null;
    }
  },

  /**
   * Delete an order (admin only)
   */
  async destroy(id: string): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/orders/${id}`);
  },

  /**
   * Calculate distance for an order based on its stops
   */
  async calculateDistance(publicId: string): Promise<OrderData> {
    const response = await api.post<Single<OrderData>>(`/orders/${publicId}/calculate-distance`);
    return response.item;
  },

  /**
   * Change order delivery tier (admin only)
   */
  async changeTier(publicId: string, deliveryTier: string): Promise<OrderData> {
    const response = await api.patch<Single<OrderData>>(`/orders/${publicId}/tier`, {
      delivery_tier: deliveryTier,
    });
    return response.item;
  },

  /**
   * Manually outsource an order to external provider (admin only)
   */
  async outsource(publicId: string): Promise<OrderData> {
    const response = await api.post<Single<OrderData>>(`/orders/${publicId}/outsource`);
    return response.item;
  },

  /**
   * Update a stop on an order
   */
  async updateStop(
    orderPublicId: string,
    stopId: number,
    data: Record<string, unknown>
  ): Promise<App.Data.Order.OrderStopData> {
    const response = await api.patch<Single<App.Data.Order.OrderStopData>>(
      `/orders/${orderPublicId}/stops/${stopId}`,
      data
    );
    return response.item;
  },
};
