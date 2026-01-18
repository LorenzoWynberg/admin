import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyService } from '@/services/currencyService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { useTranslation } from 'react-i18next';

type UpdateCurrencyData = App.Data.Currency.UpdateCurrencyData;

export function useUpdateCurrency() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateCurrencyData }) =>
      CurrencyService.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success(t('resource:updated', { resource: t('models:currency_one') }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('common:error'));
      }
    },
  });
}
