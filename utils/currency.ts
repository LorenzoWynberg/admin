/**
 * Currency conversion utilities.
 *
 * All amounts in DB are stored in base currency (CRC).
 * These helpers convert to customer currency using:
 * - Historical rate (from rates map) for paid/accepted records
 * - Live rate for pending records
 */

export interface ConversionResult {
  /** Converted amount in target currency */
  amount: number;
  /** The exchange rate used */
  rate: number;
  /** Whether historical rate was used (true) or live rate (false) */
  isHistorical: boolean;
  /** The date of the rate used (for historical) */
  rateDate?: string;
}

export interface ConversionOptions {
  /** Amount in base currency to convert */
  baseAmount: number;
  /** Map of date -> rate from API extra field */
  ratesMap?: Record<string, number>;
  /** Live rate from currencies list */
  liveRate?: number;
  /** Record's created_at date (ISO string) */
  createdAt?: string;
  /** Whether the record is finalized (paid/accepted) */
  isFinalized: boolean;
}

/**
 * Get the appropriate exchange rate for a record.
 *
 * - Finalized records (paid/accepted): use historical rate from ratesMap
 * - Pending records: use live rate
 *
 * @returns The rate and whether it's historical, or null if no rate available
 */
export function getConversionRate(options: {
  ratesMap?: Record<string, number>;
  liveRate?: number;
  createdAt?: string;
  isFinalized: boolean;
}): { rate: number; isHistorical: boolean; rateDate?: string } | null {
  const { ratesMap, liveRate, createdAt, isFinalized } = options;

  // For finalized records, try to use historical rate
  if (isFinalized && createdAt && ratesMap) {
    const date = createdAt.split('T')[0];
    const historicalRate = ratesMap[date];
    if (historicalRate && historicalRate > 0) {
      return { rate: historicalRate, isHistorical: true, rateDate: date };
    }
  }

  // Fall back to live rate
  if (liveRate && liveRate > 0) {
    return { rate: liveRate, isHistorical: false };
  }

  return null;
}

/**
 * Convert an amount from base currency to target currency.
 *
 * Uses historical rate for finalized records, live rate otherwise.
 */
export function convertToCustomerCurrency(options: ConversionOptions): ConversionResult | null {
  const { baseAmount, ratesMap, liveRate, createdAt, isFinalized } = options;

  const rateInfo = getConversionRate({ ratesMap, liveRate, createdAt, isFinalized });
  if (!rateInfo) return null;

  // Rate is stored as "target per 1 base" (e.g., 0.00204 USD per 1 CRC)
  const convertedAmount = baseAmount * rateInfo.rate;

  return {
    amount: convertedAmount,
    rate: rateInfo.rate,
    isHistorical: rateInfo.isHistorical,
    rateDate: rateInfo.rateDate,
  };
}

/**
 * Check if a record should display historical rate.
 * Paid records show the rate from their creation date.
 * Unpaid records show the current live rate.
 */
export function shouldUseHistoricalRate(record: { paymentStatus?: string }): boolean {
  return record.paymentStatus === 'paid';
}

/**
 * Format the rate for display.
 * Shows as "1 USD = 490.28 CRC" (inverse of the stored rate)
 */
export function formatRateDisplay(
  rate: number,
  targetCurrencyCode: string,
  baseCurrencyCode: string
): string {
  if (rate <= 0) return '-';
  const inverseRate = 1 / rate;
  return `1 ${targetCurrencyCode} = ${inverseRate.toFixed(2)} ${baseCurrencyCode}`;
}
