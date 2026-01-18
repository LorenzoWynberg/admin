import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  applyRounding,
  toDateTimeLocal,
  dateTimeLocalToISO,
  formatDateTime,
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
  it('formats date for datetime-local input', () => {
    const date = new Date(2026, 0, 18, 14, 30); // Jan 18, 2026 14:30
    expect(toDateTimeLocal(date)).toBe('2026-01-18T14:30');
  });

  it('pads single digit months and days', () => {
    const date = new Date(2026, 0, 5, 9, 5); // Jan 5, 2026 09:05
    expect(toDateTimeLocal(date)).toBe('2026-01-05T09:05');
  });

  it('handles midnight', () => {
    const date = new Date(2026, 11, 31, 0, 0); // Dec 31, 2026 00:00
    expect(toDateTimeLocal(date)).toBe('2026-12-31T00:00');
  });
});

describe('dateTimeLocalToISO', () => {
  it('converts datetime-local to Laravel/Carbon compatible format', () => {
    const result = dateTimeLocalToISO('2026-01-18T14:30');
    // Should output without milliseconds and with +00:00 timezone for Carbon
    expect(result).toMatch(/2026-01-18T\d{2}:30:00\+00:00/);
  });

  it('returns empty string for empty input', () => {
    expect(dateTimeLocalToISO('')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats ISO string for display', () => {
    const result = formatDateTime('2026-01-18T14:30:00.000Z');
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
