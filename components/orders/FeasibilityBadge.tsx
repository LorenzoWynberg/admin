import { useTranslation } from 'react-i18next';
import { Enums } from '@/data/app-enums';
import { Badge } from '@/components/ui/badge';

type FeasibilityLevel = App.Enums.FeasibilityLevel;

const LEVEL_CONFIG: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive'; className: string }
> = {
  [Enums.FeasibilityLevel.Green]: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  [Enums.FeasibilityLevel.Yellow]: {
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  [Enums.FeasibilityLevel.Red]: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

interface FeasibilityBadgeProps {
  level: FeasibilityLevel;
  candidateCount: number;
}

export function FeasibilityBadge({ level, candidateCount }: FeasibilityBadgeProps) {
  const { t } = useTranslation('quotes');

  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[Enums.FeasibilityLevel.Red];

  const label =
    level === Enums.FeasibilityLevel.Green
      ? t('feasibility.green', {
          count: candidateCount,
          defaultValue: `${candidateCount} drivers available`,
        })
      : level === Enums.FeasibilityLevel.Yellow
        ? t('feasibility.yellow', { defaultValue: '1 driver available' })
        : t('feasibility.red', { defaultValue: 'No drivers available' });

  return (
    <Badge variant={config.variant} className={config.className}>
      {label}
    </Badge>
  );
}
