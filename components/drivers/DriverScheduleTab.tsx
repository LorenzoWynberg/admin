'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { viewWeek, viewMonthGrid, type CalendarEventExternal } from '@schedule-x/calendar';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScheduleEventDialog } from './ScheduleEventDialog';
import { useDriverSchedules, useSyncSchedules, useSyncOverrides } from '@/hooks/drivers';
import {
  buildCalendarEvents,
  extractDateFromTemporal,
  extractTimeFromTemporal,
} from '@/utils/scheduleEvents';
import { ChevronDown, Clock, Plus, Trash2 } from 'lucide-react';
import { actionLabel } from '@/utils/lang';
import { toast } from 'sonner';

import '@schedule-x/theme-default/dist/index.css';

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
  const [templateOpen, setTemplateOpen] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogDate, setDialogDate] = useState('');
  const [dialogStartTime, setDialogStartTime] = useState<string | undefined>();
  const [dialogEndTime, setDialogEndTime] = useState<string | undefined>();
  const [dialogIsOverride, setDialogIsOverride] = useState(false);
  const [dialogAvailable, setDialogAvailable] = useState(true);

  // Calendar visible range
  const [visibleRange, setVisibleRange] = useState<{
    start: Date;
    end: Date;
  }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  });

  // Initialize local state from fetched data
  if (data && !initialized) {
    setSchedules(data.schedules ?? []);
    setOverrides(data.overrides ?? []);
    setInitialized(true);
  }

  // Compute calendar events when data changes
  const calendarEvents = useMemo(
    () => buildCalendarEvents(schedules, overrides, visibleRange.start, visibleRange.end),
    [schedules, overrides, visibleRange]
  );

  const handleRangeUpdate = useCallback(
    (range: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime }) => {
      const start = new Date(range.start.epochMilliseconds);
      const end = new Date(range.end.epochMilliseconds);
      setVisibleRange({ start, end });
    },
    []
  );

  const handleClickDateTime = useCallback(
    (dateTime: Temporal.ZonedDateTime) => {
      const dateStr = extractDateFromTemporal(dateTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const clickedDate = new Date(dateStr + 'T00:00:00');

      if (clickedDate < today) {
        toast.info(
          t('drivers:schedule.past_readonly', {
            defaultValue: 'Past dates cannot be modified',
          })
        );
        return;
      }

      const timeStr = extractTimeFromTemporal(dateTime);
      setDialogMode('create');
      setDialogDate(dateStr);
      setDialogStartTime(timeStr);
      setDialogEndTime(undefined);
      setDialogIsOverride(false);
      setDialogAvailable(true);
      setDialogOpen(true);
    },
    [t]
  );

  const handleEventClick = useCallback(
    (event: CalendarEventExternal) => {
      const dateStr =
        (event._date as string | undefined) ??
        extractDateFromTemporal(event.start as Temporal.ZonedDateTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const clickedDate = new Date(dateStr + 'T00:00:00');

      if (clickedDate < today) {
        toast.info(
          t('drivers:schedule.past_readonly', {
            defaultValue: 'Past dates cannot be modified',
          })
        );
        return;
      }

      const isOverride = (event._isOverride as boolean | undefined) ?? false;
      const calendarId = event.calendarId ?? '';

      setDialogMode('edit');
      setDialogDate(dateStr);
      setDialogIsOverride(isOverride);

      if (calendarId === 'unavailable') {
        setDialogAvailable(false);
        setDialogStartTime(undefined);
        setDialogEndTime(undefined);
      } else {
        setDialogAvailable(true);
        if (event.start instanceof Temporal.ZonedDateTime) {
          setDialogStartTime(extractTimeFromTemporal(event.start));
        }
        if (event.end instanceof Temporal.ZonedDateTime) {
          setDialogEndTime(extractTimeFromTemporal(event.end));
        }
      }

      setDialogOpen(true);
    },
    [t]
  );

  // Ref to hold latest callbacks so calendar config stays stable
  const callbacksRef = useRef({
    onRangeUpdate: handleRangeUpdate,
    onClickDateTime: handleClickDateTime,
    onEventClick: handleEventClick,
  });
  useEffect(() => {
    callbacksRef.current = {
      onRangeUpdate: handleRangeUpdate,
      onClickDateTime: handleClickDateTime,
      onEventClick: handleEventClick,
    };
  });

  const calendar = useCalendarApp({
    views: [viewWeek, viewMonthGrid],
    defaultView: 'week',
    firstDayOfWeek: 7, // Sunday (Schedule-X: 7 = Sunday)
    dayBoundaries: { start: '05:00', end: '22:00' },
    calendars: {
      template: { colorName: 'blue', label: 'Scheduled' },
      override: { colorName: 'green', label: 'Override' },
      unavailable: { colorName: 'red', label: 'Unavailable' },
      past: { colorName: 'gray', label: 'Past', readonly: true },
    },
    callbacks: {
      onRangeUpdate: (range) => callbacksRef.current.onRangeUpdate(range),
      onClickDateTime: (dateTime) => callbacksRef.current.onClickDateTime(dateTime),
      onEventClick: (event) => callbacksRef.current.onEventClick(event),
    },
    events: calendarEvents,
  });

  // Update calendar events when they change
  useEffect(() => {
    if (calendar) {
      calendar.events.set(calendarEvents);
    }
  }, [calendar, calendarEvents]);

  // -- Override management --

  const handleSaveOverride = useCallback((override: OverrideEntry) => {
    setOverrides((prev) => {
      const dateStr = typeof override.date === 'string' ? override.date.split('T')[0] : '';
      const filtered = prev.filter((o) => {
        const d = typeof o.date === 'string' ? o.date.split('T')[0] : '';
        return d !== dateStr;
      });
      return [...filtered, override];
    });
  }, []);

  const handleDeleteOverride = useCallback(() => {
    setOverrides((prev) => {
      return prev.filter((o) => {
        const d = typeof o.date === 'string' ? o.date.split('T')[0] : '';
        return d !== dialogDate;
      });
    });
  }, [dialogDate]);

  const handleMakeUnavailable = useCallback(() => {
    const override: OverrideEntry = {
      date: dialogDate,
      available: false,
    } as OverrideEntry;
    handleSaveOverride(override);
  }, [dialogDate, handleSaveOverride]);

  const handleSaveOverrides = () => {
    syncOverrides.mutate(overrides);
  };

  // -- Template management --

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

  const handleSaveSchedules = () => {
    syncSchedules.mutate(schedules);
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
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {t('drivers:schedule.calendar_title', {
              defaultValue: 'Availability Calendar',
            })}
          </CardTitle>
          <Button onClick={handleSaveOverrides} disabled={syncOverrides.isPending} size="sm">
            {syncOverrides.isPending
              ? t('common:saving', { defaultValue: 'Saving...' })
              : actionLabel('save')}
          </Button>
        </CardHeader>
        <CardContent>{calendar && <ScheduleXCalendar calendarApp={calendar} />}</CardContent>
      </Card>

      {/* Collapsible Weekly Template Editor */}
      <Collapsible open={templateOpen} onOpenChange={setTemplateOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 hover:bg-transparent">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${templateOpen ? 'rotate-180' : ''}`}
                />
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('drivers:schedule.default_template', {
                    defaultValue: 'Default Weekly Template',
                  })}
                </CardTitle>
              </Button>
            </CollapsibleTrigger>
            <Button onClick={handleSaveSchedules} disabled={syncSchedules.isPending} size="sm">
              {syncSchedules.isPending
                ? t('common:saving', { defaultValue: 'Saving...' })
                : actionLabel('save')}
            </Button>
          </CardHeader>
          <CollapsibleContent>
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
                      {t('drivers:schedule.day_off', {
                        defaultValue: 'Day off',
                      })}
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
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Schedule Event Dialog */}
      <ScheduleEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        date={dialogDate}
        startTime={dialogStartTime}
        endTime={dialogEndTime}
        isOverride={dialogIsOverride}
        available={dialogAvailable}
        isSaving={syncOverrides.isPending}
        onSave={handleSaveOverride}
        onDelete={handleDeleteOverride}
        onMakeUnavailable={handleMakeUnavailable}
      />
    </div>
  );
}
