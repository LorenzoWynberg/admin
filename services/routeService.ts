import { api } from '@/lib/api/client';
import { buildUrl } from '@/utils/http';

type RouteData = App.Data.Route.RouteData;
type RouteStopData = App.Data.Route.RouteStopData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  date?: string;
  status?: string;
  driverId?: number;
}

interface UnassignedStop {
  order: App.Data.Order.OrderData;
  stopType: 'pickup' | 'dropoff';
  scheduledFor: string;
}

export const RouteService = {
  async list(params: ListParams = {}): Promise<Paginated<RouteData>> {
    const url = buildUrl('/routes', {
      page: params.page,
      perPage: params.perPage,
      'filter[date]': params.date,
      'filter[status]': params.status,
      'filter[driver_id]': params.driverId,
    });
    return api.get<Paginated<RouteData>>(url);
  },

  async getById(id: string): Promise<RouteData> {
    const response = await api.get<Single<RouteData>>(`/routes/${id}`);
    return response.item;
  },

  async create(data: {
    date: string;
    driverId?: number | null;
    notes?: string | null;
  }): Promise<RouteData> {
    const response = await api.post<Single<RouteData>>('/routes', data);
    return response.item;
  },

  async update(
    id: string,
    data: {
      date?: string;
      driverId?: number | null;
      notes?: string | null;
      status?: string;
    }
  ): Promise<RouteData> {
    const response = await api.patch<Single<RouteData>>(`/routes/${id}`, data);
    return response.item;
  },

  async destroy(id: string): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/routes/${id}`);
  },

  async addStop(
    routeId: string,
    data: { orderId: number; type: 'pickup' | 'dropoff' }
  ): Promise<RouteStopData> {
    const response = await api.post<Single<RouteStopData>>(`/routes/${routeId}/stops`, data);
    return response.item;
  },

  async removeStop(routeId: string, stopId: number): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/routes/${routeId}/stops/${stopId}`);
  },

  async reorderStops(routeId: string, stopIds: number[]): Promise<RouteData> {
    const response = await api.patch<Single<RouteData>>(`/routes/${routeId}/stops/reorder`, {
      stopIds,
    });
    return response.item;
  },

  async unassignedStops(date: string): Promise<UnassignedStop[]> {
    const url = buildUrl('/routes/unassigned-stops', { date });
    const response = await api.get<{ items: UnassignedStop[] }>(url);
    return response.items ?? [];
  },

  async optimizeRoute(routeId: string): Promise<RouteData> {
    const response = await api.post<Single<RouteData>>(`/routes/${routeId}/optimize`);
    return response.item;
  },

  async batchAddStops(
    routeId: string,
    data: { stops: { orderId: number; type: 'pickup' | 'dropoff' }[]; optimize: boolean }
  ): Promise<RouteData> {
    const response = await api.post<Single<RouteData>>(`/routes/${routeId}/stops/batch`, data);
    return response.item;
  },

  async createRouteWithStops(data: {
    date: string;
    driverId?: number | null;
    stops: { orderId: number; type: 'pickup' | 'dropoff' }[];
    optimize: boolean;
  }): Promise<RouteData> {
    const response = await api.post<Single<RouteData>>('/routes/create-with-stops', data);
    return response.item;
  },
};

export type { UnassignedStop };
