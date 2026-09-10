import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { ReceiptSection } from '../ReceiptSection';
import { FileService } from '@/services/fileService';
import { useOrderReceipts } from '@/hooks/orders';

type OrderReceiptData = App.Data.Order.OrderReceiptData;

const OBJECT_URL = 'blob:mock-object-url';
const IMAGE_ROUTE = 'http://api.mandados.test:60/receipts/rec-img/file';
const PDF_ROUTE = 'http://api.mandados.test:60/receipts/rec-pdf/file';

/** Every url the section puts in the DOM from an attribute a browser would fetch. */
function fetchableUrls(): string[] {
  return Array.from(document.querySelectorAll('[src], [href], [data]'))
    .flatMap((element) => [
      element.getAttribute('src'),
      element.getAttribute('href'),
      element.getAttribute('data'),
    ])
    .filter((value): value is string => value !== null);
}

vi.mock('@/services/fileService', () => ({ FileService: { fetchFile: vi.fn() } }));
vi.mock('@/hooks/orders', () => ({ useOrderReceipts: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/utils/lang', () => ({
  capitalize: (value: string) => value,
  modelLabel: (model: string) => model,
  actionLabel: (action: string) => action,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createObjectURL = vi.fn(() => OBJECT_URL);
const revokeObjectURL = vi.fn();

function receipts(...items: Partial<OrderReceiptData>[]) {
  vi.mocked(useOrderReceipts).mockReturnValue({
    data: items as OrderReceiptData[],
    isLoading: false,
    error: null,
  } as ReturnType<typeof useOrderReceipts>);
}

beforeEach(() => {
  vi.mocked(FileService.fetchFile).mockReset();
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReceiptSection — receipts open through their authorized route', () => {
  // The list is metadata only. Before this it rendered no file bytes either,
  // and it must keep not doing so: an order can carry a receipt per stop, and
  // each one is a full-size phone photo.
  it('fetches no file merely to list the receipts', () => {
    receipts(
      { publicId: 'rec-img', fileUrl: IMAGE_ROUTE, mimeType: 'image/jpeg' },
      { publicId: 'rec-pdf', fileUrl: PDF_ROUTE, mimeType: 'application/pdf' }
    );

    render(<ReceiptSection orderPublicId="ord-1" />, { wrapper });

    expect(FileService.fetchFile).not.toHaveBeenCalled();
    expect(fetchableUrls().some((url) => url.startsWith('http'))).toBe(false);
  });

  // A PDF receipt used to be an `<a href>` opening a new tab, which carries no
  // bearer token and so answered 401. Both kinds go through the viewer now.
  it('opens a PDF receipt through the viewer rather than a plain link', async () => {
    receipts({ publicId: 'rec-pdf', fileUrl: PDF_ROUTE, mimeType: 'application/pdf' });
    vi.mocked(FileService.fetchFile).mockResolvedValue(
      new Blob(['%PDF'], { type: 'application/pdf' })
    );
    const user = userEvent.setup();

    const { container } = render(<ReceiptSection orderPublicId="ord-1" />, { wrapper });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'view' }));

    expect(FileService.fetchFile).toHaveBeenCalledWith(PDF_ROUTE);
    await waitFor(() =>
      expect(container.ownerDocument.querySelector('object')).toHaveAttribute('data', OBJECT_URL)
    );
    expect(fetchableUrls().every((url) => url.startsWith('blob:'))).toBe(true);
  });

  it('opens an image receipt through the same viewer', async () => {
    receipts({ publicId: 'rec-img', fileUrl: IMAGE_ROUTE, mimeType: 'image/jpeg' });
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/jpeg' }));
    const user = userEvent.setup();

    render(<ReceiptSection orderPublicId="ord-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'view' }));

    expect(FileService.fetchFile).toHaveBeenCalledWith(IMAGE_ROUTE);
    expect(fetchableUrls().every((url) => url.startsWith('blob:'))).toBe(true);
  });
});
