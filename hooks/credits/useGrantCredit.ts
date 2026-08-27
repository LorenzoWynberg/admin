import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditService, type GrantCreditParams } from '@/services/creditService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

/**
 * Move an account's balance by hand (admin only).
 */
export function useGrantCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantCreditParams) => CreditService.grant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(crudSuccessMessage('created', 'credit'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'credit'));
      }
    },
  });
}
