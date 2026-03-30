import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage } from '@/utils/lang';

interface ReconcileParams {
  orderPublicId: string;
  items: { orderStopId?: number | null; label: string; quantity: number; unitPrice: number }[];
  notes?: string | null;
}

export function useReconcileOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderPublicId, items, notes }: ReconcileParams) =>
      OrderService.reconcile(orderPublicId, { items, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
