import { api } from '@/lib/api/client';

type BusinessData = App.Data.Business.BusinessData;
type UpdateBusinessData = App.Data.Business.UpdateBusinessData;
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

export const BusinessService = {
  async list(params: ListParams = {}): Promise<Paginated<BusinessData>> {
    const query = buildQueryString(params);
    const url = `/businesses${query ? `?${query}` : ''}`;
    return api.get<Paginated<BusinessData>>(url);
  },

  async getById(id: number): Promise<BusinessData> {
    const response = await api.get<Single<BusinessData>>(`/businesses/${id}`);
    return response.item;
  },

  async update(id: number, data: UpdateBusinessData): Promise<BusinessData> {
    const response = await api.patch<Single<BusinessData>>(`/businesses/${id}`, { body: data });
    return response.item;
  },

  async destroy(id: number): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/businesses/${id}`);
  },
};
