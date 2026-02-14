import { useQuery } from '@tanstack/react-query';
import { SettingService } from '@/services/settingService';

export function useServiceWindow() {
  return useQuery({
    queryKey: ['settings', 'service-window'],
    queryFn: () => SettingService.getServiceWindow(),
  });
}
