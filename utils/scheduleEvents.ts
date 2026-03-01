import type { CalendarEventExternal } from '@schedule-x/calendar';
import { getTodayAppTz } from '@/utils/format';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;
type OverrideEntry = App.Data.Driver.DriverScheduleOverrideData;

const TIMEZONE = 'America/Costa_Rica';

/** Normalize a time string to HH:MM:SS (handles HH:MM and HH:MM:SS) */
function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/**
 * Build Schedule-X calendar events from weekly templates and date overrides.
 *
 * For each day in the visible range:
 * 1. Check overrides first (date-specific exceptions)
 * 2. Fall back to weekly template
 * 3. Past dates get 'past' calendarId (gray, read-only)
 */
export function buildCalendarEvents(
  schedules: ScheduleEntry[],
  overrides: OverrideEntry[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEventExternal[] {
  const events: CalendarEventExternal[] = [];
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
    const dateStr = formatDateString(current);
    const isPast = current < today;
    const dayOfWeek = current.getDay();

    const override = overrideMap.get(dateStr);

    if (override) {
      if (!override.available) {
        // Unavailable override — red full-day event
        events.push({
          id: `override-${dateStr}`,
          start: Temporal.PlainDate.from(dateStr),
          end: Temporal.PlainDate.from(dateStr),
          title: 'Unavailable',
          calendarId: isPast ? 'past' : 'unavailable',
          _isOverride: true,
          _date: dateStr,
        });
      } else {
        // Available override with custom times
        const startTime = override.startTime || '08:00';
        const endTime = override.endTime || '17:00';
        events.push({
          id: `override-${dateStr}`,
          start: Temporal.ZonedDateTime.from(`${dateStr}T${normalizeTime(startTime)}[${TIMEZONE}]`),
          end: Temporal.ZonedDateTime.from(`${dateStr}T${normalizeTime(endTime)}[${TIMEZONE}]`),
          title: 'Scheduled',
          calendarId: isPast ? 'past' : 'override',
          _isOverride: true,
          _date: dateStr,
        });
      }
    } else {
      // Check weekly template
      const daySchedules = schedulesByDay.get(dayOfWeek);
      if (daySchedules) {
        for (const schedule of daySchedules) {
          events.push({
            id: `template-${dayOfWeek}-${dateStr}`,
            start: Temporal.ZonedDateTime.from(`${dateStr}T${normalizeTime(schedule.startTime)}[${TIMEZONE}]`),
            end: Temporal.ZonedDateTime.from(`${dateStr}T${normalizeTime(schedule.endTime)}[${TIMEZONE}]`),
            title: 'Scheduled',
            calendarId: isPast ? 'past' : 'template',
            _isOverride: false,
            _date: dateStr,
            _dayOfWeek: dayOfWeek,
          });
        }
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return events;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract date string from a Temporal.ZonedDateTime click event.
 */
export function extractDateFromTemporal(dateTime: Temporal.ZonedDateTime): string {
  return dateTime.toPlainDate().toString();
}

/**
 * Extract time string (HH:mm) from a Temporal.ZonedDateTime click event.
 */
export function extractTimeFromTemporal(dateTime: Temporal.ZonedDateTime): string {
  const hour = String(dateTime.hour).padStart(2, '0');
  const minute = String(dateTime.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}
