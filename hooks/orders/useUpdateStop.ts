import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface UpdateStopParams {
  orderPublicId: string;
  stopId: number;
  data: Record<string, unknown>;
}

export function useUpdateStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderPublicId, stopId, data }: UpdateStopParams) =>
      OrderService.updateStop(orderPublicId, stopId, data),
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
