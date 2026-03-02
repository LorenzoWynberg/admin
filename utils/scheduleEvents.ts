import type { EventInput } from '@fullcalendar/core';
import { extractDatePart, getTodayAppTz } from '@/utils/format';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;

/** Normalize a time string to HH:MM:SS (handles HH:MM and HH:MM:SS) */
function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

const COLORS = {
  scheduled: '#3b82f6',
  past: '#9ca3af',
} as const;

export interface CalendarEventProps {
  _date: string;
}

/**
 * Build FullCalendar events from date-based schedule entries.
 *
 * Each schedule entry maps directly to a calendar event.
 * Past dates get gray color (read-only).
 */
export function buildCalendarEvents(schedules: ScheduleEntry[], title = 'Scheduled'): EventInput[] {
  const events: EventInput[] = [];
  const today = getTodayAppTz();

  for (const schedule of schedules) {
    const dateStr = extractDatePart(schedule.date);
    if (!dateStr) continue;

    const isPast = new Date(dateStr + 'T00:00:00') < today;
    const color = isPast ? COLORS.past : COLORS.scheduled;

    events.push({
      id: `schedule-${dateStr}`,
      title,
      start: `${dateStr}T${normalizeTime(schedule.startTime)}`,
      end: `${dateStr}T${normalizeTime(schedule.endTime)}`,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        _date: dateStr,
      } satisfies CalendarEventProps,
    });
  }

  return events;
}
