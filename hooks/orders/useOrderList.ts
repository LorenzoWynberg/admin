import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';

interface UseOrderListParams {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
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
