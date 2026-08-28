import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SettingService } from '@/services/settingService';
import { isApiError } from '@/lib/api/error';
import { crudSuccessMessage, crudErrorMessage } from '@/utils/lang';

/**
 * How waiting time is priced.
 *
 * Read by the reconciliation screen so the admin sees what the driver's
 * recorded minutes will actually charge, before they confirm it.
 */
export function useIdleTime() {
  return useQuery({
    queryKey: ['settings', 'idle-time'],
    queryFn: () => SettingService.getIdleTime(),
  });
}

export function useUpdateIdleTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { idleMinuteRate?: number; idleGraceMinutes?: number }) =>
      SettingService.updateIdleTime(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'idle-time'] });
      toast.success(crudSuccessMessage('updated', 'setting'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'setting'));
      }
    },
  });
}
