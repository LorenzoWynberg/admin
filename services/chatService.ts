import { api } from '@/lib/api/client';

type OrderMessageData = App.Data.Chat.OrderMessageData;
type SuccessBasic = Api.Response.SuccessBasic;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.mandados.test:60';

export const ChatService = {
  async getMessages(
    orderPublicId: string,
    channel: string,
    beforeId?: number
  ): Promise<OrderMessageData[]> {
    const params = beforeId ? `?before_id=${beforeId}` : '';
    const response = await api.get<{ item: OrderMessageData[] }>(
      `/orders/${orderPublicId}/chat/${channel}${params}`
    );
    return response.item;
  },

  async sendMessage(
    orderPublicId: string,
    channel: string,
    data: { body?: string; image?: File }
  ): Promise<OrderMessageData> {
    // Need to use FormData for file upload, bypass the normal JSON api client
    const formData = new FormData();
    if (data.body) formData.append('body', data.body);
    if (data.image) formData.append('image', data.image);

    // Get token from localStorage
    const token = getToken();
    const response = await fetch(
      `${API_URL}/orders/${orderPublicId}/chat/${channel}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    );
    if (!response.ok) throw new Error('Failed to send message');
    const json = await response.json();
    return json.item;
  },

  async markRead(
    orderPublicId: string,
    channel: string,
    lastReadMessageId: number
  ): Promise<SuccessBasic> {
    return api.post<SuccessBasic>(
      `/orders/${orderPublicId}/chat/${channel}/read`,
      { lastReadMessageId }
    );
  },

  async getUnreadCounts(
    orderPublicId: string
  ): Promise<{ support: number; delivery: number }> {
    const response = await api.get<{
      item: { support: number; delivery: number };
    }>(`/orders/${orderPublicId}/chat-unread`);
    return response.item;
  },
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('admin-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}
