import { useQuery } from '@tanstack/react-query';
import { InvoiceService } from '@/services/invoiceService';

interface UseOrderInvoicesParams {
  orderPublicId: string;
  enabled?: boolean;
}

export function useOrderInvoices({ orderPublicId, enabled = true }: UseOrderInvoicesParams) {
  return useQuery({
    queryKey: ['invoices', 'order', orderPublicId],
    queryFn: () => InvoiceService.getByOrderPublicId(orderPublicId),
    enabled: enabled && !!orderPublicId,
  });
}
