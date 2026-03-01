import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

type Urgency = 'critical' | 'high' | 'medium' | 'low';

const urgencyStyles: Record<Urgency, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface UrgencyBadgeProps {
  urgency: Urgency;
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const { t } = useTranslation('orders');

  const label = t(`needs_attention.urgency.${urgency}`, { defaultValue: urgency });

  return (
    <Badge variant="outline" className={urgencyStyles[urgency]}>
      {label}
    </Badge>
  );
}
