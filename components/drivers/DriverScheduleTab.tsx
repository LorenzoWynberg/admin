'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useDriverSchedules, useSyncSchedules, useSyncOverrides } from '@/hooks/drivers';
import { Plus, Trash2, CalendarDays, Clock } from 'lucide-react';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;
type OverrideEntry = App.Data.Driver.DriverScheduleOverrideData;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface Props {
  driverId: string;
}

export function DriverScheduleTab({ driverId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useDriverSchedules(driverId);
  const syncSchedules = useSyncSchedules(driverId);
  const syncOverrides = useSyncOverrides(driverId);

  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [overrides, setOverrides] = useState<OverrideEntry[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize local state from fetched data
  if (data && !initialized) {
    setSchedules(data.schedules ?? []);
    setOverrides(data.overrides ?? []);
    setInitialized(true);
  }

  const addScheduleEntry = (dayOfWeek: number) => {
    setSchedules((prev) => [
      ...prev,
      { dayOfWeek, startTime: '08:00', endTime: '17:00' } as ScheduleEntry,
    ]);
  };

  const removeScheduleEntry = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateScheduleEntry = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedules((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const addOverride = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setOverrides((prev) => [...prev, { date: dateStr, available: false } as OverrideEntry]);
  };

  const removeOverride = (index: number) => {
    setOverrides((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOverride = (index: number, field: keyof OverrideEntry, value: unknown) => {
    setOverrides((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleSaveSchedules = () => {
    syncSchedules.mutate(schedules);
  };

  const handleSaveOverrides = () => {
    syncOverrides.mutate(overrides);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  // Group schedule entries by day
  const schedulesByDay = DAYS.map((_, dayIndex) =>
    schedules
      .map((entry, originalIndex) => ({ entry, originalIndex }))
      .filter(({ entry }) => entry.dayOfWeek === dayIndex)
  );

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('drivers:schedule.weekly', { defaultValue: 'Weekly Schedule' })}
          </CardTitle>
          <Button onClick={handleSaveSchedules} disabled={syncSchedules.isPending} size="sm">
            {syncSchedules.isPending
              ? t('common:saving', { defaultValue: 'Saving...' })
              : t('common:save', { defaultValue: 'Save' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((dayName, dayIndex) => (
            <div key={dayName} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{dayName}</Label>
                <Button variant="ghost" size="sm" onClick={() => addScheduleEntry(dayIndex)}>
                  <Plus className="mr-1 h-3 w-3" />
                  {t('common:add', { defaultValue: 'Add' })}
                </Button>
              </div>
              {schedulesByDay[dayIndex].length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  {t('drivers:schedule.day_off', { defaultValue: 'Day off' })}
                </p>
              ) : (
                schedulesByDay[dayIndex].map(({ entry, originalIndex }) => (
                  <div key={originalIndex} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) =>
                        updateScheduleEntry(originalIndex, 'startTime', e.target.value)
                      }
                      className="w-28"
                    />
                    <span className="text-muted-foreground text-sm">—</span>
                    <Input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) =>
                        updateScheduleEntry(originalIndex, 'endTime', e.target.value)
                      }
                      className="w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeScheduleEntry(originalIndex)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('drivers:schedule.overrides', { defaultValue: 'Date Overrides' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addOverride}>
              <Plus className="mr-1 h-3 w-3" />
              {t('common:add', { defaultValue: 'Add' })}
            </Button>
            <Button onClick={handleSaveOverrides} disabled={syncOverrides.isPending} size="sm">
              {syncOverrides.isPending
                ? t('common:saving', { defaultValue: 'Saving...' })
                : t('common:save', { defaultValue: 'Save' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {overrides.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">
              {t('drivers:schedule.no_overrides', { defaultValue: 'No date overrides' })}
            </p>
          ) : (
            overrides.map((override, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                <Input
                  type="date"
                  value={typeof override.date === 'string' ? override.date.split('T')[0] : ''}
                  onChange={(e) => updateOverride(index, 'date', e.target.value)}
                  className="w-40"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={override.available}
                    onCheckedChange={(checked) => updateOverride(index, 'available', checked)}
                  />
                  <Badge variant={override.available ? 'default' : 'secondary'}>
                    {override.available
                      ? t('drivers:schedule.available', { defaultValue: 'Available' })
                      : t('drivers:schedule.unavailable', { defaultValue: 'Unavailable' })}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8"
                  onClick={() => removeOverride(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
