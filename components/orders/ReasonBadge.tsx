import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Users, Clock, CalendarX, Loader } from 'lucide-react';

const reasonConfig: Record<string, { icon: typeof Users; className: string }> = {
  no_drivers_available: { icon: Users, className: 'bg-red-50 text-red-700 border-red-200' },
  window_too_tight: { icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  schedule_conflict: {
    icon: CalendarX,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  awaiting_dispatch: { icon: Loader, className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

interface ReasonBadgeProps {
  reason: string;
}

export function ReasonBadge({ reason }: ReasonBadgeProps) {
  const { t } = useTranslation('orders');

  const config = reasonConfig[reason] ?? reasonConfig['awaiting_dispatch'];
  const Icon = config.icon;
  const label = t(`needs_attention.reason.${reason}`, { defaultValue: reason });

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
