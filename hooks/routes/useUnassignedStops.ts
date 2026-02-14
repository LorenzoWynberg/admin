import { useQuery } from '@tanstack/react-query';
import { RouteService } from '@/services/routeService';

interface UseUnassignedStopsParams {
  date: string;
  enabled?: boolean;
}

export function useUnassignedStops({ date, enabled = true }: UseUnassignedStopsParams) {
  return useQuery({
    queryKey: ['routes', 'unassigned-stops', date],
    queryFn: () => RouteService.unassignedStops(date),
    enabled: enabled && !!date,
  });
}
