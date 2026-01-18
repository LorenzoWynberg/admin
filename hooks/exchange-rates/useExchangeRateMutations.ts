import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExchangeRateService } from '@/services/exchangeRateService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { useTranslation } from 'react-i18next';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useSyncExchangeRates() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (currencies?: string[]) => ExchangeRateService.sync({ currencies }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      const { successCount, failedCount } = data.extra;
      if (failedCount > 0) {
        toast.warning(
          t('common:rates_sync_partial', {
            defaultValue: `Synced ${successCount} rates, ${failedCount} failed`,
            successCount,
            failedCount,
          })
        );
      } else {
        toast.success(crudSuccessMessage('synced', 'exchange_rate', 2));
      }
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('syncing', 'exchange_rate', 2));
      }
    },
  });
}
