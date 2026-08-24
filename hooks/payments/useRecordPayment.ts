import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, type RecordPaymentParams } from '@/services/paymentService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface RecordPaymentArgs {
  orderPublicId: string;
  data: RecordPaymentParams;
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderPublicId, data }: RecordPaymentArgs) =>
      PaymentService.recordPayment(orderPublicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('created', 'payment'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'payment'));
      }
    },
  });
}
