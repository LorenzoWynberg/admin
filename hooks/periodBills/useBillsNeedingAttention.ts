import { useQuery } from '@tanstack/react-query';
import { PeriodBillService } from '@/services/periodBillService';

/**
 * Every bill that needs a person, across all accounts.
 *
 * The rows arrive ordered by the api and are handed on untouched — see
 * `BillsNeedingAttention.items` for why re-sorting them would be a defect.
 *
 * This key is also invalidated by `useNeedsAttentionBroadcast` (in
 * `hooks/orders/`) on the shared `admin` channel — this queue updates live,
 * not just after the acting admin's own settle/approve/reject.
 */
export function useBillsNeedingAttention() {
  return useQuery({
    queryKey: ['period-bills', 'needs-attention'],
    queryFn: () => PeriodBillService.needsAttention(),
    staleTime: 30_000,
  });
}
