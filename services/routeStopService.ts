import { api } from '@/lib/api/client';

type Single<T> = Api.Response.Single<T>;

interface ReassignStopParams {
  targetRouteId?: number | null;
  newDriverId?: number | null;
  date?: string | null;
  optimize?: boolean;
}

interface FlagDelayParams {
  reason: string;
}

export const RouteStopService = {
  async reassign(stopId: number, data: ReassignStopParams): Promise<App.Data.Route.RouteData> {
    const response = await api.post<Single<App.Data.Route.RouteData>>(
      `/route-stops/${stopId}/reassign`,
      data
    );
    return response.item;
  },

  async flagDelay(stopId: number, data: FlagDelayParams): Promise<App.Data.Route.RouteStopData> {
    const response = await api.post<Single<App.Data.Route.RouteStopData>>(
      `/route-stops/${stopId}/flag-delay`,
      data
    );
    return response.item;
  },
};
