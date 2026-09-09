import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NeedsAttentionPage from '../page';
import { Enums } from '@/data/app-enums';

type BillNeedsAttentionData = App.Data.PeriodBill.BillNeedsAttentionData;

let bills: BillNeedsAttentionData[] = [];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  capitalize: (value: string) => value,
  modelLabel: (key: string) => key,
}));

const emptyList = { data: undefined, isLoading: false, refetch: vi.fn(), isRefetching: false };

vi.mock('@/hooks/orders', () => ({
  useOrderList: () => ({ ...emptyList, data: { items: [], meta: { total: 0 } } }),
}));
vi.mock('@/hooks/orders/useNeedsAttention', () => ({
  useNeedsAttention: () => ({ ...emptyList, data: { data: [], summary: {} } }),
}));
vi.mock('@/hooks/orders/usePendingReconciliation', () => ({
  usePendingReconciliation: () => ({ ...emptyList, data: { data: [], summary: { count: 0 } } }),
}));
vi.mock('@/hooks/refundRequests', () => ({
  usePendingRefundRequests: () => ({ ...emptyList, data: { items: [] } }),
}));
vi.mock('@/hooks/currencies', () => ({
  useCurrencyList: () => ({ data: { items: [] } }),
}));
vi.mock('@/hooks/useLocalizedRouter', () => ({
  useLocalizedRouter: () => ({ push: vi.fn(), replace: vi.fn(), lang: 'en' }),
}));

vi.mock('@/hooks/periodBills', () => ({
  useBillsNeedingAttention: () => ({
    data: { items: bills, summary: {} },
    isLoading: false,
    refetch: vi.fn(),
    isRefetching: false,
  }),
}));

// The other five tabs' cards are not this test's subject, and each already has
// its own coverage.
vi.mock('@/components/orders/NeedsAttentionCard', () => ({ NeedsAttentionCard: () => null }));
vi.mock('@/components/orders/PendingReconciliationCard', () => ({
  PendingReconciliationCard: () => null,
}));
vi.mock('@/components/orders/RefundRequestCard', () => ({ RefundRequestCard: () => null }));
vi.mock('@/components/orders/OrderStatusBadge', () => ({ OrderStatusBadge: () => null }));
vi.mock('@/components/orders/PaymentStatusBadge', () => ({ PaymentStatusBadge: () => null }));
vi.mock('@/components/payments/RecordPaymentDialog', () => ({ RecordPaymentDialog: () => null }));
vi.mock('@/components/payments/PaymentSection', () => ({
  getPaymentMethodLabel: () => '',
  getOrderDueAmount: () => 0,
}));

// Stubbed down to the three fields this test is about, so the assertion reads
// the page's own output rather than the card's rendering. The card's own test
// covers what it draws.
vi.mock('@/components/periodBills/BillAttentionCard', () => ({
  BillAttentionCard: ({ item }: { item: BillNeedsAttentionData }) => (
    <li data-testid="bill-row" data-reason={item.reason} data-urgency={item.urgency}>
      {item.bill.publicId}
    </li>
  ),
}));

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, and the two are deliberately not
// assignable to each other. Production code never needs the bridge — it reads
// these values off DTOs, where they already carry the nominal type — so
// fixtures cross that boundary once, here.
function billRow(
  publicId: string,
  reason: string,
  urgency: string,
  dueAt: string
): BillNeedsAttentionData {
  return {
    bill: { publicId, dueAt },
    urgency,
    reason,
    ownerType: 'business',
    ownerPublicId: `owner-${publicId}`,
    ownerName: `Owner ${publicId}`,
  } as BillNeedsAttentionData;
}

async function openBillsTab() {
  const user = userEvent.setup();
  render(<NeedsAttentionPage />);
  await user.click(screen.getByRole('tab', { name: /period_bill/ }));
}

beforeEach(() => {
  bills = [];
});

describe('Needs Attention — the period-bill tab', () => {
  it('renders every BillAttentionReason the api can send, with its urgency', async () => {
    bills = [
      billRow(
        'pb-1',
        Enums.BillAttentionReason.UnresolvedCharge,
        Enums.AttentionUrgency.Critical,
        '2026-03-01T00:00:00Z'
      ),
      billRow(
        'pb-2',
        Enums.BillAttentionReason.Overdue,
        Enums.AttentionUrgency.High,
        '2026-03-02T00:00:00Z'
      ),
      billRow(
        'pb-3',
        Enums.BillAttentionReason.DeclarationToVerify,
        Enums.AttentionUrgency.Medium,
        '2026-03-03T00:00:00Z'
      ),
      billRow(
        'pb-4',
        Enums.BillAttentionReason.Quiet,
        Enums.AttentionUrgency.Low,
        '2026-03-04T00:00:00Z'
      ),
    ];

    await openBillsTab();

    const rendered = screen.getAllByTestId('bill-row');
    expect(rendered).toHaveLength(Object.values(Enums.BillAttentionReason).length);
    expect(rendered.map((row) => row.dataset.reason)).toEqual(
      Object.values(Enums.BillAttentionReason)
    );
    expect(rendered.map((row) => row.dataset.urgency)).toEqual([
      Enums.AttentionUrgency.Critical,
      Enums.AttentionUrgency.High,
      Enums.AttentionUrgency.Medium,
      Enums.AttentionUrgency.Low,
    ]);
  });

  // The precedence is the api's: an unresolved charge outranks an overdue bill
  // because the customer's money may already be gone while the bill still reads
  // unpaid. The fixture is built so that ANY client-side re-sort flips it — the
  // unresolved row has the LATER due date and the LATER-sorting public id, so
  // sorting by either would put the overdue bill first.
  it('keeps an unresolved charge above an overdue bill, in the api order', async () => {
    bills = [
      billRow(
        'pb-zz',
        Enums.BillAttentionReason.UnresolvedCharge,
        Enums.AttentionUrgency.Critical,
        '2030-01-01T00:00:00Z'
      ),
      billRow(
        'pb-aa',
        Enums.BillAttentionReason.Overdue,
        Enums.AttentionUrgency.High,
        '2020-01-01T00:00:00Z'
      ),
    ];

    await openBillsTab();

    expect(screen.getAllByTestId('bill-row').map((row) => row.textContent)).toEqual([
      'pb-zz',
      'pb-aa',
    ]);
  });

  it('says nothing needs chasing when the queue is empty', async () => {
    await openBillsTab();

    expect(screen.queryAllByTestId('bill-row')).toHaveLength(0);
    expect(screen.getByText('payments:period_bill.attention_empty')).toBeInTheDocument();
  });

  it('counts the queue on the tab', async () => {
    bills = [
      billRow(
        'pb-1',
        Enums.BillAttentionReason.Quiet,
        Enums.AttentionUrgency.Low,
        '2026-03-01T00:00:00Z'
      ),
    ];

    render(<NeedsAttentionPage />);

    expect(screen.getByRole('tab', { name: /period_bill/ })).toHaveTextContent('1');
  });
});
