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
 * Minutes at one stop that are actually billable.
 *
 * Mirrors the API: a normal stop is already covered by the base fare, so the
 * included allowance comes off before anything is charged. Only time the
 * customer asked the driver to spend beyond an ordinary stop is time they pay
 * for.
 */
export function billableMinutes(minutes: number | null | undefined, included: number): number {
  const spent = Number.isFinite(minutes) ? (minutes as number) : 0;
  const free = Number.isFinite(included) ? Math.max(0, included) : 0;

  return Math.max(0, spent - free);
}

/**
 * Billable minutes across a set of stops — the admin's estimates when
 * quoting, the driver's recorded times when reconciling. One arithmetic on
 * both sides is the point: a day that went to plan prices exactly as quoted.
 */
export function totalBillableMinutes(
  stopMinutes: (number | null | undefined)[],
  included: number
): number {
  return stopMinutes.reduce<number>((sum, minutes) => sum + billableMinutes(minutes, included), 0);
}

/**
 * Whether the day differed from the estimate by enough to re-price it.
 *
 * Nobody hits an estimate exactly, and re-billing over two minutes costs more
 * in support than it earns.
 */
export function differsEnoughToReprice(
  quoted: number,
  actual: number,
  toleranceMinutes: number
): boolean {
  const tolerance = Number.isFinite(toleranceMinutes) ? Math.max(0, toleranceMinutes) : 0;

  return Math.abs(actual - quoted) > tolerance;
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
