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
