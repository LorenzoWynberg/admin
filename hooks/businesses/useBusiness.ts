import { useQuery } from '@tanstack/react-query';
import { BusinessService } from '@/services/businessService';

interface UseBusinessParams {
  enabled?: boolean;
}

export function useBusiness(id: string, params: UseBusinessParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['businesses', 'detail', id],
    queryFn: () => BusinessService.getById(id),
    enabled: enabled && !!id,
  });
}
