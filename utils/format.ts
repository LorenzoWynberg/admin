import { es, fr, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import i18n from '@/config/i18next';

/**
 * App timezone constant. Currently Costa Rica (no DST).
 * Change this per white-label deployment.
 */
export const APP_TIMEZONE = 'America/Costa_Rica';

/**
 * Fixed UTC offset for the app timezone. Only valid for non-DST timezones.
 */
export const APP_UTC_OFFSET = '-06:00';

type AppTzComponents = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function padNumber(n: number): string {
  return n.toString().padStart(2, '0');
}

const appTzFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/**
 * Extract date/time components in the app timezone using Intl.DateTimeFormat.
 */
export function toAppTzComponents(date: Date): AppTzComponents {
  const parts = appTzFormatter.formatToParts(date);

  const map: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = Number(p.value);
  }

  // Some runtimes (pre-ES2021 / Hermes) return 24 for midnight with hour12:false
  const rawHour = map.hour ?? 0;
  return {
    year: map.year ?? 0,
    month: map.month ?? 0,
    day: map.day ?? 0,
    hour: rawHour === 24 ? 0 : rawHour,
    minute: map.minute ?? 0,
    second: map.second ?? 0,
  };
}

/**
 * Format a Date as YYYY-MM-DD in the app timezone.
 */
export function toDateString(date: Date): string {
  const c = toAppTzComponents(date);
  return `${c.year}-${padNumber(c.month)}-${padNumber(c.day)}`;
}

/**
 * Get today's midnight as a Date in the app timezone.
 * Useful for "is this date today?" comparisons.
 */
export function getTodayAppTz(): Date {
  const c = toAppTzComponents(new Date());
  return new Date(`${c.year}-${padNumber(c.month)}-${padNumber(c.day)}T00:00:00${APP_UTC_OFFSET}`);
}

const getLocale = (): string => i18n.language || 'en';

/**
 * Get date-fns locale from language code.
 */
export function getDateLocale(lang: string): Locale {
  switch (lang) {
    case 'es':
      return es;
    case 'fr':
      return fr;
    default:
      return enUS;
  }
}

/**
 * Format a number as currency with symbol and precision.
 */
export function formatCurrency(amount: number, symbol: string, precision: number = 2): string {
  return `${symbol}${amount.toFixed(precision)}`;
}

/**
 * Apply rounding to an amount based on mode and increment.
 * @param amount - The amount to round
 * @param mode - Rounding mode: 'up', 'down', or 'nearest'
 * @param increment - The rounding increment (e.g., 0.01, 1, 5)
 * @returns The rounded amount
 */
export function applyRounding(amount: number, mode: string, increment: number): number {
  if (increment <= 0) return amount;

  switch (mode) {
    case 'up':
      return Math.ceil(amount / increment) * increment;
    case 'down':
      return Math.floor(amount / increment) * increment;
    default:
      return Math.round(amount / increment) * increment;
  }
}

/**
 * Format a Date for datetime-local input (YYYY-MM-DDTHH:mm).
 */
export function toDateTimeLocal(date: Date): string {
  const c = toAppTzComponents(date);
  return `${c.year}-${padNumber(c.month)}-${padNumber(c.day)}T${padNumber(c.hour)}:${padNumber(c.minute)}`;
}

/**
 * Convert datetime-local value to ISO 8601 format for Laravel/Carbon.
 * Outputs format: 2026-01-19T02:30:00+00:00 (no milliseconds)
 */
export function dateTimeLocalToISO(dateTimeLocal: string): string {
  if (!dateTimeLocal) return '';
  // The datetime-local value is in app timezone — append the app offset directly
  return `${dateTimeLocal}:00${APP_UTC_OFFSET}`;
}

/**
 * Format an ISO date string for display.
 */
export function formatDateTime(
  isoString: string | null | undefined,
  fallback: string = '-'
): string {
  if (!isoString) return fallback;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString(getLocale(), {
      timeZone: APP_TIMEZONE,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format an ISO date string for date-only display (locale-aware).
 * e.g. "18 ene 2026" (es), "Jan 18, 2026" (en)
 */
export function formatDate(dateString: string | null | undefined, fallback: string = '-'): string {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(getLocale(), {
      timeZone: APP_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/** Extract the YYYY-MM-DD date part from a datetime string (handles both `T` and space separators). */
export function extractDatePart(date: string | undefined | null): string {
  return typeof date === 'string' ? date.split(/[T ]/)[0] : '';
}
