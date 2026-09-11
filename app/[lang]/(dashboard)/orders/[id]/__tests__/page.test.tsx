import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import OrderDetailPage from '../page';

// This page's own params/router come through next/navigation — override the
// blanket vitest.setup.ts stub so `params.id` resolves to a real order id.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'order-1', lang: 'en' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  capitalize: (value: string) => value,
  resourceMessage: (key: string) => key,
  statusLabel: (status: string) => status,
  validationAttribute: (key: string) => key,
}));

// isAdmin: false keeps the dispatcher card (and its useDispatchUsers query)
// off the tree — irrelevant to the actions under test.
vi.mock('@/hooks/auth', () => ({ useRole: () => ({ isAdmin: false }) }));

const outsourceMutate = vi.fn();
// Read when the page renders, so a test can set it before calling render().
let orderStatus = 'approved';

vi.mock('@/hooks/orders', () => ({
  useOrder: () => ({
    data: {
      id: 1,
      publicId: 'order-1',
      status: orderStatus,
      driver: null,
      stops: [],
      quotes: [],
      currentQuote: null,
    },
    isLoading: false,
    error: null,
  }),
  useDeleteOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useCalculateDistance: () => ({ mutate: vi.fn(), isPending: false }),
  useOutsourceOrder: () => ({ mutate: outsourceMutate, isPending: false }),
  useUpdateStop: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/currencies', () => ({ useCurrencyList: () => ({ data: { items: [] } }) }));
vi.mock('@/hooks/users', () => ({ useDispatchUsers: () => ({ data: { items: [] } }) }));

// Everything below renders once `order.publicId` is set (ProofOfDeliveryCard
// once the order is completed) — stubbed out like the sibling businesses/[id]
// and users/[id] page tests do for their own heavy children. The share dialog
// stub leaves a marker so where it renders, and whether it does, can be read.
vi.mock('@/components/payments/PaymentSection', () => ({ PaymentSection: () => null }));
vi.mock('@/components/invoices/InvoiceSection', () => ({ InvoiceSection: () => null }));
vi.mock('@/components/orders/ReceiptSection', () => ({ ReceiptSection: () => null }));
vi.mock('@/components/orders/OrderActivityCard', () => ({ OrderActivityCard: () => null }));
vi.mock('@/components/orders/ProofOfDeliveryCard', () => ({ ProofOfDeliveryCard: () => null }));
vi.mock('@/components/orders/ShareTrackingLinkDialog', () => ({
  ShareTrackingLinkDialog: () => <div data-testid="share-tracking-link" />,
}));
vi.mock('@/components/orders/AddStopDialog', () => ({ AddStopDialog: () => null }));
vi.mock('@/components/chat/ChatTabs', () => ({ ChatTabs: () => null }));

beforeEach(() => {
  orderStatus = 'approved';
});

describe('OrderDetailPage — outsource button label', () => {
  it("uses actionLabel('outsource') instead of the nonexistent orders:detail.outsource key", () => {
    render(<OrderDetailPage />);

    // common:actions.outsource exists; orders:detail.outsource does not — a
    // regression back to the raw t() call would render the dead key instead.
    expect(screen.getByRole('button', { name: /outsource/i })).toHaveTextContent('outsource');
    expect(screen.queryByText('orders:detail.outsource')).not.toBeInTheDocument();
  });
});

describe('OrderDetailPage — share tracking link', () => {
  it('renders in the Order Details card header, not the crowded page header', () => {
    render(<OrderDetailPage />);

    const detailsHeader = screen
      .getByText('orders:detail.title')
      .closest<HTMLElement>('[data-slot="card-header"]');

    expect(detailsHeader).not.toBeNull();
    expect(within(detailsHeader!).getByTestId('share-tracking-link')).toBeInTheDocument();
  });

  it.each(['completed', 'canceled', 'delivery_failed', 'returned_to_sender', 'denied'])(
    'is hidden on a %s order, which the API refuses to share',
    (status) => {
      orderStatus = status;
      render(<OrderDetailPage />);

      expect(screen.queryByTestId('share-tracking-link')).not.toBeInTheDocument();
    }
  );
});
