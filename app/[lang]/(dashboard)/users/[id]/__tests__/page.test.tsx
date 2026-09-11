import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserDetailPage from '../page';

const mutate = vi.fn();

// This page's own params/router come through next/navigation — override the
// blanket vitest.setup.ts stub so `params.id` resolves to a real user id.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'user-1', lang: 'en' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  getInitials: (name?: string) => (name ? name[0] : '?'),
  modelLabel: (key: string) => key,
  resourceMessage: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

// isAdmin: false keeps ChangeRoleDialog and the delete button off the tree —
// neither is relevant here, and BalanceCard (stubbed below) renders
// unconditionally on this page regardless of role.
vi.mock('@/hooks/auth', () => ({
  useRole: () => ({ isAdmin: false }),
}));

vi.mock('@/hooks/users', () => ({
  useUser: () => ({
    data: {
      id: 1,
      publicId: 'user-1',
      role: 'client',
      name: 'Jane Doe',
      langCode: 'en',
      allowedPaymentMethods: [],
      balance: 0,
      dispatcherId: null,
      balanceLimit: null,
      billingCycle: 'per_order',
      blockReason: null,
      isAdmin: false,
      isBusinessAccount: false,
      isBusinessOwner: false,
      isBusinessUser: false,
      isDriver: false,
      isClient: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
  useDeleteUser: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateUser: () => ({ mutate, isPending: false }),
  useDispatchUsers: () => ({ data: { items: [] }, isLoading: false }),
}));

vi.mock('@/components/payments/PaymentMethodsCard', () => ({ PaymentMethodsCard: () => null }));
vi.mock('@/components/dispatch/DispatcherPicker', () => ({ DispatcherPicker: () => null }));

// The billing-select mechanics are BalanceCard's own — already covered in
// components/balance/__tests__/BalanceCard.test.tsx. This page's job is only
// to shape the payload it hands the update mutation, so the stub exposes
// exactly the callback that wiring depends on.
vi.mock('@/components/balance/BalanceCard', () => ({
  BalanceCard: ({ onBillingCycleChange }: { onBillingCycleChange?: (value: string) => void }) => (
    <div>
      <button onClick={() => onBillingCycleChange?.('monthly')}>change-cycle</button>
    </div>
  ),
}));

describe('UserDetailPage — billing controls reach the update mutation', () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  it('sends billingCycle under data, keyed by the user id', async () => {
    const user = userEvent.setup();
    render(<UserDetailPage />);

    await user.click(screen.getByText('change-cycle'));

    expect(mutate).toHaveBeenCalledWith({ id: 'user-1', data: { billingCycle: 'monthly' } });
  });
});
