import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BalanceCard } from '../BalanceCard';
import { Enums } from '@/data/app-enums';

// Radix's Select opens by capturing the pointer on the trigger, which
// happy-dom doesn't implement — without these the popover silently never
// opens under test, though it works fine in a real browser.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The real helpers resolve translations from the API at runtime (see
// config/i18next.ts), which this test suite has no server for. Stub them to
// identity so assertions can target the enum values they were given.
vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  statusLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/balance', () => ({
  useBalance: () => ({
    data: { balance: 0, entries: [], baseCurrency: 'CRC' },
    isLoading: false,
  }),
  useAdjustBalance: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('BalanceCard — billing cycle select', () => {
  it('renders an option for every member of Enums.BillingCycle', async () => {
    const user = userEvent.setup();
    render(
      <BalanceCard
        ownerPublicId="pub-1"
        canManage
        billingCycle={Enums.BillingCycle.Weekly}
        onBillingCycleChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'billingCycle' }));
    const listbox = await screen.findByRole('listbox');

    for (const cycle of Object.values(Enums.BillingCycle)) {
      expect(within(listbox).getByRole('option', { name: cycle })).toBeInTheDocument();
    }
  });

  it('commits the selected cycle through onBillingCycleChange', async () => {
    const user = userEvent.setup();
    const onBillingCycleChange = vi.fn();
    render(
      <BalanceCard
        ownerPublicId="pub-1"
        canManage
        billingCycle={Enums.BillingCycle.PerOrder}
        onBillingCycleChange={onBillingCycleChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'billingCycle' }));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: Enums.BillingCycle.Monthly }));

    expect(onBillingCycleChange).toHaveBeenCalledWith(Enums.BillingCycle.Monthly);
  });

  it('does not render the billing cycle control when onBillingCycleChange is omitted', () => {
    render(<BalanceCard ownerPublicId="pub-1" canManage />);
    expect(screen.queryByRole('combobox', { name: 'billingCycle' })).not.toBeInTheDocument();
  });
});

describe('BalanceCard — grace period field', () => {
  it('saves a new grace period value', async () => {
    const user = userEvent.setup();
    const onGracePeriodDaysChange = vi.fn();
    render(
      <BalanceCard
        ownerPublicId="pub-1"
        canManage
        gracePeriodDays={3}
        onGracePeriodDaysChange={onGracePeriodDaysChange}
      />
    );

    const input = screen.getByLabelText('gracePeriodDays');
    await user.clear(input);
    await user.type(input, '10');
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(onGracePeriodDaysChange).toHaveBeenCalledWith(10);
  });

  it('does not render the grace period control when onGracePeriodDaysChange is omitted', () => {
    render(<BalanceCard ownerPublicId="pub-1" canManage />);
    expect(screen.queryByLabelText('gracePeriodDays')).not.toBeInTheDocument();
  });
});

describe('BalanceCard — block reason badge', () => {
  it.each(Object.values(Enums.AccountBlockReason))(
    'renders a badge for block reason "%s"',
    (reason) => {
      render(<BalanceCard ownerPublicId="pub-1" blockReason={reason} />);
      const badge = screen.getByTestId('block-reason-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(reason);
    }
  );

  it('renders nothing when blockReason is null', () => {
    render(<BalanceCard ownerPublicId="pub-1" blockReason={null} />);
    expect(screen.queryByTestId('block-reason-badge')).not.toBeInTheDocument();
  });
});
