import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { EvidenceDialog } from '../EvidenceDialog';
import { EvidenceImage } from '../EvidenceImage';
import { FileService } from '@/services/fileService';

const OBJECT_URL = 'blob:mock-object-url';
const ROUTE = 'http://api.mandados.test:60/receipts/rec-1/file';

/**
 * Every url these components put in the DOM, from any attribute a browser
 * would fetch. The api serves evidence from routes behind `auth:sanctum` on a
 * disk with no public url — reached from the DOM they carry no Authorization
 * header and come back 401 — so the property under test is that all of these
 * are object URLs over bytes already fetched, and none is an http(s) route.
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

vi.mock('@/services/fileService', () => ({ FileService: { fetchFile: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createObjectURL = vi.fn(() => OBJECT_URL);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.mocked(FileService.fetchFile).mockReset();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function open(source: string | null = ROUTE) {
  return render(
    <EvidenceDialog
      source={source}
      title="till-slip.png"
      resourceLabel="receipt"
      onClose={vi.fn()}
    />,
    { wrapper }
  );
}

describe('EvidenceDialog', () => {
  it('renders the fetched bytes and never points the DOM at the route', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/png' }));

    open();

    const image = await screen.findByAltText('till-slip.png');
    expect(image).toHaveAttribute('src', OBJECT_URL);
    expect(FileService.fetchFile).toHaveBeenCalledWith(ROUTE);

    // The load-bearing half: a plain src/href at the api route renders fine
    // under test and 401s in a browser, so what is asserted is that nothing
    // fetchable points anywhere but at the bytes already in hand.
    const urls = fetchableUrls();
    expect(urls).not.toHaveLength(0);
    expect(urls.every((url) => url.startsWith('blob:'))).toBe(true);
  });

  // The download used to be a link straight at the file. It cannot be: the
  // browser sends no bearer token when it follows one.
  it('saves the fetched bytes rather than linking at the route', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/png' }));

    open();

    const download = await screen.findByRole('link', { name: /common:download/ });
    expect(download).toHaveAttribute('href', OBJECT_URL);
    expect(download).toHaveAttribute('download', 'till-slip.png');
  });

  it('embeds a PDF rather than rendering it as a broken image', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(
      new Blob(['%PDF'], { type: 'application/pdf' })
    );

    const { container } = open();

    await waitFor(() => expect(container.ownerDocument.querySelector('object')).not.toBeNull());
    expect(container.ownerDocument.querySelector('object')).toHaveAttribute('data', OBJECT_URL);
    expect(screen.queryByAltText('till-slip.png')).not.toBeInTheDocument();
  });

  it('fetches nothing until a file is opened', () => {
    open(null);

    expect(FileService.fetchFile).not.toHaveBeenCalled();
  });

  // A load FAILURE, never an absence: this only opens for a file the api has
  // already said exists. Told "there is nothing here", an operator stops
  // looking instead of retrying a 403 or a dropped connection.
  it('reports a failed load rather than claiming there is no file', async () => {
    vi.mocked(FileService.fetchFile).mockRejectedValue(new Error('403'));

    open();

    expect(await screen.findByText('resource:failed_to_load')).toBeInTheDocument();
    // Nothing fetchable at all, rather than `[].every(...)` — which passes on an
    // empty document and so asserts nothing.
    expect(fetchableUrls()).toHaveLength(0);
  });
});

describe('EvidenceImage', () => {
  it('renders an inline image from fetched bytes, not from the route', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/jpeg' }));

    render(
      <EvidenceImage
        source={ROUTE}
        alt="delivery photo"
        resourceLabel="delivery photo"
        className="h-full w-full object-cover"
      />,
      { wrapper }
    );

    const image = await screen.findByAltText('delivery photo');
    expect(image).toHaveAttribute('src', OBJECT_URL);
    expect(fetchableUrls().every((url) => url.startsWith('blob:'))).toBe(true);
  });

  // The box is the same size in all three states, so nothing on the card
  // jumps as the bytes land.
  it('reports a failed load in place of the image', async () => {
    vi.mocked(FileService.fetchFile).mockRejectedValue(new Error('403'));

    render(
      <EvidenceImage
        source={ROUTE}
        alt="delivery photo"
        resourceLabel="delivery photo"
        className="h-full w-full object-cover"
      />,
      { wrapper }
    );

    expect(await screen.findByText('resource:failed_to_load')).toBeInTheDocument();
    expect(screen.queryByAltText('delivery photo')).not.toBeInTheDocument();
  });
});
