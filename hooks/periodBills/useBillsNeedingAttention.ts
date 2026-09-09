import { useQuery } from '@tanstack/react-query';
import { PeriodBillService } from '@/services/periodBillService';

/**
 * Every bill that needs a person, across all accounts.
 *
 * The rows arrive ordered by the api and are handed on untouched — see
 * `BillsNeedingAttention.items` for why re-sorting them would be a defect.
 */
export function useBillsNeedingAttention() {
  return useQuery({
    queryKey: ['period-bills', 'needs-attention'],
    queryFn: () => PeriodBillService.needsAttention(),
    staleTime: 30_000,
  });
}
