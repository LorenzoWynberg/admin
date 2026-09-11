import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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
// off the tree — irrelevant to the outsource button under test.
vi.mock('@/hooks/auth', () => ({ useRole: () => ({ isAdmin: false }) }));

const outsourceMutate = vi.fn();

vi.mock('@/hooks/orders', () => ({
  useOrder: () => ({
    data: {
      id: 1,
      publicId: 'order-1',
      status: 'approved',
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

// Everything below always renders once `order.publicId` is set — none of it
// bears on the outsource button, so it is stubbed out like the sibling
// businesses/[id] and users/[id] page tests do for their own heavy children.
vi.mock('@/components/payments/PaymentSection', () => ({ PaymentSection: () => null }));
vi.mock('@/components/invoices/InvoiceSection', () => ({ InvoiceSection: () => null }));
vi.mock('@/components/orders/ReceiptSection', () => ({ ReceiptSection: () => null }));
vi.mock('@/components/orders/OrderActivityCard', () => ({ OrderActivityCard: () => null }));
vi.mock('@/components/orders/ShareTrackingLinkDialog', () => ({
  ShareTrackingLinkDialog: () => null,
}));
vi.mock('@/components/orders/AddStopDialog', () => ({ AddStopDialog: () => null }));
vi.mock('@/components/chat/ChatTabs', () => ({ ChatTabs: () => null }));

describe('OrderDetailPage — outsource button label', () => {
  it("uses actionLabel('outsource') instead of the nonexistent orders:detail.outsource key", () => {
    render(<OrderDetailPage />);

    // common:actions.outsource exists; orders:detail.outsource does not — a
    // regression back to the raw t() call would render the dead key instead.
    expect(screen.getByRole('button', { name: /outsource/i })).toHaveTextContent('outsource');
    expect(screen.queryByText('orders:detail.outsource')).not.toBeInTheDocument();
  });
});
