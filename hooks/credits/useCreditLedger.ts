import { useQuery } from '@tanstack/react-query';
import { CreditService } from '@/services/creditService';

/**
 * An account's credit ledger — balance plus entry history.
 */
export function useCreditLedger(ownerPublicId?: string) {
  return useQuery({
    queryKey: ['credits', ownerPublicId ?? 'self'],
    queryFn: () => CreditService.list(ownerPublicId),
    enabled: ownerPublicId !== '',
  });
}
