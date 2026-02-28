import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

export function useSyncSchedules(driverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: App.Data.Driver.DriverScheduleData[]) =>
      DriverService.syncSchedules(driverId, schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', driverId, 'schedules'] });
      toast.success(crudSuccessMessage('updated', 'driver'));
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

export function useSyncOverrides(driverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrides: App.Data.Driver.DriverScheduleOverrideData[]) =>
      DriverService.syncOverrides(driverId, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', driverId, 'schedules'] });
      toast.success(crudSuccessMessage('updated', 'driver'));
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
