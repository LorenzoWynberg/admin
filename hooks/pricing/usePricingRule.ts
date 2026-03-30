import { useQuery } from '@tanstack/react-query';
import { PricingService } from '@/services/pricingService';

interface UsePricingRuleParams {
  id?: number;
  enabled?: boolean;
}

export function usePricingRule(params: UsePricingRuleParams) {
  const { id, enabled = true } = params;

  return useQuery({
    queryKey: ['pricing-rules', 'detail', id],
    queryFn: () => PricingService.getById(id!),
    enabled: enabled && id !== undefined,
  });
}
