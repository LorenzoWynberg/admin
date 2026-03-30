import { useQuery } from '@tanstack/react-query';
import { RouteService } from '@/services/routeService';

interface UseRouteParams {
  id: string;
  enabled?: boolean;
}

export function useRoute({ id, enabled = true }: UseRouteParams) {
  return useQuery({
    queryKey: ['routes', 'detail', id],
    queryFn: () => RouteService.getById(id),
    enabled: enabled && !!id,
  });
}
