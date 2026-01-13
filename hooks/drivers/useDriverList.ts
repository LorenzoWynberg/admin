import { useQuery } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';

interface UseDriverListParams {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

export function useDriverList(params: UseDriverListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['drivers', 'list', queryParams],
    queryFn: () => DriverService.list(queryParams),
    enabled,
  });
}
