import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage } from '@/utils/lang';

export function useNeedsAttention() {
  return useQuery({
    queryKey: ['orders', 'needs-attention'],
    queryFn: () => OrderService.getNeedsAttention(),
    staleTime: 30_000,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, reason }: { publicId: string; reason: string }) =>
      OrderService.cancelOrder(publicId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'needs-attention'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order canceled');
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
