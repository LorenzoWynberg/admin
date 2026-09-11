import { useQuery } from '@tanstack/react-query';
import { PaymentDestinationService } from '@/services/paymentDestinationService';

/** Every destination, active and deactivated alike. */
export function usePaymentDestinations() {
  return useQuery({
    queryKey: ['payment-destinations'],
    queryFn: () => PaymentDestinationService.list(),
  });
}
