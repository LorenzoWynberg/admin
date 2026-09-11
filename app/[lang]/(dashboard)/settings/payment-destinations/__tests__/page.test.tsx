import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

import PaymentDestinationsPage from '../page';

const mockT = vi.fn<(key: string, options?: Record<string, unknown>) => string>((key) => key);

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT, ready: true }) }));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  capitalize: (value: string) => value,
  modelLabel: (key: string) => key,
  resourceMessage: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/useLocalizedRouter', () => ({
  useLocalizedRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/hooks/paymentDestinations', () => ({
  usePaymentDestinations: () => ({
    data: [
      {
        id: 1,
        method: 'sinpe_mobile',
        holderName: 'Provider A',
        active: true,
      },
      {
        id: 2,
        method: 'sinpe_mobile',
        holderName: 'Provider B',
        active: false,
      },
    ],
    isLoading: false,
  }),
  useDeletePaymentDestination: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/components/paymentDestinations/PaymentDestinationDialog', () => ({
  PaymentDestinationDialog: () => null,
}));

describe('PaymentDestinationsPage — common:active / common:inactive pluralization', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  it('passes count on the column header, since common.active is a genuine plural (_one/_other only)', () => {
    render(<PaymentDestinationsPage />);

    const headerCall = mockT.mock.calls.find(([key]) => key === 'common:active');
    expect(headerCall).toBeDefined();
    expect(headerCall?.[1]).toEqual({ count: 2 });
  });

  it('passes count on each row badge, describing that one destination', () => {
    render(<PaymentDestinationsPage />);

    const activeCall = mockT.mock.calls.find(
      ([key, opts]) => key === 'common:active' && opts?.count === 1
    );
    const inactiveCall = mockT.mock.calls.find(([key]) => key === 'common:inactive');

    expect(activeCall?.[1]).toEqual({ count: 1 });
    expect(inactiveCall?.[1]).toEqual({ count: 1 });
  });
});
