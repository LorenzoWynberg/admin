import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';

export function usePendingReconciliation() {
  return useQuery({
    queryKey: ['orders', 'pending-reconciliation'],
    queryFn: () => OrderService.getPendingReconciliation(),
    staleTime: 30_000,
  });
}
