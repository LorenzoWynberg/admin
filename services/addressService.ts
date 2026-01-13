import { api } from '@/lib/api/client';

type AddressData = App.Data.Address.AddressData;
type Paginated<T> = Api.Response.Paginated<T>;

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

export const AddressService = {
  async list(params: ListParams = {}): Promise<Paginated<AddressData>> {
    const query = buildQueryString(params);
    const url = `/addresses${query ? `?${query}` : ''}`;
    return api.get<Paginated<AddressData>>(url);
  },
};
