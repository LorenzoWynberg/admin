import { useQuery } from '@tanstack/react-query';
import { ReceiptService } from '@/services/receiptService';

interface UseOrderReceiptsParams {
  orderPublicId: string;
  enabled?: boolean;
}

export function useOrderReceipts({ orderPublicId, enabled = true }: UseOrderReceiptsParams) {
  return useQuery({
    queryKey: ['receipts', 'order', orderPublicId],
    queryFn: () => ReceiptService.getByOrderPublicId(orderPublicId),
    enabled: enabled && !!orderPublicId,
  });
}
