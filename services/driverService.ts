import { api } from '@/lib/api/client';

type DriverData = App.Data.Driver.DriverData;
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

  async destroy(id: string): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/drivers/${id}`);
  },
};
