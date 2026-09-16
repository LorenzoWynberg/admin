'use client';

import { useState } from 'react';
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
  // The committed value lives in the parent's `durations` map, but the box
  // itself is driven by this raw-string draft, not by that number — otherwise
  // an emptied box reads back as NaN, gets clamped to the default on every
  // keystroke, and React's controlled <input type="number"> re-asserts that
  // coerced value onto the DOM before the next character lands. Clamping only
  // happens on blur, which is this editor's commit point since it has no
  // dedicated save action of its own.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const withId = stops.filter((s) => s.publicId);
  if (withId.length === 0) return null;

  const draftFor = (publicId: string): string =>
    drafts[publicId] ?? String(durations[publicId] ?? DEFAULT_STOP_DURATION_MINUTES);

  const commitDuration = (publicId: string) => {
    // No draft means this box was never typed into — just tabbed through or
    // clicked and away. Committing anyway would insert the *displayed*
    // default into `durations` for a stop the admin never touched, turning
    // "let the server apply its own default" into an explicit client-sent
    // value on every blur. Only a field the admin actually edited commits.
    const raw = drafts[publicId];
    if (raw === undefined) return;

    const parsed = parseInt(raw, 10);
    const clamped = Number.isNaN(parsed)
      ? DEFAULT_STOP_DURATION_MINUTES
      : Math.min(MAX_STOP_DURATION_MINUTES, Math.max(0, parsed));
    onChange({ ...durations, [publicId]: clamped });
    // Normalize the draft to what was actually committed, so a blank or
    // out-of-range entry snaps back to a visible number once the field loses
    // focus rather than staying blank with a silently different value behind it.
    setDrafts((d) => ({ ...d, [publicId]: String(clamped) }));
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
                value={draftFor(stop.publicId!)}
                onChange={(e) => setDrafts((d) => ({ ...d, [stop.publicId!]: e.target.value }))}
                onBlur={() => commitDuration(stop.publicId!)}
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
