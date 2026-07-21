import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingService } from '@/services/settingService';

export function useSupportedVehicleTypes() {
  return useQuery({
    queryKey: ['settings', 'supported-vehicle-types'],
    queryFn: () => SettingService.getSupportedVehicleTypes(),
  });
}

export function useUpdateSupportedVehicleTypes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supportedVehicleTypes: string[]) =>
      SettingService.updateSupportedVehicleTypes(supportedVehicleTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'supported-vehicle-types'] });
    },
  });
}
