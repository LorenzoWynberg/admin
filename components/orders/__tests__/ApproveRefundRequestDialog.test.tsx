import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApproveRefundRequestDialog } from '../ApproveRefundRequestDialog';
import { Enums } from '@/data/app-enums';

type PaymentData = App.Data.Payment.PaymentData;

// Radix's Select opens by capturing the pointer on the trigger, which
// happy-dom doesn't implement — without these the popover silently never
// opens under test, though it works fine in a real browser.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

const mutate = vi.fn();
let payments: PaymentData[] = [];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
}));

vi.mock('@/hooks/refundRequests', () => ({
  useApproveRefundRequest: () => ({ mutate, isPending: false }),
}));

vi.mock('@/hooks/payments', () => ({
  useOrderPayments: () => ({ data: payments, isLoading: false }),
}));

const cardPayment = {
  status: Enums.TransactionStatus.Succeeded,
  provider: Enums.PaymentProvider.Tilopay,
  createdAt: '2026-01-01T00:00:00Z',
} as unknown as PaymentData;

function open(paymentStatus?: string) {
  return render(
    <ApproveRefundRequestDialog
      publicId="rr-1"
      orderPublicId="ord-1"
      paymentStatus={paymentStatus}
    />
  );
}

beforeEach(() => {
  mutate.mockClear();
  payments = [];
});

// An account-billed delivery has no payment row at all, so the settled-payment
// lookup finds nothing. Read as a card payment, the dialog would default to a
// gateway reversal — which the API answers with a 422 every single time.
describe('ApproveRefundRequestDialog — an order billed to an account', () => {
  it('locks the settlement to credit and explains why', async () => {
    const user = userEvent.setup();
    open(Enums.PaymentStatus.ON_ACCOUNT);

    await user.click(screen.getByRole('button', { name: 'approve' }));

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent(`payments:refund_method.${Enums.RefundMethod.Balance}`);
    expect(select).toBeDisabled();
    expect(screen.getByText('payments:refund.balance_only_hint')).toBeInTheDocument();
  });

  it('submits the credit method the API accepts', async () => {
    const user = userEvent.setup();
    open(Enums.PaymentStatus.ON_ACCOUNT);

    await user.click(screen.getByRole('button', { name: 'approve' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'approve' }));

    expect(mutate).toHaveBeenCalledWith(
      { publicId: 'rr-1', data: { method: Enums.RefundMethod.Balance } },
      expect.anything()
    );
  });
});

// The contrast case: a real card charge still defaults to reversing the card,
// and the admin may still choose credit instead.
describe('ApproveRefundRequestDialog — an order paid by card', () => {
  it('defaults to a gateway reversal and leaves the choice open', async () => {
    const user = userEvent.setup();
    payments = [cardPayment];
    open(Enums.PaymentStatus.PAID);

    await user.click(screen.getByRole('button', { name: 'approve' }));

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent(`payments:refund_method.${Enums.RefundMethod.Gateway}`);
    expect(select).not.toBeDisabled();
    expect(screen.queryByText('payments:refund.balance_only_hint')).not.toBeInTheDocument();
  });
});
