'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import frLocale from '@fullcalendar/core/locales/fr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleEventDialog } from './ScheduleEventDialog';
import { useDriverSchedules, useSyncSchedules } from '@/hooks/drivers';
import { buildCalendarEvents } from '@/utils/scheduleEvents';
import type { CalendarEventProps } from '@/utils/scheduleEvents';
import {
  APP_TIMEZONE,
  extractDatePart,
  getTodayAppTz,
  toAppTzComponents,
  padNumber,
} from '@/utils/format';
import { actionLabel } from '@/utils/lang';
import { toast } from 'sonner';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;

const FC_LOCALES = [esLocale, frLocale];
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
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useDriverSchedules(driverId);
  const syncSchedules = useSyncSchedules(driverId);

  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogDate, setDialogDate] = useState('');
  const [dialogStartTime, setDialogStartTime] = useState<string | undefined>();
  const [dialogEndTime, setDialogEndTime] = useState<string | undefined>();
  const [dialogVehicleType, setDialogVehicleType] = useState<App.Enums.VehicleType | null>(null);
  // Track original startTime when editing, so we can identify which block to replace
  const [editOriginalStartTime, setEditOriginalStartTime] = useState<string | undefined>();

  // Initialize local state from fetched data
  if (data && !initialized) {
    setSchedules(data.schedules ?? []);
    setInitialized(true);
  }

  // Compute calendar events when data changes
  const scheduledLabel = t('drivers:schedule.scheduled', { defaultValue: 'Scheduled' });
  const calendarEvents = useMemo(
    () => buildCalendarEvents(schedules, scheduledLabel),
    [schedules, scheduledLabel]
  );

  const isPastDate = useCallback(
    (dateStr: string): boolean => {
      const today = getTodayAppTz();
      if (new Date(dateStr + 'T00:00:00') < today) {
        toast.info(
          t('drivers:schedule.past_readonly', {
            defaultValue: 'Past dates cannot be modified',
          })
        );
        return true;
      }
      return false;
    },
    [t]
  );

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      const dateStr = extractDatePart(arg.dateStr);
      if (isPastDate(dateStr)) return;

      const timeStr = arg.dateStr.length > 10 ? arg.dateStr.slice(11, 16) : undefined;

      setDialogMode('create');
      setDialogDate(dateStr);
      setDialogStartTime(timeStr);
      setDialogEndTime(undefined);
      setDialogVehicleType(null);
      setDialogOpen(true);
    },
    [isPastDate]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const props = arg.event.extendedProps as CalendarEventProps;
      const dateStr = props._date ?? extractDatePart(arg.event.startStr);
      if (isPastDate(dateStr)) return;

      setDialogMode('edit');
      setDialogDate(dateStr);
      setEditOriginalStartTime(props._startTime);
      setDialogVehicleType(props._vehicleType ?? null);

      if (arg.event.start) {
        setDialogStartTime(formatTimeHHMM(arg.event.start));
      }
      if (arg.event.end) {
        setDialogEndTime(formatTimeHHMM(arg.event.end));
      }

      setDialogOpen(true);
    },
    [isPastDate]
  );

  // -- Schedule management --

  const handleSaveEntry = useCallback(
    (entry: ScheduleEntry) => {
      setSchedules((prev) => {
        if (dialogMode === 'edit' && editOriginalStartTime) {
          // Replace the specific block matched by date + original start time
          const dateStr = extractDatePart(entry.date);
          return prev.map((s) => {
            if (extractDatePart(s.date) === dateStr && s.startTime === editOriginalStartTime) {
              return entry;
            }
            return s;
          });
        }
        // Create mode: append the new block
        return [...prev, entry];
      });
    },
    [dialogMode, editOriginalStartTime]
  );

  const handleDeleteEntry = useCallback(() => {
    setSchedules((prev) => {
      return prev.filter((s) => {
        // Only remove the specific block matched by date + original start time
        if (extractDatePart(s.date) === dialogDate && s.startTime === editOriginalStartTime) {
          return false;
        }
        return true;
      });
    });
  }, [dialogDate, editOriginalStartTime]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {t('drivers:schedule.calendar_title', {
              defaultValue: 'Availability Calendar',
            })}
          </CardTitle>
          <Button onClick={handleSaveSchedules} disabled={syncSchedules.isPending} size="sm">
            {syncSchedules.isPending
              ? t('common:saving', { defaultValue: 'Saving...' })
              : actionLabel('save')}
          </Button>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={CALENDAR_PLUGINS}
            locales={FC_LOCALES}
            locale={i18n.language}
            initialView="timeGridWeek"
            headerToolbar={CALENDAR_HEADER_TOOLBAR}
            firstDay={0}
            timeZone={APP_TIMEZONE}
            slotMinTime="04:00:00"
            slotMaxTime="22:00:00"
            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: true }}
            height={800}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
          />
        </CardContent>
      </Card>

      <ScheduleEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        date={dialogDate}
        startTime={dialogStartTime}
        endTime={dialogEndTime}
        vehicleType={dialogVehicleType}
        isSaving={syncSchedules.isPending}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}
