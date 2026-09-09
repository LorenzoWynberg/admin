import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VerifyDeclarationDialog } from '../VerifyDeclarationDialog';
import { Enums } from '@/data/app-enums';

type PeriodBillData = App.Data.PeriodBill.PeriodBillData;

/** The authenticated stream route the api puts on `proofUrl`. */
const PROOF_ROUTE = 'https://api.mandados.test/period-bills/pb-1/proof';

const approveMutate = vi.fn();
const rejectMutate = vi.fn();
let detail: PeriodBillData | undefined;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/currencies', () => ({
  useOrderCurrencySymbol: () => '₡',
}));

vi.mock('@/hooks/periodBills', () => ({
  usePeriodBill: () => ({ data: detail, isLoading: false }),
  useApproveDeclaration: () => ({ mutate: approveMutate, isPending: false }),
  useRejectDeclaration: () => ({ mutate: rejectMutate, isPending: false }),
}));

// Its own test proves the comprobante loads through the authenticated route.
vi.mock('../ProofViewer', () => ({
  ProofViewer: () => <div data-testid="proof-viewer" />,
}));

function bill(overrides: Partial<PeriodBillData> = {}): PeriodBillData {
  return {
    publicId: 'pb-1',
    cutoffAt: '2026-02-01T00:00:00Z',
    dueAt: '2026-02-08T00:00:00Z',
    baseAmount: 18000,
    creditApplied: 3000,
    netDue: 15000,
    isOverdue: false,
    currencyCode: 'CRC',
    status: Enums.PeriodBillStatus.AwaitingVerification,
    settlementMethod: Enums.SettlementMethod.Transferencia,
    reference: 'REF-42',
    proofUrl: PROOF_ROUTE,
    settlementDestination: {
      id: 3,
      method: Enums.SettlementMethod.Transferencia,
      currencyCode: 'CRC',
      phoneNumber: null,
      bankName: 'Banco Nacional',
      accountNumber: '100-2003',
      iban: null,
      holderName: 'Mandados SA',
      legalId: '3-101-999',
    },
    ...overrides,
  } as PeriodBillData;
}

async function open(data: PeriodBillData = bill()) {
  const user = userEvent.setup();
  detail = data;
  render(<VerifyDeclarationDialog bill={data} />);
  await user.click(screen.getByRole('button', { name: 'verify' }));
  return user;
}

beforeEach(() => {
  approveMutate.mockClear();
  rejectMutate.mockClear();
  detail = undefined;
});

describe('VerifyDeclarationDialog — finding the payment in the bank', () => {
  it('shows the reference, the exact amount and where the customer was told to send it', async () => {
    await open();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('REF-42')).toBeInTheDocument();
    expect(within(dialog).getByText('₡15,000.00')).toBeInTheDocument();
    expect(within(dialog).getByText('Banco Nacional')).toBeInTheDocument();
    expect(within(dialog).getByText('100-2003')).toBeInTheDocument();
    expect(within(dialog).getByText('Mandados SA')).toBeInTheDocument();
  });

  // The comprobante is corroboration, not evidence: it goes through the
  // authenticated stream, and the raw route must never reach the DOM, where it
  // renders under test and 401s in a browser.
  it('never points the DOM at the proof route', async () => {
    await open();

    expect(screen.getByTestId('proof-viewer')).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain(PROOF_ROUTE);
  });

  it('offers no comprobante when the bill carries none', async () => {
    await open(bill({ proofUrl: null }));

    expect(screen.queryByTestId('proof-viewer')).not.toBeInTheDocument();
  });
});

describe('VerifyDeclarationDialog — the two outcomes', () => {
  // The asymmetry is the api's and it is deliberate: a rejection reaches the
  // customer, so it carries a reason; an approval agrees with what they already
  // stated and needs none.
  it('refuses to reject without a reason', async () => {
    await open();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'reject' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'approve' })).not.toBeDisabled();
  });

  it('sends the reason with a rejection', async () => {
    const user = await open();

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('notes'), 'not in the account');
    await user.click(within(dialog).getByRole('button', { name: 'reject' }));

    expect(rejectMutate).toHaveBeenCalledWith(
      { publicId: 'pb-1', notes: 'not in the account' },
      expect.anything()
    );
  });

  it('approves with a null note rather than an empty string', async () => {
    const user = await open();

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'approve' }));

    expect(approveMutate).toHaveBeenCalledWith(
      { publicId: 'pb-1', notes: null },
      expect.anything()
    );
  });
});
