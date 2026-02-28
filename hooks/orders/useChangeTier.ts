import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useChangeTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, deliveryTier }: { publicId: string; deliveryTier: string }) =>
      OrderService.changeTier(publicId, deliveryTier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['feasibility'] });
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
