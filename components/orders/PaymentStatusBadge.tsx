'use client';

import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/utils/lang';

type PaymentStatus = App.Enums.PaymentStatus;

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: 'bg-gray-100 text-gray-600 border-gray-200',
  authorized: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  refund_due: 'bg-orange-100 text-orange-800 border-orange-200',
  refunded: 'bg-blue-100 text-blue-800 border-blue-200',
  surcharge_due: 'bg-amber-100 text-amber-800 border-amber-200',
  paid_in_full: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  reconciled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  voided: 'bg-gray-100 text-gray-600 border-gray-200',
  chargeback: 'bg-red-100 text-red-800 border-red-200',
};

interface PaymentStatusBadgeProps {
  status?: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const resolvedStatus = status || 'unpaid';

  return (
    <Badge variant="outline" className={paymentStyles[resolvedStatus]}>
      {statusLabel(resolvedStatus)}
    </Badge>
  );
}
