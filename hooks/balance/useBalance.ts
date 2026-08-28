import { useQuery } from '@tanstack/react-query';
import { BalanceService } from '@/services/balanceService';

/**
 * An account's credit ledger — balance plus entry history.
 */
export function useBalance(ownerPublicId?: string) {
  return useQuery({
    queryKey: ['balance', ownerPublicId ?? 'self'],
    queryFn: () => BalanceService.list(ownerPublicId),
    enabled: ownerPublicId !== '',
  });
}
