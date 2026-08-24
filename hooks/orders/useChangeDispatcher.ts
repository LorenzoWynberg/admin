import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useChangeDispatcher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderPublicId,
      dispatcherId,
    }: {
      orderPublicId: string;
      dispatcherId: number | null;
    }) => OrderService.changeDispatcher(orderPublicId, dispatcherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('updated', 'order'));
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
