import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useCalculateDistance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => OrderService.calculateDistance(publicId),
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
