import { PaymentDestinationService } from '@/services/paymentDestinationService';
import { useResourceMutation } from '@/hooks/useResourceMutation';

type StorePaymentDestinationData = App.Data.PaymentDestination.StorePaymentDestinationData;
type UpdatePaymentDestinationData = App.Data.PaymentDestination.UpdatePaymentDestinationData;

const DESTINATION_MUTATION = {
  queryKey: 'payment-destinations',
  resource: 'payment_destination',
} as const;

export function useCreatePaymentDestination() {
  return useResourceMutation<StorePaymentDestinationData>(
    (data) => PaymentDestinationService.create(data),
    { ...DESTINATION_MUTATION, successAction: 'created', errorAction: 'creating' }
  );
}

interface UpdateArgs {
  id: number;
  data: UpdatePaymentDestinationData;
}

export function useUpdatePaymentDestination() {
  return useResourceMutation<UpdateArgs>(
    ({ id, data }) => PaymentDestinationService.update(id, data),
    { ...DESTINATION_MUTATION, successAction: 'updated', errorAction: 'updating' }
  );
}

export function useDeletePaymentDestination() {
  return useResourceMutation<number>((id) => PaymentDestinationService.destroy(id), {
    ...DESTINATION_MUTATION,
    successAction: 'deleted',
    errorAction: 'deleting',
  });
}
