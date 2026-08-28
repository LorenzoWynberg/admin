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

export interface StopWait {
  /** What the stop actually took, driver-reported or measured. */
  waitMinutes?: number | null;
  /** What it was quoted for — the allowance it is measured against. */
  estimatedMinutes?: number | null;
}

/**
 * What the driver's recorded time adds up to across an order's stops.
 *
 * Mirrors the API: each stop is measured against its own estimate, because
 * forty minutes at a supermarket run is the job and forty minutes at a parcel
 * drop is waiting. The tolerance sits on top of the estimate and applies at
 * every stop — nobody hits an estimate exactly, and one order-wide allowance
 * spent at the first stop would bill normal work at the second.
 */
export function chargeableWaitMinutes(stops: StopWait[], toleranceMinutes: number): number {
  const tolerance = Number.isFinite(toleranceMinutes) ? Math.max(0, toleranceMinutes) : 0;

  return stops.reduce<number>((sum, stop) => {
    const waited = Number.isFinite(stop.waitMinutes) ? (stop.waitMinutes as number) : 0;
    const estimate = Number.isFinite(stop.estimatedMinutes) ? (stop.estimatedMinutes as number) : 0;

    return sum + Math.max(0, waited - estimate - tolerance);
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
