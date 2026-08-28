import { describe, expect, it } from 'vitest';
import { chargeableWaitMinutes, idleCharge, computeReconciliationTotal } from '../reconciliation';

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

describe('chargeableWaitMinutes', () => {
  it('charges nothing for a stop that took as long as it was quoted for', () => {
    expect(chargeableWaitMinutes([{ waitMinutes: 10, estimatedMinutes: 10 }], 5)).toBe(0);
  });

  it('charges only the time past the estimate and the tolerance', () => {
    expect(chargeableWaitMinutes([{ waitMinutes: 45, estimatedMinutes: 10 }], 5)).toBe(30);
  });

  it('lets a generous estimate absorb the time it bought', () => {
    expect(chargeableWaitMinutes([{ waitMinutes: 40, estimatedMinutes: 40 }], 5)).toBe(0);
  });

  it('measures every stop against its own estimate', () => {
    expect(
      chargeableWaitMinutes(
        [
          { waitMinutes: 30, estimatedMinutes: 30 },
          { waitMinutes: 30, estimatedMinutes: 5 },
        ],
        5
      )
    ).toBe(20);
  });

  it('ignores stops the driver never finished', () => {
    expect(
      chargeableWaitMinutes(
        [
          { waitMinutes: 45, estimatedMinutes: 10 },
          { waitMinutes: null, estimatedMinutes: 10 },
        ],
        5
      )
    ).toBe(30);
  });
});
