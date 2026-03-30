import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';

interface UseOrderParams {
  id: string;
  enabled?: boolean;
}

export function useOrder({ id, enabled = true }: UseOrderParams) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => OrderService.getById(id),
    enabled: enabled && !!id,
  });
}
