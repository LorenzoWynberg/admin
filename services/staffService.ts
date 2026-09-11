import { api } from '@/lib/api/client';

type UserData = App.Data.User.UserData;
type StoreStaffData = App.Data.User.StoreStaffData;
type Single<T> = Api.Response.Single<T>;

/**
 * Creates a `dispatch` or `admin` colleague account. Unlike `UserService.create`
 * (`POST /users`), this never carries a password — the API generates a
 * temporary one, sets `must_change_password`, and emails an invite. See
 * `StoreStaffData` in `types/generated.d.ts`.
 */
export const StaffService = {
  async create(data: StoreStaffData): Promise<UserData> {
    const response = await api.post<Single<UserData>>('/staff', data);
    return response.item;
  },
};
