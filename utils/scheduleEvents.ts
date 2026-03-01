import type { EventInput } from '@fullcalendar/core';
import { getTodayAppTz, toDateString, toAppTzComponents } from '@/utils/format';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;
type OverrideEntry = App.Data.Driver.DriverScheduleOverrideData;

/** Normalize a time string to HH:MM:SS (handles HH:MM and HH:MM:SS) */
function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

const COLORS = {
  template: '#3b82f6',
  override: '#22c55e',
  unavailable: '#ef4444',
  past: '#9ca3af',
} as const;

export const EVENT_TYPE_UNAVAILABLE = 'unavailable' as const;

export interface CalendarEventProps {
  _date: string;
  _isOverride: boolean;
  _type?: typeof EVENT_TYPE_UNAVAILABLE;
  _dayOfWeek?: number;
}

/**
 * Build FullCalendar events from weekly templates and date overrides.
 *
 * For each day in the visible range:
 * 1. Check overrides first (date-specific exceptions)
 * 2. Fall back to weekly template
 * 3. Past dates get gray color (read-only)
 */
export function buildCalendarEvents(
  schedules: ScheduleEntry[],
  overrides: OverrideEntry[],
  rangeStart: Date,
  rangeEnd: Date
): EventInput[] {
  const events: EventInput[] = [];
  const today = getTodayAppTz();

  // Index overrides by date string for fast lookup
  const overrideMap = new Map<string, OverrideEntry>();
  for (const override of overrides) {
    const dateStr = typeof override.date === 'string' ? override.date.split('T')[0] : '';
    overrideMap.set(dateStr, override);
  }

  // Index schedules by day of week
  const schedulesByDay = new Map<number, ScheduleEntry[]>();
  for (const schedule of schedules) {
    const existing = schedulesByDay.get(schedule.dayOfWeek) ?? [];
    existing.push(schedule);
    schedulesByDay.set(schedule.dayOfWeek, existing);
  }

  // Iterate each day in the range
  const current = new Date(rangeStart);
  current.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dateStr = toDateString(current);
    const isPast = current < today;
    // Use app timezone to get the correct day-of-week (device TZ may differ)
    const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay();

    const override = overrideMap.get(dateStr);

    if (override) {
      if (!override.available) {
        // Unavailable override — red background event
        events.push({
          id: `override-${dateStr}`,
          title: 'Unavailable',
          start: dateStr,
          end: dateStr,
          allDay: true,
          display: 'background',
          backgroundColor: isPast ? COLORS.past : COLORS.unavailable,
          borderColor: isPast ? COLORS.past : COLORS.unavailable,
          extendedProps: {
            _isOverride: true,
            _date: dateStr,
            _type: EVENT_TYPE_UNAVAILABLE,
          } satisfies CalendarEventProps,
        });
      } else {
        // Available override with custom times
        const startTime = override.startTime || '08:00';
        const endTime = override.endTime || '17:00';
        const color = isPast ? COLORS.past : COLORS.override;
        events.push({
          id: `override-${dateStr}`,
          title: 'Scheduled',
          start: `${dateStr}T${normalizeTime(startTime)}`,
          end: `${dateStr}T${normalizeTime(endTime)}`,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            _isOverride: true,
            _date: dateStr,
          } satisfies CalendarEventProps,
        });
      }
    } else {
      // Check weekly template
      const daySchedules = schedulesByDay.get(dayOfWeek);
      if (daySchedules) {
        for (const schedule of daySchedules) {
          const color = isPast ? COLORS.past : COLORS.template;
          events.push({
            id: `template-${dayOfWeek}-${dateStr}`,
            title: 'Scheduled',
            start: `${dateStr}T${normalizeTime(schedule.startTime)}`,
            end: `${dateStr}T${normalizeTime(schedule.endTime)}`,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              _isOverride: false,
              _date: dateStr,
              _dayOfWeek: dayOfWeek,
            } satisfies CalendarEventProps,
          });
        }
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return events;
}

