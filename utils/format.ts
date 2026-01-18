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
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Convert datetime-local value to ISO 8601 format for Laravel/Carbon.
 * Outputs format: 2026-01-19T02:30:00+00:00 (no milliseconds)
 */
export function dateTimeLocalToISO(dateTimeLocal: string): string {
  if (!dateTimeLocal) return '';
  const date = new Date(dateTimeLocal);
  // Remove milliseconds and replace Z with +00:00 for Carbon compatibility
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
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
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
