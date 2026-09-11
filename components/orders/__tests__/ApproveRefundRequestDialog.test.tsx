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

const manualPayment = {
  status: Enums.TransactionStatus.Succeeded,
  provider: Enums.PaymentProvider.Manual,
  createdAt: '2026-01-01T00:00:00Z',
} as unknown as PaymentData;

function renderDialog(isCreditOnly?: boolean) {
  return render(
    <ApproveRefundRequestDialog publicId="rr-1" orderPublicId="ord-1" isCreditOnly={isCreditOnly} />
  );
}

async function openDialog() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'approve' }));
  return user;
}

beforeEach(() => {
  mutate.mockClear();
  payments = [];
});

// The verdict arrives already decided — `RefundRequestData.isCreditOnly`, the
// answer `Order::refundIsCreditOnly()` gave, which is the same method
// `approve()` branches on. What produced it is deliberately not on the wire:
// a delivery still sitting on an open account and one whose settled bill has
// since moved it to `PAID` are one case from here, and the second is the one
// that shipped broken — reading the payment status put Gateway in front of
// the admin and the server answered 422 every time. No fixture in this file
// can tell those apart, which is the point; the API test
// `RefundCreditOnlyVerdictTest` is what holds them apart on the wire.
describe('ApproveRefundRequestDialog — the API says credit is the only settlement', () => {
  it('locks the settlement to credit and explains why', async () => {
    renderDialog(true);
    await openDialog();

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent(`payments:refund_method.${Enums.RefundMethod.Balance}`);
    expect(select).toBeDisabled();
    expect(screen.getByText('payments:refund.balance_only_hint')).toBeInTheDocument();
  });

  it('submits the credit method the API accepts', async () => {
    renderDialog(true);
    const user = await openDialog();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'approve' }));

    expect(mutate).toHaveBeenCalledWith(
      { publicId: 'rr-1', data: { method: Enums.RefundMethod.Balance } },
      expect.anything()
    );
  });
});

// `isManual` is a separate and independently correct reason for the same
// lock — cash and SINPE are settled by hand, and money is never sent back
// out the same way. The verdict joins it rather than replacing it, so a
// wire that says nothing about credit still locks a manual payment.
describe('ApproveRefundRequestDialog — a manually-settled payment', () => {
  it('locks to credit even when the API sends no credit-only verdict', async () => {
    payments = [manualPayment];
    renderDialog(undefined);
    await openDialog();

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent(`payments:refund_method.${Enums.RefundMethod.Balance}`);
    expect(select).toBeDisabled();
  });
});

// The contrast case: a real card charge still defaults to reversing the card,
// and the admin may still choose credit instead.
describe('ApproveRefundRequestDialog — an order paid by card', () => {
  it('defaults to a gateway reversal and leaves the choice open', async () => {
    payments = [cardPayment];
    renderDialog(false);
    await openDialog();

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent(`payments:refund_method.${Enums.RefundMethod.Gateway}`);
    expect(select).not.toBeDisabled();
    expect(screen.queryByText('payments:refund.balance_only_hint')).not.toBeInTheDocument();
  });
});
