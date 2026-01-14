'use client';

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

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
  const { t } = useTranslation();

  const variant = statusVariants[status] || 'outline';
  const label = t(`quotes:status.${status}`, { defaultValue: status });

  return <Badge variant={variant}>{label}</Badge>;
}
