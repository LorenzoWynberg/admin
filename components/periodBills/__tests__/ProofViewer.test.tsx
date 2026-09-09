import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { ProofViewer } from '../ProofViewer';
import { PeriodBillService } from '@/services/periodBillService';

const OBJECT_URL = 'blob:mock-object-url';

/**
 * Every url this component puts in the DOM, from any attribute a browser would
 * fetch. `PeriodBillData.proofUrl` is an authenticated stream on a private
 * disk — reached from the DOM it carries no Authorization header and comes back
 * 401 — so the property under test is that all of these are object URLs over
 * bytes already fetched, and none is an http(s) route.
 */
function fetchableUrls(): string[] {
  return Array.from(document.querySelectorAll('[src], [href], [data]'))
    .flatMap((element) => [
      element.getAttribute('src'),
      element.getAttribute('href'),
      element.getAttribute('data'),
    ])
    .filter((value): value is string => value !== null);
}

vi.mock('@/services/periodBillService', () => ({
  PeriodBillService: { fetchProof: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  validationAttribute: (key: string) => key,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createObjectURL = vi.fn(() => OBJECT_URL);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.mocked(PeriodBillService.fetchProof).mockReset();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ProofViewer — the comprobante opens through the authenticated route', () => {
  it('fetches the bytes through the service and never points the DOM at the route', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockResolvedValue(
      new Blob(['bytes'], { type: 'image/png' })
    );
    const user = userEvent.setup();

    render(<ProofViewer publicId="pb-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'proof' }));

    await waitFor(() => expect(PeriodBillService.fetchProof).toHaveBeenCalledWith('pb-1'));

    const image = await screen.findByAltText('proof');
    expect(image).toHaveAttribute('src', OBJECT_URL);

    // The load-bearing half: a plain src/href at the api route renders fine
    // under test and 401s in a browser, so what is asserted is that nothing
    // fetchable points anywhere but at the bytes already in hand.
    const urls = fetchableUrls();
    expect(urls).not.toHaveLength(0);
    expect(urls.every((url) => url.startsWith('blob:'))).toBe(true);
  });

  it('does not fetch anything until an operator asks to see it', () => {
    vi.mocked(PeriodBillService.fetchProof).mockResolvedValue(new Blob(['bytes']));

    render(<ProofViewer publicId="pb-1" />, { wrapper });

    expect(PeriodBillService.fetchProof).not.toHaveBeenCalled();
  });

  it('embeds a PDF comprobante rather than rendering it as a broken image', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockResolvedValue(
      new Blob(['%PDF'], { type: 'application/pdf' })
    );
    const user = userEvent.setup();

    const { container } = render(<ProofViewer publicId="pb-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'proof' }));

    await waitFor(() => expect(container.ownerDocument.querySelector('object')).not.toBeNull());
    expect(container.ownerDocument.querySelector('object')).toHaveAttribute('data', OBJECT_URL);
    expect(screen.queryByAltText('proof')).not.toBeInTheDocument();
  });

  it('reports a missing comprobante instead of showing an empty frame', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockRejectedValue(new Error('404'));
    const user = userEvent.setup();

    render(<ProofViewer publicId="pb-1" />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'proof' }));

    expect(await screen.findByText('errors:period_bill.proof_missing')).toBeInTheDocument();
  });
});
