import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PaymentSection } from '../PaymentSection';
import { useOrderPayments } from '@/hooks/payments';
import { useRole } from '@/hooks/auth';
import { useOrderCurrencySymbol } from '@/hooks/currencies';

type PaymentData = App.Data.Payment.PaymentData;
type OrderData = App.Data.Order.OrderData;

const mockT = vi.fn<(key: string, options?: Record<string, unknown>) => string>((key) => key);

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

// The real helpers resolve translations from the API at runtime (see
// config/i18next.ts), which this test suite has no server for. Stub them to
// identity so assertions can target the raw keys they were given.
vi.mock('@/utils/lang', () => ({
  capitalize: (value: string) => value,
  statusLabel: (status: string) => status,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/payments', () => ({ useOrderPayments: vi.fn() }));
vi.mock('@/hooks/auth', () => ({ useRole: vi.fn() }));
vi.mock('@/hooks/currencies', () => ({ useOrderCurrencySymbol: vi.fn() }));

function order(overrides: Partial<OrderData> = {}): OrderData {
  return {
    publicId: 'ord-1',
    paymentStatus: 'paid',
    currencyCode: 'CRC',
    ...overrides,
  } as OrderData;
}

function payment(overrides: Partial<PaymentData> = {}): PaymentData {
  return {
    publicId: 'pay-1',
    status: 'succeeded',
    amount: 1000,
    ...overrides,
  } as PaymentData;
}

beforeEach(() => {
  mockT.mockClear();
  vi.mocked(useRole).mockReturnValue({
    role: undefined,
    isAdmin: false,
    isDispatch: false,
    isStaff: false,
  });
  vi.mocked(useOrderCurrencySymbol).mockReturnValue('₡');
});

describe('PaymentSection — receipt link label', () => {
  it('asks i18next for payments:receipt without a defaultValue', () => {
    vi.mocked(useOrderPayments).mockReturnValue({
      data: [payment({ receiptUrl: 'https://provider.example/r/1' })],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useOrderPayments>);

    render(<PaymentSection order={order()} />);

    // The link renders regardless of the call shape below (mockT is an
    // identity function) — this only exists so the query below has
    // something real to find.
    expect(screen.getByRole('link', { name: 'payments:receipt' })).toBeInTheDocument();

    const receiptCall = mockT.mock.calls.find(([key]) => key === 'payments:receipt');
    expect(receiptCall).toBeDefined();
    // #285 fixed the duplicate declaration that made this key resolve to an
    // object instead of "Receipt" — a `defaultValue` here would silently mask
    // a future regression of that same bug instead of surfacing it.
    expect(receiptCall?.[1]).toBeUndefined();
  });
});
