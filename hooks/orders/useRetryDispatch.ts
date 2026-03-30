import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage } from '@/utils/lang';

export function useRetryDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => OrderService.retryDispatch(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order dispatched successfully.');
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'order'));
      }
    },
  });
}
