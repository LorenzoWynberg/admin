'use client';

import { useTranslation } from 'react-i18next';
import { CheckCircle, ExternalLink, CircleDashed, AlertTriangle } from 'lucide-react';

interface DispatchSummaryBarProps {
  assigned: number;
  outsourced: number;
  unassigned: number;
  flagged: number;
}

export function DispatchSummaryBar({
  assigned,
  outsourced,
  unassigned,
  flagged,
}: DispatchSummaryBarProps) {
  const { t } = useTranslation();

  const items = [
    {
      label: t('routes:summary.assigned', { defaultValue: 'Assigned' }),
      count: assigned,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: t('routes:summary.outsourced', { defaultValue: 'Outsourced' }),
      count: outsourced,
      icon: ExternalLink,
      color: 'text-orange-600',
    },
    {
      label: t('routes:summary.unassigned', { defaultValue: 'Unassigned' }),
      count: unassigned,
      icon: CircleDashed,
      color: 'text-gray-500',
    },
    {
      label: t('routes:summary.flagged', { defaultValue: 'Flagged' }),
      count: flagged,
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="bg-muted/50 flex flex-wrap items-center gap-4 rounded-lg border px-4 py-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon className={`h-4 w-4 ${item.color}`} />
          <span className="text-sm font-medium">{item.count}</span>
          <span className="text-muted-foreground text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
