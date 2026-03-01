import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  applyRounding,
  toDateTimeLocal,
  dateTimeLocalToISO,
  formatDateTime,
  formatDate,
  APP_TIMEZONE,
  APP_UTC_OFFSET,
  toAppTzComponents,
  getTodayAppTz,
} from '../format';

describe('formatCurrency', () => {
  it('formats amount with symbol and default precision (2)', () => {
    expect(formatCurrency(100, '$')).toBe('$100.00');
    expect(formatCurrency(99.99, '€')).toBe('€99.99');
  });

  it('formats amount with custom precision', () => {
    expect(formatCurrency(100, '$', 0)).toBe('$100');
    expect(formatCurrency(100, '$', 3)).toBe('$100.000');
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0, '₡')).toBe('₡0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-50.5, '$')).toBe('$-50.50');
  });

  it('handles large amounts', () => {
    expect(formatCurrency(1000000.99, '$')).toBe('$1000000.99');
  });

  it('handles small decimal amounts', () => {
    expect(formatCurrency(0.01, '$')).toBe('$0.01');
    expect(formatCurrency(0.001, '$', 3)).toBe('$0.001');
  });

  it('rounds to specified precision', () => {
    expect(formatCurrency(10.999, '$', 2)).toBe('$11.00');
    expect(formatCurrency(10.994, '$', 2)).toBe('$10.99');
  });
});

describe('applyRounding', () => {
  describe('nearest mode (default)', () => {
    it('rounds to nearest increment', () => {
      expect(applyRounding(10.3, 'nearest', 1)).toBe(10);
      expect(applyRounding(10.5, 'nearest', 1)).toBe(11);
      expect(applyRounding(10.7, 'nearest', 1)).toBe(11);
    });

    it('rounds to nearest 5', () => {
      expect(applyRounding(12, 'nearest', 5)).toBe(10);
      expect(applyRounding(13, 'nearest', 5)).toBe(15);
    });

    it('rounds to nearest 0.25', () => {
      expect(applyRounding(10.1, 'nearest', 0.25)).toBe(10);
      expect(applyRounding(10.2, 'nearest', 0.25)).toBe(10.25);
    });
  });

  describe('up mode', () => {
    it('always rounds up', () => {
      expect(applyRounding(10.1, 'up', 1)).toBe(11);
      expect(applyRounding(10.9, 'up', 1)).toBe(11);
      expect(applyRounding(10, 'up', 1)).toBe(10);
    });

    it('rounds up to nearest 5', () => {
      expect(applyRounding(11, 'up', 5)).toBe(15);
      expect(applyRounding(10, 'up', 5)).toBe(10);
    });

    it('rounds up to nearest 0.01', () => {
      expect(applyRounding(10.001, 'up', 0.01)).toBe(10.01);
    });
  });

  describe('down mode', () => {
    it('always rounds down', () => {
      expect(applyRounding(10.1, 'down', 1)).toBe(10);
      expect(applyRounding(10.9, 'down', 1)).toBe(10);
      expect(applyRounding(11, 'down', 1)).toBe(11);
    });

    it('rounds down to nearest 5', () => {
      expect(applyRounding(14, 'down', 5)).toBe(10);
      expect(applyRounding(15, 'down', 5)).toBe(15);
    });

    it('rounds down to nearest 0.01', () => {
      expect(applyRounding(10.019, 'down', 0.01)).toBe(10.01);
    });
  });

  describe('edge cases', () => {
    it('returns amount unchanged when increment is 0', () => {
      expect(applyRounding(10.5, 'up', 0)).toBe(10.5);
    });

    it('returns amount unchanged when increment is negative', () => {
      expect(applyRounding(10.5, 'up', -1)).toBe(10.5);
    });

    it('handles unknown mode as nearest', () => {
      expect(applyRounding(10.3, 'unknown', 1)).toBe(10);
      expect(applyRounding(10.7, 'invalid', 1)).toBe(11);
    });

    it('handles zero amount', () => {
      expect(applyRounding(0, 'up', 5)).toBe(0);
      expect(applyRounding(0, 'down', 5)).toBe(0);
    });

    it('handles negative amounts', () => {
      expect(applyRounding(-10.3, 'up', 1)).toBe(-10);
      expect(applyRounding(-10.7, 'down', 1)).toBe(-11);
    });
  });
});

