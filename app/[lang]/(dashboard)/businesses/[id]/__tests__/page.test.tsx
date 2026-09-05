import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BusinessDetailPage from '../page';

const mutate = vi.fn();

// This page's own params/router come through next/navigation — override the
// blanket vitest.setup.ts stub so `params.id` resolves to a real business id.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'biz-1', lang: 'en' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  modelLabel: (key: string) => key,
  resourceMessage: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/auth', () => ({
  useRole: () => ({ isAdmin: true }),
}));

vi.mock('@/hooks/tax-profiles', () => ({
  useBusinessTaxProfile: () => ({ data: undefined }),
}));

vi.mock('@/hooks/businesses', () => ({
  useBusiness: () => ({
    data: {
      id: 1,
      publicId: 'biz-1',
      name: 'Acme',
      typeId: 1,
      typeName: 'Retail',
      usersCanApproveOwnOrders: false,
      allowedPaymentMethods: [],
      balance: 0,
      dispatcherId: null,
      balanceLimit: null,
      billingCycle: 'per_order',
      blockReason: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
  useDeleteBusiness: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBusiness: () => ({ mutate, isPending: false }),
}));

vi.mock('@/components/TaxProfileCard', () => ({ TaxProfileCard: () => null }));
vi.mock('@/components/payments/PaymentMethodsCard', () => ({ PaymentMethodsCard: () => null }));
vi.mock('@/components/dispatch/DispatcherPicker', () => ({ DispatcherPicker: () => null }));

// The billing-select mechanics are BalanceCard's own — already covered in
// components/balance/__tests__/BalanceCard.test.tsx. This page's job is only
// to shape the payload it hands the update mutation, so the stub exposes
// exactly the callback that wiring depends on.
vi.mock('@/components/balance/BalanceCard', () => ({
  BalanceCard: ({ onBillingCycleChange }: { onBillingCycleChange?: (value: string) => void }) => (
    <div>
      <button onClick={() => onBillingCycleChange?.('weekly')}>change-cycle</button>
    </div>
  ),
}));

describe('BusinessDetailPage — billing controls reach the update mutation', () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  it('sends billingCycle under data, keyed by the business id', async () => {
    const user = userEvent.setup();
    render(<BusinessDetailPage />);

    await user.click(screen.getByText('change-cycle'));

    expect(mutate).toHaveBeenCalledWith({ id: 'biz-1', data: { billingCycle: 'weekly' } });
  });
});
