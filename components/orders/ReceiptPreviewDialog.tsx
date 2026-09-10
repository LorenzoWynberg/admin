'use client';

import { EvidenceDialog } from '@/components/evidence/EvidenceDialog';
import { modelLabel } from '@/utils/lang';

type OrderReceiptData = App.Data.Order.OrderReceiptData;

interface ReceiptPreviewDialogProps {
  receipt: OrderReceiptData | null;
  onClose: () => void;
}

/**
 * A receipt opened full size.
 *
 * `OrderReceiptData.fileUrl` names `GET receipts/{receipt}/file`, an authorized
 * route on a disk with no public url — so the file is fetched with the token
 * attached rather than linked to, which {@link EvidenceDialog} does. Images and
 * PDFs both arrive here: a driver photographs a till slip as often as a shop
 * emails one, and before this the two were opened by different means.
 */
export function ReceiptPreviewDialog({ receipt, onClose }: ReceiptPreviewDialogProps) {
  return (
    <EvidenceDialog
      source={receipt?.fileUrl ?? null}
      title={receipt?.originalName || receipt?.publicId || ''}
      resourceLabel={modelLabel('order_receipt', 1, false)}
      onClose={onClose}
    />
  );
}
