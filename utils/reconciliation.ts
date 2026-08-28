/**
 * What waiting time costs: minutes reported by the driver, priced at the
 * configured rate.
 *
 * Rounded to cents here rather than left to the caller — the API computes the
 * same product server-side, and a client estimate that disagrees with the
 * charge by a cent is a support ticket.
 */
export function idleCharge(minutes: number, ratePerMinute: number): number {
  if (!Number.isFinite(minutes) || !Number.isFinite(ratePerMinute)) return 0;
  if (minutes <= 0 || ratePerMinute <= 0) return 0;

  return Math.round(minutes * ratePerMinute * 100) / 100;
}

/**
 * What the driver's recorded waiting adds up to across an order's stops.
 *
 * Mirrors the API: the free allowance is given at every stop, not once over
 * the order — handing a parcel over takes a few minutes at each door, and
 * spending the allowance at the first stop would bill normal work at the
 * second.
 */
export function chargeableWaitMinutes(
  stopWaits: (number | null | undefined)[],
  freeMinutesPerStop: number
): number {
  const free = Number.isFinite(freeMinutesPerStop) ? Math.max(0, freeMinutesPerStop) : 0;

  return stopWaits.reduce<number>((sum, waited) => {
    const minutes = Number.isFinite(waited) ? (waited as number) : 0;
    return sum + Math.max(0, minutes - free);
  }, 0);
}

export interface ReconciliationQuoteFields {
  baseFare?: number | null;
  distanceFee?: number | null;
  taxRate?: number | null;
  total?: number | null;
}

export interface ReconciliationFeeOverrides {
  timeFee: number;
  surcharge: number;
  discountRate: number;
}

export interface ReconciliationTotals {
  serviceFees: number;
  newItemsTotal: number;
  newSubtotal: number;
  discountAmount: number;
  newSubtotalAfterDiscount: number;
  taxTotal: number;
  estimatedTotal: number;
  delta: number;
}

/**
 * Mirror the API's reconciliation total formula:
 *   subtotal = serviceFees + itemsTotal
 *   discount = subtotal × discountRate
 *   subtotalAfterDiscount = subtotal - discount
 *   taxTotal = subtotalAfterDiscount × taxRate
 *   total = subtotalAfterDiscount + taxTotal
 *
 * Base fare and distance fee come from the original quote; time fee,
 * surcharge, and discount rate are admin-adjustable at reconciliation.
 * All amounts are in base currency (CRC).
 */
export function computeReconciliationTotal(
  quote: ReconciliationQuoteFields,
  newItemsTotal: number,
  overrides: ReconciliationFeeOverrides
): ReconciliationTotals {
  const serviceFees =
    (quote.baseFare ?? 0) + (quote.distanceFee ?? 0) + overrides.timeFee + overrides.surcharge;
  const newSubtotal = serviceFees + newItemsTotal;
  const discountAmount = Math.round(newSubtotal * overrides.discountRate * 100) / 100;
  const newSubtotalAfterDiscount = newSubtotal - discountAmount;
  const taxRate = quote.taxRate ?? 0;
  const taxTotal = Math.round(newSubtotalAfterDiscount * taxRate * 100) / 100;
  const estimatedTotal = Math.round((newSubtotalAfterDiscount + taxTotal) * 100) / 100;
  const originalQuoteTotal = quote.total ?? 0;
  const delta = Math.round((estimatedTotal - originalQuoteTotal) * 100) / 100;

  return {
    serviceFees,
    newItemsTotal,
    newSubtotal,
    discountAmount,
    newSubtotalAfterDiscount,
    taxTotal,
    estimatedTotal,
    delta,
  };
}
