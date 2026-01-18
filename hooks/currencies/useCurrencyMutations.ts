import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyService } from '@/services/currencyService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

type UpdateCurrencyData = App.Data.Currency.UpdateCurrencyData;

export function useUpdateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateCurrencyData }) =>
      CurrencyService.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success(crudSuccessMessage('updated', 'currency'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'currency'));
      }
    },
  });
}
