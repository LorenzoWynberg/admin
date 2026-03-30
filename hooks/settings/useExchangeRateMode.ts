import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingService } from '@/services/settingService';

export function useExchangeRateMode() {
  return useQuery({
    queryKey: ['settings', 'exchange-rate-mode'],
    queryFn: () => SettingService.getExchangeRateMode(),
  });
}

export function useUpdateExchangeRateMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: string) => SettingService.updateExchangeRateMode(mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'exchange-rate-mode'] });
    },
  });
}
