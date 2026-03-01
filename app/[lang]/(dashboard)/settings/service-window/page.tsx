'use client';

import { ChevronLeft, Clock } from 'lucide-react';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { actionLabel } from '@/utils/lang';
import { useServiceWindow, useUpdateServiceWindow } from '@/hooks/settings';

type SettingData = App.Data.Setting.SettingData;

export default function ServiceWindowPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const { data, isLoading } = useServiceWindow();

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {actionLabel('back')}
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {t('common:service_window', { defaultValue: 'Service Window' })}
        </h1>
        <p className="text-muted-foreground">
          {t('common:service_window_description', {
            defaultValue: 'Configure operating hours for the delivery service',
          })}
        </p>
      </div>

      {isLoading || !data ? (
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      ) : (
        <ServiceWindowForm data={data} />
      )}
    </div>
  );
}

function ServiceWindowForm({ data }: { data: SettingData }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateServiceWindow();

  const [enabled, setEnabled] = useState(data.serviceWindowEnabled);
  const [noServiceStart, setNoServiceStart] = useState(data.noServiceStart.slice(0, 5));
  const [noServiceEnd, setNoServiceEnd] = useState(data.noServiceEnd.slice(0, 5));

  const isDirty =
    enabled !== data.serviceWindowEnabled ||
    noServiceStart !== data.noServiceStart.slice(0, 5) ||
    noServiceEnd !== data.noServiceEnd.slice(0, 5);

  const handleSave = () => {
    updateMutation.mutate({
      noServiceStart,
      noServiceEnd,
      serviceWindowEnabled: enabled,
    });
  };

  const getVisualSummary = () => {
    if (!enabled) {
      return t('common:service_window_disabled_summary', {
        defaultValue: 'Service window is disabled. Orders can be placed at any time.',
      });
    }

    return t('common:operating_hours_info', {
      defaultValue: 'Operating Hours: {{start}} - {{end}}',
      start: noServiceEnd,
      end: noServiceStart,
    });
  };

  return (
    <>
      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('common:service_window_enabled', { defaultValue: 'Service window enabled' })}
          </CardTitle>
          <CardDescription>
            {t('common:service_window_enabled_description', {
              defaultValue: 'When enabled, orders cannot be scheduled during closed hours',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <span className="text-sm">
              {enabled
                ? t('common:enabled', { defaultValue: 'Enabled' })
                : t('common:disabled', { defaultValue: 'Disabled' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card className={!enabled ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle>{t('common:operating_hours', { defaultValue: 'Operating Hours' })}</CardTitle>
          <CardDescription>{getVisualSummary()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="noServiceStart">
                {t('common:service_closes_at', { defaultValue: 'Service closes at' })}
              </Label>
              <Input
                id="noServiceStart"
                type="time"
                value={noServiceStart}
                onChange={(e) => setNoServiceStart(e.target.value)}
                disabled={!enabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noServiceEnd">
                {t('common:service_opens_at', { defaultValue: 'Service opens at' })}
              </Label>
              <Input
                id="noServiceEnd"
                type="time"
                value={noServiceEnd}
                onChange={(e) => setNoServiceEnd(e.target.value)}
                disabled={!enabled}
              />
            </div>
          </div>

          {/* Visual Timeline */}
          {enabled && (
            <div className="rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">
                {t('common:time', { defaultValue: 'Time' })}
              </div>
              <div className="flex h-8 overflow-hidden rounded">
                <TimelineBar start={noServiceEnd} end={noServiceStart} />
              </div>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending
            ? t('common:loading', { defaultValue: 'Loading...' })
            : actionLabel('save')}
        </Button>
      </div>
    </>
  );
}

/**
 * Renders a visual 24h timeline bar showing open (green) and closed (red) hours.
 */
function TimelineBar({ start, end }: { start: string; end: string }) {
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const openStart = toMinutes(start);
  const closeStart = toMinutes(end);
  const totalMinutes = 24 * 60;

  const segments: { color: string; width: number }[] = [];

  if (openStart < closeStart) {
    if (openStart > 0) {
      segments.push({
        color: 'bg-red-400 dark:bg-red-600',
        width: (openStart / totalMinutes) * 100,
      });
    }
    segments.push({
      color: 'bg-green-400 dark:bg-green-600',
      width: ((closeStart - openStart) / totalMinutes) * 100,
    });
    if (closeStart < totalMinutes) {
      segments.push({
        color: 'bg-red-400 dark:bg-red-600',
        width: ((totalMinutes - closeStart) / totalMinutes) * 100,
      });
    }
  } else {
    if (closeStart > 0) {
      segments.push({
        color: 'bg-green-400 dark:bg-green-600',
        width: (closeStart / totalMinutes) * 100,
      });
    }
    segments.push({
      color: 'bg-red-400 dark:bg-red-600',
      width: ((openStart - closeStart) / totalMinutes) * 100,
    });
    if (openStart < totalMinutes) {
      segments.push({
        color: 'bg-green-400 dark:bg-green-600',
        width: ((totalMinutes - openStart) / totalMinutes) * 100,
      });
    }
  }

  return (
    <>
      {segments.map((seg, i) => (
        <div key={i} className={`${seg.color} h-full`} style={{ width: `${seg.width}%` }} />
      ))}
    </>
  );
}
