import { api } from '@/lib/api/client';

type OrderMessageData = App.Data.Chat.OrderMessageData;
type SuccessBasic = Api.Response.SuccessBasic;
type Single<T> = Api.Response.Single<T>;
type ChatUnreadCounts = Record<string, number>;

export const ChatService = {
  async getMessages(
    orderPublicId: string,
    channel: string,
    beforeId?: number
  ): Promise<OrderMessageData[]> {
    const params = beforeId ? `?beforeId=${beforeId}` : '';
    const response = await api.get<{ items: OrderMessageData[] }>(
      `/orders/${orderPublicId}/chat/${channel}${params}`
    );
    return response.items;
  },

  async sendMessage(
    orderPublicId: string,
    channel: string,
    data: { body?: string; image?: File }
  ): Promise<OrderMessageData> {
    // FormData for the optional image, via the shared client's multipart
    // method rather than the JSON one.
    const formData = new FormData();
    if (data.body) formData.append('body', data.body);
    if (data.image) formData.append('image', data.image);

    const response = await api.postMultipart<Single<OrderMessageData>>(
      `/orders/${orderPublicId}/chat/${channel}`,
      formData
    );
    return response.item;
  },

  async markRead(
    orderPublicId: string,
    channel: string,
    lastReadMessageId: number
  ): Promise<SuccessBasic> {
    return api.post<SuccessBasic>(`/orders/${orderPublicId}/chat/${channel}/read`, {
      lastReadMessageId,
    });
  },

  async getUnreadCounts(orderPublicId: string): Promise<ChatUnreadCounts> {
    return api.get<ChatUnreadCounts>(`/orders/${orderPublicId}/chat-unread`);
  },
};
