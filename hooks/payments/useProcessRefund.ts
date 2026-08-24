import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, type RefundParams } from '@/services/paymentService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface RefundArgs {
  paymentPublicId: string;
  data: RefundParams;
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentPublicId, data }: RefundArgs) =>
      PaymentService.refund(paymentPublicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('created', 'refund'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'refund'));
      }
    },
  });
}
