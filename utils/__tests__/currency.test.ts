import { describe, it, expect } from 'vitest';
import {
  getConversionRate,
  convertToCustomerCurrency,
  shouldUseHistoricalRate,
  formatRateDisplay,
} from '../currency';

describe('getConversionRate', () => {
  const ratesMap = {
    '2026-01-15': 0.00204,
    '2026-01-16': 0.00205,
  };
  const liveRate = 0.0021;

  it('returns historical rate for finalized record with matching date', () => {
    const result = getConversionRate({
      ratesMap,
      liveRate,
      createdAt: '2026-01-15T10:30:00Z',
      isFinalized: true,
    });

    expect(result).toEqual({
      rate: 0.00204,
      isHistorical: true,
      rateDate: '2026-01-15',
    });
  });

  it('returns live rate for finalized record with no matching date', () => {
    const result = getConversionRate({
      ratesMap,
      liveRate,
      createdAt: '2026-01-20T10:30:00Z',
      isFinalized: true,
    });

    expect(result).toEqual({
      rate: 0.0021,
      isHistorical: false,
    });
  });

  it('returns live rate for non-finalized record', () => {
    const result = getConversionRate({
      ratesMap,
      liveRate,
      createdAt: '2026-01-15T10:30:00Z',
      isFinalized: false,
    });

    expect(result).toEqual({
      rate: 0.0021,
      isHistorical: false,
    });
  });

  it('returns null when no rates available', () => {
    const result = getConversionRate({
      ratesMap: {},
      liveRate: undefined,
      createdAt: '2026-01-15T10:30:00Z',
      isFinalized: false,
    });

    expect(result).toBeNull();
  });

  it('returns null when rate is 0', () => {
    const result = getConversionRate({
      liveRate: 0,
      isFinalized: false,
    });

    expect(result).toBeNull();
  });
});

describe('convertToCustomerCurrency', () => {
  it('converts using historical rate for finalized record', () => {
    const result = convertToCustomerCurrency({
      baseAmount: 7147.26,
      ratesMap: { '2026-01-15': 0.00204 },
      liveRate: 0.0021,
      createdAt: '2026-01-15T10:30:00Z',
      isFinalized: true,
    });

    expect(result).not.toBeNull();
    expect(result!.amount).toBeCloseTo(14.58, 2);
    expect(result!.rate).toBe(0.00204);
    expect(result!.isHistorical).toBe(true);
    expect(result!.rateDate).toBe('2026-01-15');
  });

  it('converts using live rate for pending record', () => {
    const result = convertToCustomerCurrency({
      baseAmount: 7147.26,
      ratesMap: { '2026-01-15': 0.00204 },
      liveRate: 0.0021,
      createdAt: '2026-01-15T10:30:00Z',
      isFinalized: false,
    });

    expect(result).not.toBeNull();
    expect(result!.amount).toBeCloseTo(15.01, 2);
    expect(result!.rate).toBe(0.0021);
    expect(result!.isHistorical).toBe(false);
  });

  it('returns null when no rate available', () => {
    const result = convertToCustomerCurrency({
      baseAmount: 7147.26,
      isFinalized: false,
    });

    expect(result).toBeNull();
  });
});

describe('shouldUseHistoricalRate', () => {
  it('returns true for paid records', () => {
    expect(shouldUseHistoricalRate({ paymentStatus: 'paid' })).toBe(true);
  });

  it('returns false for unpaid records', () => {
    expect(shouldUseHistoricalRate({ paymentStatus: 'unpaid' })).toBe(false);
  });

  it('returns false for pending records', () => {
    expect(shouldUseHistoricalRate({ paymentStatus: 'pending' })).toBe(false);
  });

  it('returns false for empty record', () => {
    expect(shouldUseHistoricalRate({})).toBe(false);
  });
});

describe('formatRateDisplay', () => {
  it('formats rate as inverse for display', () => {
    // 0.00204 USD per 1 CRC -> 1 USD = 490.20 CRC
    const result = formatRateDisplay(0.00204, 'USD', 'CRC');
    expect(result).toBe('1 USD = 490.20 CRC');
  });

  it('returns dash for zero rate', () => {
    expect(formatRateDisplay(0, 'USD', 'CRC')).toBe('-');
  });

  it('returns dash for negative rate', () => {
    expect(formatRateDisplay(-0.5, 'USD', 'CRC')).toBe('-');
  });
});
