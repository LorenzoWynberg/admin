import { useQuery } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';

interface UseDriverParams {
  enabled?: boolean;
}

export function useDriver(id: number, params: UseDriverParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['drivers', 'detail', id],
    queryFn: () => DriverService.getById(id),
    enabled: enabled && id > 0,
  });
}
