import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BalanceService, type AdjustBalanceParams } from '@/services/balanceService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

/**
 * Move an account's balance by hand (admin only).
 */
export function useAdjustBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustBalanceParams) => BalanceService.grant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(crudSuccessMessage('created', 'balance_entry'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'balance_entry'));
      }
    },
  });
}
