import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';

interface UseOrderListParams {
  page?: number;
  perPage?: number;
  status?: string;
  excludeStatus?: string;
  excludeTerminal?: boolean;
  paymentStatus?: string;
  hasQuote?: boolean;
  collectOnDelivery?: boolean;
  search?: string;
  pickupFrom?: string;
  pickupTo?: string;
  deliveryFrom?: string;
  deliveryTo?: string;
  /** A dispatch user id, or `'unassigned'` for orders with no dispatcher */
  dispatcher?: string;
  enabled?: boolean;
}

export function useOrderList(params: UseOrderListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['orders', 'list', queryParams],
    queryFn: () => OrderService.list(queryParams),
    enabled,
  });
}
