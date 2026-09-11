import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { InvoiceSection } from '../InvoiceSection';
import { useOrderInvoices } from '@/hooks/invoices';
import { FileService } from '@/services/fileService';

type InvoiceData = App.Data.Invoice.InvoiceData;

const OBJECT_URL = 'blob:mock-object-url';

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
vi.mock('@/hooks/invoices', () => ({ useOrderInvoices: vi.fn() }));
vi.mock('@/hooks/currencies', () => ({ useOrderCurrencySymbol: () => '₡' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/utils/lang', () => ({
  capitalize: (value: string) => value,
  modelLabel: (model: string) => model,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createObjectURL = vi.fn(() => OBJECT_URL);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.mocked(FileService.fetchFile).mockReset();
  vi.mocked(useOrderInvoices).mockReturnValue({
    data: [
      {
        publicId: 'inv-1',
        documentNumber: 'REC-2026-0001',
        type: 'payment_receipt',
        total: 1000,
      } as InvoiceData,
    ],
    isLoading: false,
    error: null,
  } as ReturnType<typeof useOrderInvoices>);
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// `GET invoices/{invoice}/pdf` sits behind `auth:sanctum`. This section used to
// render a plain `<a href>` at it, which the browser follows without a bearer
// token — so the document was already unreachable before the evidence files
// moved to authorized routes, by the same mistake.
describe('InvoiceSection — the PDF opens through its authorized route', () => {
  it('links nowhere until the document is asked for', () => {
    render(<InvoiceSection orderPublicId="ord-1" />, { wrapper });

    expect(FileService.fetchFile).not.toHaveBeenCalled();
    expect(fetchableUrls().some((url) => url.includes('/pdf'))).toBe(false);
  });

  it('fetches the document and embeds the bytes rather than linking at the route', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(
      new Blob(['%PDF'], { type: 'application/pdf' })
    );
    const user = userEvent.setup();

    const { container } = render(<InvoiceSection orderPublicId="ord-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'PDF' }));

    expect(FileService.fetchFile).toHaveBeenCalledWith('/invoices/inv-1/pdf');

    await waitFor(() =>
      expect(container.ownerDocument.querySelector('object')).toHaveAttribute('data', OBJECT_URL)
    );

    const urls = fetchableUrls();
    expect(urls).not.toHaveLength(0);
    expect(urls.every((url) => url.startsWith('blob:'))).toBe(true);
  });

  it('reports a failed load rather than a silently empty document', async () => {
    vi.mocked(FileService.fetchFile).mockRejectedValue(new Error('403'));
    const user = userEvent.setup();

    render(<InvoiceSection orderPublicId="ord-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'PDF' }));

    expect(await screen.findByText('resource:failed_to_load')).toBeInTheDocument();
  });
});
