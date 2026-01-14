import { api } from '@/lib/api/client';

type CatalogData = App.Data.Catalog.CatalogData;
type CatalogElementData = App.Data.CatalogElement.CatalogElementData;
type StoreCatalogElementData = App.Data.CatalogElement.StoreCatalogElementData;
type UpdateCatalogElementData = App.Data.CatalogElement.UpdateCatalogElementData;
type Single<T> = Api.Response.Single<T>;
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

export const CatalogService = {
  async list(params: ListParams = {}): Promise<Paginated<CatalogData>> {
    const query = buildQueryString(params);
    const url = `/catalogs${query ? `?${query}` : ''}`;
    return api.get<Paginated<CatalogData>>(url);
  },

  async getById(id: number): Promise<CatalogData> {
    const response = await api.get<Single<CatalogData>>(`/catalogs/${id}`);
    return response.item;
  },

  async getElementsByCode(code: string): Promise<Paginated<CatalogElementData>> {
    return api.get<Paginated<CatalogElementData>>(`/catalogs/${code}/elements/translated`);
  },

  // Element CRUD
  async createElement(catalogId: number, data: Omit<StoreCatalogElementData, 'catalogId'>): Promise<CatalogElementData> {
    const response = await api.post<Single<CatalogElementData>>(`/catalogs/${catalogId}/elements`, data);
    return response.item;
  },

  async updateElement(catalogId: number, elementId: number, data: Omit<UpdateCatalogElementData, 'catalogId'>): Promise<CatalogElementData> {
    const response = await api.patch<Single<CatalogElementData>>(`/catalogs/${catalogId}/elements/${elementId}`, data);
    return response.item;
  },

  async deleteElement(catalogId: number, elementId: number): Promise<void> {
    await api.destroy(`/catalogs/${catalogId}/elements/${elementId}`);
  },
};
