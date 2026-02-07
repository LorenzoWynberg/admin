import { useQuery } from '@tanstack/react-query';
import { RouteService } from '@/services/routeService';

interface UseRouteListParams {
  page?: number;
  perPage?: number;
  date?: string;
  status?: string;
  driverId?: number;
  enabled?: boolean;
}

export function useRouteList(params: UseRouteListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['routes', 'list', queryParams],
    queryFn: () => RouteService.list(queryParams),
    enabled,
  });
}
