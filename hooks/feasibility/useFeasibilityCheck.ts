import { useQuery } from '@tanstack/react-query';
import { FeasibilityService } from '@/services/feasibilityService';

interface UseFeasibilityCheckParams {
  orderPublicId: string;
  enabled?: boolean;
}

export function useFeasibilityCheck({ orderPublicId, enabled = true }: UseFeasibilityCheckParams) {
  return useQuery({
    queryKey: ['feasibility', orderPublicId],
    queryFn: () => FeasibilityService.check(orderPublicId),
    enabled: enabled && !!orderPublicId,
    gcTime: 0,
  });
}
