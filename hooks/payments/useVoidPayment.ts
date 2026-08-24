import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '@/services/paymentService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useVoidPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentPublicId: string) => PaymentService.voidPayment(paymentPublicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('updated', 'payment'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'payment'));
      }
    },
  });
}
