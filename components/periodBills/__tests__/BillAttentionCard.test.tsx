import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BillAttentionCard } from '../BillAttentionCard';
import { Enums } from '@/data/app-enums';

type BillNeedsAttentionData = App.Data.PeriodBill.BillNeedsAttentionData;
type PeriodBillData = App.Data.PeriodBill.PeriodBillData;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  statusLabel: (key: string) => `statuses:${key}`,
}));

vi.mock('@/hooks/currencies', () => ({
  useOrderCurrencySymbol: () => '₡',
}));

vi.mock('@/hooks/useLocalizedRouter', () => ({
  useLocalizedRouter: () => ({ push: vi.fn(), lang: 'en' }),
}));

// The two acts have their own coverage; this test is about what the row says.
vi.mock('../VerifyDeclarationDialog', () => ({
  VerifyDeclarationDialog: () => <div data-testid="verify-dialog" />,
}));
vi.mock('../RecordBillPaymentDialog', () => ({
  RecordBillPaymentDialog: () => <div data-testid="record-dialog" />,
}));

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, and the two are deliberately not
// assignable to each other. Production code never needs the bridge — it reads
// these values off DTOs, where they already carry the nominal type — so
// fixtures cross that boundary once, here.
const URGENCY_FOR_REASON: Record<string, string> = {
  [Enums.BillAttentionReason.UnresolvedCharge]: Enums.AttentionUrgency.Critical,
  [Enums.BillAttentionReason.Overdue]: Enums.AttentionUrgency.High,
  [Enums.BillAttentionReason.DeclarationToVerify]: Enums.AttentionUrgency.Medium,
  [Enums.BillAttentionReason.Quiet]: Enums.AttentionUrgency.Low,
};

function item(reason: string, overrides: Partial<PeriodBillData> = {}): BillNeedsAttentionData {
  return {
    bill: {
      publicId: 'pb-1',
      cutoffAt: '2026-02-01T00:00:00Z',
      dueAt: '2026-02-08T00:00:00Z',
      baseAmount: 18000,
      creditApplied: 0,
      netDue: 18000,
      isOverdue: false,
      currencyCode: null,
      status: Enums.PeriodBillStatus.Issued,
      settlementMethod: null,
      reference: null,
      proofUrl: null,
      settlementDestination: null,
      ...overrides,
    } as PeriodBillData,
    urgency: URGENCY_FOR_REASON[reason],
    reason,
    ownerType: 'business',
    ownerPublicId: 'biz-1',
    ownerName: 'Acme SA',
  } as BillNeedsAttentionData;
}

describe('BillAttentionCard — every reason the api can send', () => {
  // Driven off the enum rather than a written list, so a case added to
  // `BillAttentionReason` without a label or a rank fails here.
  it.each(Object.values(Enums.BillAttentionReason))('renders %s with its urgency', (reason) => {
    render(<BillAttentionCard item={item(reason)} />);

    expect(screen.getByText(`bill_attention_reason.${reason}`)).toBeInTheDocument();
    expect(
      screen.getByText(`needs_attention.urgency.${URGENCY_FOR_REASON[reason]}`)
    ).toBeInTheDocument();
  });

  it('names the account the bill belongs to', () => {
    render(<BillAttentionCard item={item(Enums.BillAttentionReason.Quiet)} />);

    expect(screen.getByText('Acme SA')).toBeInTheDocument();
    expect(screen.getByText('#pb-1')).toBeInTheDocument();
  });
});

describe('BillAttentionCard — the state most likely to be misread', () => {
  // A declared transfer is a claim, not a payment: the clock keeps running and
  // the row has to say so rather than reading as settled.
  it('offers verification and says the due date has not moved on a declaration', () => {
    render(
      <BillAttentionCard
        item={item(Enums.BillAttentionReason.DeclarationToVerify, {
          status: Enums.PeriodBillStatus.AwaitingVerification as App.Enums.PeriodBillStatus,
        })}
      />
    );

    expect(screen.getByTestId('verify-dialog')).toBeInTheDocument();
    expect(screen.getByText('period_bill.awaiting_verification_hint')).toBeInTheDocument();
  });

  it('offers no verification on a bill with nothing declared', () => {
    render(<BillAttentionCard item={item(Enums.BillAttentionReason.Quiet)} />);

    expect(screen.queryByTestId('verify-dialog')).not.toBeInTheDocument();
    // Recording a payment received out of band is always available to an admin.
    expect(screen.getByTestId('record-dialog')).toBeInTheDocument();
  });

  it('flags an overdue bill', () => {
    render(
      <BillAttentionCard item={item(Enums.BillAttentionReason.Overdue, { isOverdue: true })} />
    );

    expect(screen.getByText('period_bill.overdue_hint')).toBeInTheDocument();
  });
});
