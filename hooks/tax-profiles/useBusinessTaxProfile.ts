import { useQuery } from '@tanstack/react-query';
import { TaxProfileService } from '@/services/taxProfileService';

export function useBusinessTaxProfile(businessPid: string) {
  return useQuery({
    queryKey: ['tax-profiles', 'business', businessPid],
    queryFn: () => TaxProfileService.getForBusiness(businessPid),
    enabled: !!businessPid,
  });
}
