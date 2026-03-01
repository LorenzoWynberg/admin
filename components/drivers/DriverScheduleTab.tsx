'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScheduleEventDialog } from './ScheduleEventDialog';
import { useDriverSchedules, useSyncSchedules, useSyncOverrides } from '@/hooks/drivers';
import { buildCalendarEvents, EVENT_TYPE_UNAVAILABLE } from '@/utils/scheduleEvents';
import type { CalendarEventProps } from '@/utils/scheduleEvents';
import { APP_TIMEZONE, getTodayAppTz, toAppTzComponents, padNumber } from '@/utils/format';
import { ChevronDown, Clock, Plus, Trash2 } from 'lucide-react';
import { actionLabel } from '@/utils/lang';
import { toast } from 'sonner';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;
type OverrideEntry = App.Data.Driver.DriverScheduleOverrideData;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const CALENDAR_PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin];
const CALENDAR_HEADER_TOOLBAR = {
  left: 'prev,next today',
  center: 'title',
  right: 'dayGridMonth,timeGridWeek',
};

function formatTimeHHMM(date: Date): string {
  const c = toAppTzComponents(date);
  return `${padNumber(c.hour)}:${padNumber(c.minute)}`;
}

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

  // Calendar visible range — null until FullCalendar reports its first range
  const [visibleRange, setVisibleRange] = useState<{ start: Date; end: Date } | null>(null);

  // Initialize local state from fetched data
  if (data && !initialized) {
    setSchedules(data.schedules ?? []);
    setOverrides(data.overrides ?? []);
    setInitialized(true);
  }

  // Compute calendar events when data changes
  const calendarEvents = useMemo(
    () =>
      visibleRange
        ? buildCalendarEvents(schedules, overrides, visibleRange.start, visibleRange.end)
        : [],
    [schedules, overrides, visibleRange]
  );

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setVisibleRange({ start: arg.start, end: arg.end });
  }, []);

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      const dateStr = arg.dateStr.slice(0, 10);
      const today = getTodayAppTz();
      const clickedDate = new Date(dateStr + 'T00:00:00');

      if (clickedDate < today) {
        toast.info(
          t('drivers:schedule.past_readonly', {
            defaultValue: 'Past dates cannot be modified',
          })
        );
        return;
      }

      // Extract time from the ISO string (e.g. "2026-03-01T10:00:00")
      const timeStr = arg.dateStr.length > 10 ? arg.dateStr.slice(11, 16) : undefined;

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
    (arg: EventClickArg) => {
      const props = arg.event.extendedProps as CalendarEventProps;
      const dateStr = props._date ?? arg.event.startStr.slice(0, 10);
      const today = getTodayAppTz();
      const clickedDate = new Date(dateStr + 'T00:00:00');

      if (clickedDate < today) {
        toast.info(
          t('drivers:schedule.past_readonly', {
            defaultValue: 'Past dates cannot be modified',
          })
        );
        return;
      }

      const isOverride = props._isOverride ?? false;
      const isUnavailable = props._type === EVENT_TYPE_UNAVAILABLE;

      setDialogMode('edit');
      setDialogDate(dateStr);
      setDialogIsOverride(isOverride);

      if (isUnavailable) {
        setDialogAvailable(false);
        setDialogStartTime(undefined);
        setDialogEndTime(undefined);
      } else {
        setDialogAvailable(true);
        if (arg.event.start) {
          setDialogStartTime(formatTimeHHMM(arg.event.start));
        }
        if (arg.event.end) {
          setDialogEndTime(formatTimeHHMM(arg.event.end));
        }
      }

      setDialogOpen(true);
    },
    [t]
  );

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
        <CardContent>
          <FullCalendar
            plugins={CALENDAR_PLUGINS}
            initialView="timeGridWeek"
            headerToolbar={CALENDAR_HEADER_TOOLBAR}
            firstDay={0}
            timeZone={APP_TIMEZONE}
            slotMinTime="05:00:00"
            slotMaxTime="22:00:00"
            height={800}
            events={calendarEvents}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
          />
        </CardContent>
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
