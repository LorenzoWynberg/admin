import { Badge } from '@/components/ui/badge';
import { Enums } from '@/data/app-enums';
import { useTranslation } from 'react-i18next';

const urgencyStyles: Record<string, string> = {
  [Enums.AttentionUrgency.Critical]: 'bg-red-100 text-red-800 border-red-200',
  [Enums.AttentionUrgency.High]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Enums.AttentionUrgency.Medium]: 'bg-amber-100 text-amber-800 border-amber-200',
  [Enums.AttentionUrgency.Low]: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface UrgencyBadgeProps {
  urgency: string;
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
