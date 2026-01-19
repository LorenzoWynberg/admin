import { api } from '@/lib/api/client';

type NotificationData = App.Data.NotificationData;
type Paginated<T> = Api.Response.Paginated<T>;

interface ListParams {
  unreadOnly?: boolean;
  perPage?: number;
  page?: number;
  search?: string;
  model?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

interface NotificationsResponse extends Paginated<NotificationData> {
  extra: {
    unread_count: number;
  };
}

export const NotificationService = {
  async list(params: ListParams = {}): Promise<NotificationsResponse> {
    const query = new URLSearchParams();
    if (params.unreadOnly) query.set('unread_only', 'true');
    if (params.perPage) query.set('per_page', String(params.perPage));
    if (params.page) query.set('page', String(params.page));
    if (params.search) query.set('search', params.search);
    if (params.model) query.set('model', params.model);
    if (params.action) query.set('action', params.action);
    if (params.fromDate) query.set('from_date', params.fromDate);
    if (params.toDate) query.set('to_date', params.toDate);

    const queryString = query.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;
    return api.get<NotificationsResponse>(url);
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await api.destroy(`/notifications/${id}`);
  },
};