describe('toDateTimeLocal', () => {
  it('formats date in app timezone for datetime-local input', () => {
    // 2026-01-18T20:30:00Z = 14:30 in CR (UTC-6)
    const date = new Date('2026-01-18T20:30:00Z');
    expect(toDateTimeLocal(date)).toBe('2026-01-18T14:30');
  });

  it('pads single digit months and days', () => {
    // 2026-01-05T15:05:00Z = 09:05 in CR
    const date = new Date('2026-01-05T15:05:00Z');
    expect(toDateTimeLocal(date)).toBe('2026-01-05T09:05');
  });

  it('handles midnight in app timezone', () => {
    // 2026-12-31T06:00:00Z = 00:00 in CR
    const date = new Date('2026-12-31T06:00:00Z');
    expect(toDateTimeLocal(date)).toBe('2026-12-31T00:00');
  });

  it('handles date boundary crossing', () => {
    // 2026-01-19T03:00:00Z = 2026-01-18T21:00 in CR
    const date = new Date('2026-01-19T03:00:00Z');
    expect(toDateTimeLocal(date)).toBe('2026-01-18T21:00');
  });
});

describe('dateTimeLocalToISO', () => {
  it('appends app timezone offset to datetime-local value', () => {
    const result = dateTimeLocalToISO('2026-01-18T14:30');
    expect(result).toBe('2026-01-18T14:30:00-06:00');
  });

  it('returns empty string for empty input', () => {
    expect(dateTimeLocalToISO('')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats ISO string for display in app timezone', () => {
    const result = formatDateTime('2026-01-18T14:30:00.000Z');
    // 14:30 UTC = 08:30 CR, still Jan 18
    expect(result).toMatch(/Jan 18/);
  });

  it('returns fallback for null input', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
  });

  it('returns custom fallback when provided', () => {
    expect(formatDateTime(null, 'N/A')).toBe('N/A');
  });

  it('returns original string for invalid date', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDate', () => {
  it('formats ISO string for display in app timezone', () => {
    const result = formatDate('2026-01-18T14:30:00.000Z');
    expect(result).toMatch(/Jan 18.*2026/);
  });

  it('handles date boundary — UTC next day is still previous day in CR', () => {
    // 2026-01-19T03:00:00Z = Jan 18 in CR (UTC-6)
    const result = formatDate('2026-01-19T03:00:00.000Z');
    expect(result).toMatch(/Jan 18.*2026/);
  });

  it('returns fallback for null input', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns custom fallback when provided', () => {
    expect(formatDate(null, 'N/A')).toBe('N/A');
  });

  it('returns original string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('APP_TIMEZONE', () => {
  it('exports the app timezone constant', () => {
    expect(APP_TIMEZONE).toBe('America/Costa_Rica');
  });

  it('exports the app UTC offset constant', () => {
    expect(APP_UTC_OFFSET).toBe('-06:00');
  });
});

describe('toAppTzComponents', () => {
  it('extracts components in app timezone (UTC-6)', () => {
    // 2026-01-15T18:30:00Z = 2026-01-15T12:30:00 in CR
    const date = new Date('2026-01-15T18:30:00Z');
    const c = toAppTzComponents(date);
    expect(c.year).toBe(2026);
    expect(c.month).toBe(1);
    expect(c.day).toBe(15);
    expect(c.hour).toBe(12);
    expect(c.minute).toBe(30);
    expect(c.second).toBe(0);
  });

  it('handles date boundary crossing', () => {
    // 2026-01-16T03:00:00Z = 2026-01-15T21:00:00 in CR
    const date = new Date('2026-01-16T03:00:00Z');
    const c = toAppTzComponents(date);
    expect(c.day).toBe(15);
    expect(c.hour).toBe(21);
  });

  it('handles midnight in app timezone', () => {
    // 2026-01-16T06:00:00Z = 2026-01-16T00:00:00 in CR
    const date = new Date('2026-01-16T06:00:00Z');
    const c = toAppTzComponents(date);
    expect(c.day).toBe(16);
    expect(c.hour).toBe(0);
  });
});

describe('getTodayAppTz', () => {
  it('returns midnight of today in app timezone', () => {
    vi.useFakeTimers();
    // 2026-01-15T18:30:00Z = 12:30 CR on Jan 15
    vi.setSystemTime(new Date('2026-01-15T18:30:00Z'));
    const today = getTodayAppTz();
    // Should be 2026-01-15T00:00:00-06:00 = 2026-01-15T06:00:00Z
    expect(today.toISOString()).toBe('2026-01-15T06:00:00.000Z');
    vi.useRealTimers();
  });

  it('handles date boundary — early UTC is still previous day in CR', () => {
    vi.useFakeTimers();
    // 2026-01-16T03:00:00Z = 21:00 CR on Jan 15
    vi.setSystemTime(new Date('2026-01-16T03:00:00Z'));
    const today = getTodayAppTz();
    // Should be 2026-01-15T00:00:00-06:00 = 2026-01-15T06:00:00Z
    expect(today.toISOString()).toBe('2026-01-15T06:00:00.000Z');
    vi.useRealTimers();
  });
});
