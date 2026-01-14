import { useQuery } from '@tanstack/react-query';
import { PricingService } from '@/services/pricingService';

interface UsePricingRuleListParams {
  page?: number;
  perPage?: number;
  currency?: string;
  enabled?: boolean;
}

export function usePricingRuleList(params: UsePricingRuleListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['pricing-rules', 'list', queryParams],
    queryFn: () => PricingService.list(queryParams),
    enabled,
  });
}
