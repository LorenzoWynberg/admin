import { describe, expect, it } from 'vitest';
import { computeReconciliationTotal } from '../reconciliation';

const quote = {
  baseFare: 10,
  distanceFee: 5,
  taxRate: 0.13,
  total: 16.95,
};

describe('computeReconciliationTotal', () => {
  it('applies time fee, surcharge, and discount overrides', () => {
    const result = computeReconciliationTotal(quote, 500, {
      timeFee: 3,
      surcharge: 2,
      discountRate: 0.1,
    });

    expect(result.serviceFees).toBe(20);
    expect(result.discountAmount).toBe(52);
    expect(result.taxTotal).toBe(60.84);
    expect(result.estimatedTotal).toBe(528.84);
    expect(result.delta).toBe(511.89);
  });

  it('computes totals with zero overrides', () => {
    const result = computeReconciliationTotal(quote, 500, {
      timeFee: 0,
      surcharge: 0,
      discountRate: 0,
    });

    expect(result.serviceFees).toBe(15);
    expect(result.discountAmount).toBe(0);
    expect(result.taxTotal).toBe(66.95);
    expect(result.estimatedTotal).toBe(581.95);
    expect(result.delta).toBe(565);
  });

  it('treats missing quote fields as zero', () => {
    const result = computeReconciliationTotal({}, 100, {
      timeFee: 0,
      surcharge: 0,
      discountRate: 0,
    });

    expect(result.serviceFees).toBe(0);
    expect(result.estimatedTotal).toBe(100);
    expect(result.delta).toBe(100);
  });
});
