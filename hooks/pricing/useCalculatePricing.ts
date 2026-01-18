import { useQuery } from '@tanstack/react-query';
import { PricingService } from '@/services/pricingService';

interface CalculateResult {
  serviceFee: number;
  distanceFee: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

/**
 * Hook to calculate pricing for a given distance using the active pricing rule.
 * Only fetches when distanceKm is greater than 0.
 */
export function useCalculatePricing(distanceKm: number | null) {
  return useQuery<CalculateResult>({
    queryKey: ['pricing', 'calculate', distanceKm],
    queryFn: () => PricingService.calculate({ distanceKm: distanceKm! }),
    enabled: distanceKm !== null && distanceKm > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes - pricing rules don't change often
  });
}
