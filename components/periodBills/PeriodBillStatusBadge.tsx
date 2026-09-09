'use client';

import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

type PeriodBillStatus = App.Enums.PeriodBillStatus;

/**
 * `AwaitingVerification` gets its own colour rather than reading as paid: the
 * customer has claimed a transfer nobody has found yet, and the due date is
 * still running.
 */
const statusStyles: Record<PeriodBillStatus, string> = {
  [Enums.PeriodBillStatus.Open]: 'bg-gray-100 text-gray-700 border-gray-200',
  [Enums.PeriodBillStatus.Issued]: 'bg-blue-100 text-blue-800 border-blue-200',
  [Enums.PeriodBillStatus.AwaitingVerification]: 'bg-amber-100 text-amber-800 border-amber-200',
  [Enums.PeriodBillStatus.Paid]: 'bg-green-100 text-green-800 border-green-200',
};

interface PeriodBillStatusBadgeProps {
  status: PeriodBillStatus;
}

export function PeriodBillStatusBadge({ status }: PeriodBillStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {statusLabel(status)}
    </Badge>
  );
}
