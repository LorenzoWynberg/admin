'use client';

import { useTranslation } from 'react-i18next';
import { AlertCircle, CalendarClock, Receipt, Hourglass } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Enums } from '@/data/app-enums';

type BillAttentionReason = App.Enums.BillAttentionReason;

/**
 * Why this bill is on the queue. One row per bill, at the most urgent reason
 * it matches — a bill routinely matches several and the api picks.
 *
 * Keyed by the enum rather than by a fallback lookup: every case is listed, so
 * a case added to `BillAttentionReason` breaks the build here rather than
 * rendering an unstyled badge nobody notices.
 */
const reasonConfig: Record<BillAttentionReason, { icon: typeof AlertCircle; className: string }> = {
  [Enums.BillAttentionReason.UnresolvedCharge]: {
    icon: AlertCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  [Enums.BillAttentionReason.Overdue]: {
    icon: CalendarClock,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  [Enums.BillAttentionReason.DeclarationToVerify]: {
    icon: Receipt,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [Enums.BillAttentionReason.Quiet]: {
    icon: Hourglass,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
};

interface BillAttentionReasonBadgeProps {
  reason: BillAttentionReason;
}

export function BillAttentionReasonBadge({ reason }: BillAttentionReasonBadgeProps) {
  const { t } = useTranslation('payments');

  const { icon: Icon, className } = reasonConfig[reason];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {t(`bill_attention_reason.${reason}`)}
    </Badge>
  );
}
