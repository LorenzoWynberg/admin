import { useQuery } from '@tanstack/react-query';
import { PeriodBillService } from '@/services/periodBillService';

/** One bill, with its lines and per-currency totals. */
export function usePeriodBill(publicId: string) {
  return useQuery({
    queryKey: ['period-bills', publicId],
    queryFn: () => PeriodBillService.getById(publicId),
    enabled: publicId !== '',
  });
}
