'use client';

import { Clock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalize } from '@/utils/lang';
import { useTranslation } from 'react-i18next';

// Keep in sync with `routing.default_stop_duration_minutes` in the API.
export const DEFAULT_STOP_DURATION_MINUTES = 5;
const MAX_STOP_DURATION_MINUTES = 240;

interface QuoteStopDurationsEditorProps {
  stops: App.Data.Order.OrderStopData[];
  durations: Record<string, number>;
  onChange: (durations: Record<string, number>) => void;
}

export function QuoteStopDurationsEditor({
  stops,
  durations,
  onChange,
}: QuoteStopDurationsEditorProps) {
  const { t } = useTranslation();

  const withId = stops.filter((s) => s.publicId);
  if (withId.length === 0) return null;

  const setDuration = (publicId: string, raw: string) => {
    const parsed = parseInt(raw, 10);
    const clamped = Number.isNaN(parsed)
      ? DEFAULT_STOP_DURATION_MINUTES
      : Math.min(MAX_STOP_DURATION_MINUTES, Math.max(0, parsed));
    onChange({ ...durations, [publicId]: clamped });
  };

  const stopLabel = (stop: App.Data.Order.OrderStopData): string => {
    const type = capitalize(t(`routes:stop_types.${stop.type}`));
    const addr = stop.address?.humanReadableAddress || stop.address?.streetAddress || '';
    return addr ? `${type} — ${addr}` : type;
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Clock className="h-3.5 w-3.5" />
        {t('quotes:stop_durations.title')}
      </Label>
      <p className="text-muted-foreground text-xs">{t('quotes:stop_durations.help')}</p>
      <div className="space-y-2 rounded-lg border p-3">
        {withId.map((stop) => (
          <div key={stop.publicId} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground truncate text-sm">{stopLabel(stop)}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_STOP_DURATION_MINUTES}
                value={durations[stop.publicId!] ?? DEFAULT_STOP_DURATION_MINUTES}
                onChange={(e) => setDuration(stop.publicId!, e.target.value)}
                className="h-8 w-20 text-sm"
              />
              <span className="text-muted-foreground text-xs">
                {t('quotes:stop_durations.minutes')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
