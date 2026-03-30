import { useQuery } from '@tanstack/react-query';
import { PaymentService } from '@/services/paymentService';

interface UseOrderPaymentsParams {
  orderPublicId: string;
  enabled?: boolean;
}

export function useOrderPayments({ orderPublicId, enabled = true }: UseOrderPaymentsParams) {
  return useQuery({
    queryKey: ['payments', 'order', orderPublicId],
    queryFn: () => PaymentService.getByOrderPublicId(orderPublicId),
    enabled: enabled && !!orderPublicId,
  });
}
