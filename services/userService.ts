import { api } from '@/lib/api/client';

type UserData = App.Data.User.UserData;
type StoreUserData = App.Data.User.StoreUserData;
type UpdateUserData = App.Data.User.UpdateUserData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface ListParams {
  page?: number;
  perPage?: number;
  role?: string;
  search?: string;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.role) query.set('filter[role]', params.role);
  if (params.search) query.set('search', params.search);
  return query.toString();
}

export const UserService = {
  /**
   * List users with pagination and filters
   */
  async list(params: ListParams = {}): Promise<Paginated<UserData>> {
    const query = buildQueryString(params);
    const url = `/users${query ? `?${query}` : ''}`;
    return api.get<Paginated<UserData>>(url);
  },

  /**
   * Get a single user by ID
   */
  async getById(id: number): Promise<UserData> {
    const response = await api.get<Single<UserData>>(`/users/${id}`);
    return response.item;
  },

  /**
   * Create a new user
   */
  async create(data: StoreUserData): Promise<UserData> {
    const response = await api.post<Single<UserData>>('/users', data);
    return response.item;
  },

  /**
   * Update a user
   */
  async update(id: number, data: UpdateUserData): Promise<UserData> {
    const response = await api.patch<Single<UserData>>(`/users/${id}`, data);
    return response.item;
  },

  /**
   * Delete a user
   */
  async destroy(id: number): Promise<SuccessBasic> {
    return api.destroy<SuccessBasic>(`/users/${id}`);
  },
};
