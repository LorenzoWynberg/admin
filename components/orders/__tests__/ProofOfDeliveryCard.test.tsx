import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ProofOfDeliveryCard } from '../ProofOfDeliveryCard';
import { OrderService } from '@/services/orderService';
import { FileService } from '@/services/fileService';

type RouteStopData = App.Data.Route.RouteStopData;

const OBJECT_URL = 'blob:mock-object-url';
const PHOTO_ROUTE = 'http://api.mandados.test:60/route-stops/7/pod-photo';
const SIGNATURE_ROUTE = 'http://api.mandados.test:60/route-stops/7/pod-signature';

/** Every url the card puts in the DOM from an attribute a browser would fetch. */
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
vi.mock('@/services/orderService', () => ({ OrderService: { getPod: vi.fn() } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/utils/lang', () => ({ validationAttribute: (key: string) => key }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createObjectURL = vi.fn(() => OBJECT_URL);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.mocked(FileService.fetchFile).mockReset();
  vi.mocked(OrderService.getPod).mockReset();
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function pod(overrides: Partial<RouteStopData> = {}): RouteStopData {
  return {
    podPhotoUrl: PHOTO_ROUTE,
    podSignatureUrl: SIGNATURE_ROUTE,
    ...overrides,
  } as RouteStopData;
}

describe('ProofOfDeliveryCard — the delivery evidence loads through its authorized routes', () => {
  it('fetches both files and points the DOM at neither route', async () => {
    vi.mocked(OrderService.getPod).mockResolvedValue(pod());
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/jpeg' }));

    render(<ProofOfDeliveryCard orderPublicId="ord-1" />, { wrapper });

    expect(await screen.findByAltText('routes:pod.photo_title')).toHaveAttribute('src', OBJECT_URL);
    expect(await screen.findByAltText('routes:pod.signature_title')).toHaveAttribute(
      'src',
      OBJECT_URL
    );

    expect(FileService.fetchFile).toHaveBeenCalledWith(PHOTO_ROUTE);
    expect(FileService.fetchFile).toHaveBeenCalledWith(SIGNATURE_ROUTE);

    const urls = fetchableUrls();
    expect(urls).not.toHaveLength(0);
    expect(urls.every((url) => url.startsWith('blob:'))).toBe(true);
  });

  // A stop can be signed for without a photo, or photographed without a
  // signature. Neither absence is a failure to report.
  it('asks only for the file that exists', async () => {
    vi.mocked(OrderService.getPod).mockResolvedValue(pod({ podSignatureUrl: null }));
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/jpeg' }));

    render(<ProofOfDeliveryCard orderPublicId="ord-1" />, { wrapper });

    await screen.findByAltText('routes:pod.photo_title');
    expect(FileService.fetchFile).toHaveBeenCalledTimes(1);
    expect(FileService.fetchFile).toHaveBeenCalledWith(PHOTO_ROUTE);
  });

  it('says the photo failed to load rather than showing an empty frame', async () => {
    vi.mocked(OrderService.getPod).mockResolvedValue(pod({ podSignatureUrl: null }));
    vi.mocked(FileService.fetchFile).mockRejectedValue(new Error('403'));

    render(<ProofOfDeliveryCard orderPublicId="ord-1" />, { wrapper });

    expect(await screen.findByText('resource:failed_to_load')).toBeInTheDocument();
    expect(screen.queryByAltText('routes:pod.photo_title')).not.toBeInTheDocument();
  });
});
