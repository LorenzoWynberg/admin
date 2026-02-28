import { useQuery } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';

export function useDriverSchedules(driverId: string) {
  return useQuery({
    queryKey: ['drivers', driverId, 'schedules'],
    queryFn: () => DriverService.getSchedules(driverId),
    enabled: !!driverId,
  });
}
