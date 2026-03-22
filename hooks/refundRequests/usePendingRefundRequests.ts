import { useQuery } from '@tanstack/react-query';
import { RefundRequestService } from '@/services/refundRequestService';

export function usePendingRefundRequests() {
  return useQuery({
    queryKey: ['refund-requests', 'pending'],
    queryFn: () => RefundRequestService.list(),
    staleTime: 30_000,
  });
}
