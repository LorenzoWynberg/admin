import { api } from '@/lib/api/client';

export interface AffectedOrder {
  publicId: string;
  status: 'reassigned' | 'unassigned';
  newDriverId: number | null;
  dispatchSuccess: boolean;
}

type DriverData = App.Data.Driver.DriverData;
type StoreDriverData = App.Data.Driver.StoreDriverData;
type UpdateDriverData = App.Data.Driver.UpdateDriverData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const DriverService = {
  async list(params: ListParams = {}): Promise<Paginated<DriverData>> {
    const query = buildQueryString(params);
    const url = `/drivers${query ? `?${query}` : ''}`;
    return api.get<Paginated<DriverData>>(url);
  },

  async getById(id: string): Promise<DriverData> {
    const response = await api.get<Single<DriverData>>(`/drivers/${id}`);
    return response.item;
  },

  async update(id: string, data: UpdateDriverData): Promise<DriverData> {
    const response = await api.patch<Single<DriverData>>(`/drivers/${id}`, data);
    return response.item;
  },

  async create(data: StoreDriverData): Promise<DriverData> {
    const response = await api.post<Single<DriverData>>('/drivers', data);
    return response.item;
  },

  async destroy(id: string): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/drivers/${id}`);
  },

  async getSchedules(driverId: string): Promise<{
    schedules: App.Data.Driver.DriverScheduleData[];
    overrides: App.Data.Driver.DriverScheduleOverrideData[];
  }> {
    const response = await api.get<
      Api.Response.SuccessBasic & {
        schedules: App.Data.Driver.DriverScheduleData[];
        overrides: App.Data.Driver.DriverScheduleOverrideData[];
      }
    >(`/drivers/${driverId}/schedules`);
    return { schedules: response.schedules, overrides: response.overrides };
  },

  async syncSchedules(
    driverId: string,
    schedules: App.Data.Driver.DriverScheduleData[]
  ): Promise<App.Data.Driver.DriverScheduleData[]> {
    const response = await api.put<Api.Response.Multiple<App.Data.Driver.DriverScheduleData>>(
      `/drivers/${driverId}/schedules`,
      { schedules }
    );
    return response.items;
  },

  async syncOverrides(
    driverId: string,
    overrides: App.Data.Driver.DriverScheduleOverrideData[]
  ): Promise<{
    overrides: App.Data.Driver.DriverScheduleOverrideData[];
    affectedOrders?: AffectedOrder[];
  }> {
    const response = await api.put<
      Api.Response.SuccessBasic & {
        overrides: App.Data.Driver.DriverScheduleOverrideData[];
        affectedOrders?: AffectedOrder[];
      }
    >(`/drivers/${driverId}/schedule-overrides`, { overrides });
    return {
      overrides: response.overrides,
      affectedOrders: response.affectedOrders,
    };
  },

  async syncSchedulesWithCascade(
    driverId: string,
    schedules: App.Data.Driver.DriverScheduleData[]
  ): Promise<{
    schedules: App.Data.Driver.DriverScheduleData[];
    affectedOrders?: AffectedOrder[];
  }> {
    const response = await api.put<
      Api.Response.SuccessBasic & {
        schedules: App.Data.Driver.DriverScheduleData[];
        affectedOrders?: AffectedOrder[];
      }
    >(`/drivers/${driverId}/schedules`, { schedules });
    return {
      schedules: response.schedules,
      affectedOrders: response.affectedOrders,
    };
  },
};
