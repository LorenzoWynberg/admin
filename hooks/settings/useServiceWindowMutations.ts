import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingService } from '@/services/settingService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudSuccessMessage, crudErrorMessage } from '@/utils/lang';

type UpdateSettingData = App.Data.Setting.UpdateSettingData;

export function useUpdateServiceWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingData) => SettingService.updateServiceWindow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'service-window'] });
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
