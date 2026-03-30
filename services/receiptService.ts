import { api } from '@/lib/api/client';

type OrderReceiptData = App.Data.Order.OrderReceiptData;
type Multiple<T> = Api.Response.Multiple<T>;

export const ReceiptService = {
  /**
   * Get receipts uploaded for a specific order
   */
  async getByOrderPublicId(orderPublicId: string): Promise<OrderReceiptData[]> {
    const response = await api.get<Multiple<OrderReceiptData>>(`/orders/${orderPublicId}/receipts`);
    return response.items;
  },
};
