import { useQuery } from '@tanstack/react-query';
import { PaymentService } from '@/services/paymentService';

interface UseOrderPaymentsParams {
  orderId: number;
  enabled?: boolean;
}

export function useOrderPayments({ orderId, enabled = true }: UseOrderPaymentsParams) {
  return useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => PaymentService.getByOrderId(orderId),
    enabled: enabled && !!orderId,
  });
}
