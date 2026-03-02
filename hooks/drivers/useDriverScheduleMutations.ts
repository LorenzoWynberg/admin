import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DriverService, type AffectedOrder } from '@/services/driverService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';
import { useTranslation } from 'react-i18next';

function showAffectedOrdersToast(
  affectedOrders: AffectedOrder[],
  t: (key: string, opts?: Record<string, unknown>) => string
): void {
  if (affectedOrders.length === 0) return;

  const reassigned = affectedOrders.filter((o) => o.dispatchSuccess);
  const failed = affectedOrders.filter((o) => !o.dispatchSuccess);

  if (reassigned.length > 0) {
    toast.success(
      t('drivers:schedule.orders_reassigned', {
        defaultValue: '{{count}} order(s) reassigned',
        count: reassigned.length,
      })
    );
  }

  if (failed.length > 0) {
    toast.warning(
      t('drivers:schedule.orders_failed_reassign', {
        defaultValue: '{{count}} order(s) could not be reassigned',
        count: failed.length,
      })
    );
  }
}

export function useSyncSchedules(driverId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (schedules: App.Data.Driver.DriverScheduleData[]) =>
      DriverService.syncSchedules(driverId, schedules),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers', driverId, 'schedules'] });
      toast.success(crudSuccessMessage('updated', 'driver'));

      if (data.affectedOrders?.length) {
        showAffectedOrdersToast(data.affectedOrders, t);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'driver'));
      }
    },
  });
}
