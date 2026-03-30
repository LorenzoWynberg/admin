import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface CreateStopParams {
  orderPublicId: string;
  data: Record<string, unknown>;
}

export function useCreateStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderPublicId, data }: CreateStopParams) =>
      OrderService.createStop(orderPublicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(crudSuccessMessage('created', 'order_stop'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'order_stop'));
      }
    },
  });
}
