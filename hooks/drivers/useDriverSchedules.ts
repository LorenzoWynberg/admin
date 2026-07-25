import { useQuery } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';

interface UseDriverSchedulesParams {
  /** Lower bound (YYYY-MM-DD), inclusive. Omit to fetch from the start. */
  from?: string;
  /** Upper bound (YYYY-MM-DD), inclusive. Omit to fetch to the end. */
  to?: string;
  enabled?: boolean;
}

export function useDriverSchedules(driverId: string, params: UseDriverSchedulesParams = {}) {
  const { from, to, enabled = true } = params;

  return useQuery({
    queryKey: ['drivers', driverId, 'schedules', { from, to }],
    queryFn: () => DriverService.getSchedules(driverId, { from, to }),
    enabled: enabled && !!driverId,
  });
}
