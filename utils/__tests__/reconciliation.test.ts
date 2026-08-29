import { describe, expect, it } from 'vitest';
import {
  billableMinutes,
  totalBillableMinutes,
  differsEnoughToReprice,
  idleCharge,
  computeReconciliationTotal,
} from '../reconciliation';

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

describe('idleCharge', () => {
  it('prices reported minutes at the configured rate', () => {
    expect(idleCharge(30, 0.5)).toBe(15);
  });

  it('rounds to cents so the estimate matches what the API charges', () => {
    expect(idleCharge(7, 0.333)).toBe(2.33);
  });

  it('charges nothing when the rate is unset', () => {
    expect(idleCharge(30, 0)).toBe(0);
  });

  it('charges nothing for no waiting', () => {
    expect(idleCharge(0, 0.5)).toBe(0);
  });

  it('treats a blank input as no charge rather than NaN', () => {
    expect(idleCharge(NaN, 0.5)).toBe(0);
  });
});

describe('billableMinutes', () => {
  it('charges nothing for an ordinary stop', () => {
    expect(billableMinutes(5, 5)).toBe(0);
    expect(billableMinutes(3, 5)).toBe(0);
  });

  it('charges only the time beyond an ordinary stop', () => {
    expect(billableMinutes(40, 5)).toBe(35);
  });

  it('treats a stop with nothing recorded as nothing billable', () => {
    expect(billableMinutes(null, 5)).toBe(0);
    expect(billableMinutes(undefined, 5)).toBe(0);
  });
});

describe('totalBillableMinutes', () => {
  it('gives the allowance at every stop, not once over the order', () => {
    expect(totalBillableMinutes([30, 30], 5)).toBe(50);
  });

  it('prices a run of ordinary stops at nothing', () => {
    expect(totalBillableMinutes([5, 4, 5], 5)).toBe(0);
  });
});

describe('differsEnoughToReprice', () => {
  it('leaves a day that went to plan alone', () => {
    expect(differsEnoughToReprice(35, 37, 5)).toBe(false);
    expect(differsEnoughToReprice(35, 33, 5)).toBe(false);
  });

  it('re-prices a day that ran well over', () => {
    expect(differsEnoughToReprice(35, 50, 5)).toBe(true);
  });

  it('re-prices a day that ran well under, so the customer gets it back', () => {
    expect(differsEnoughToReprice(35, 10, 5)).toBe(true);
  });
});
