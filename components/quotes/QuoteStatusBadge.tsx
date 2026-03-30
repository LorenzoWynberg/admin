'use client';

import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/utils/lang';

type QuoteStatus = App.Enums.QuoteStatus;

const statusVariants: Record<QuoteStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'default',
  rejected: 'destructive',
  expired: 'outline',
  finalized: 'default',
};

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const variant = statusVariants[status] || 'outline';
  const label = statusLabel(status);

  return <Badge variant={variant}>{label}</Badge>;
}
