import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/orderService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';
import i18next from '@/config/i18next';

export function useAssignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderPublicId, driverId }: { orderPublicId: string; driverId: number }) =>
      OrderService.assign(orderPublicId, driverId),
    onSuccess: ({ eligibility }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['feasibility'] });

      toast.success(crudSuccessMessage('updated', 'order'));

      if (eligibility && !eligibility.eligible && eligibility.reason) {
        toast.warning(i18next.t(`drivers:eligibility_reasons.${eligibility.reason}`));
      }
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
