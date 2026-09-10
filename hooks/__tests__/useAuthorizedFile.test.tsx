import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAuthorizedFile } from '../useAuthorizedFile';
import { FileService } from '@/services/fileService';

const OBJECT_URL = 'blob:mock-object-url';
const ROUTE = 'http://api.mandados.test:60/receipts/rec-1/file';

vi.mock('@/services/fileService', () => ({
  FileService: { fetchFile: vi.fn() },
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
  vi.mocked(FileService.fetchFile).mockReset();
  createObjectURL.mockReset();
  createObjectURL.mockReturnValue(OBJECT_URL);
  revokeObjectURL.mockClear();
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAuthorizedFile', () => {
  it('fetches the file through the authorized route and reports its type', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(
      new Blob(['%PDF'], { type: 'application/pdf' })
    );

    const { result } = renderHook(() => useAuthorizedFile(ROUTE), { wrapper });

    await waitFor(() => expect(result.current.url).toBe(OBJECT_URL));
    expect(FileService.fetchFile).toHaveBeenCalledWith(ROUTE);
    expect(result.current.contentType).toBe('application/pdf');
  });

  // The accessors are nullable: a stop with no signature, a payment with no
  // proof. Asking for one is not an error, it is nothing to ask for.
  it('fetches nothing when there is no file', () => {
    renderHook(() => useAuthorizedFile(null), { wrapper });

    expect(FileService.fetchFile).not.toHaveBeenCalled();
  });

  // An object URL pins its blob in memory for the life of the tab, and an
  // order page opens several of these.
  it('releases the object URL when it goes away', async () => {
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes']));

    const { result, unmount } = renderHook(() => useAuthorizedFile(ROUTE), { wrapper });
    await waitFor(() => expect(result.current.url).toBe(OBJECT_URL));

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  // The whole query cache is persisted to localStorage (providers/QueryProvider.tsx)
  // and JSON.stringify flattens a Blob to `{}`. Such an entry rehydrates as a
  // SUCCESS holding nothing, and `staleTime: Infinity` means nothing refetches
  // it — so before this guard the next render handed `{}` to createObjectURL,
  // which throws. There is no error.tsx under app/, so that took the whole
  // order page down rather than one image.
  it('refetches a blob localStorage flattened to {} instead of crashing on it', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['authorized-file', ROUTE], {} as Blob);
    vi.mocked(FileService.fetchFile).mockResolvedValue(new Blob(['bytes'], { type: 'image/png' }));

    function persisted({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useAuthorizedFile(ROUTE), { wrapper: persisted });

    // Never handed to createObjectURL, and reported as still loading rather
    // than as an empty box, while it recovers.
    expect(createObjectURL).not.toHaveBeenCalledWith({});
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.url).toBe(OBJECT_URL));
    expect(FileService.fetchFile).toHaveBeenCalledWith(ROUTE);
  });

  it('reports a failure rather than an empty url that reads as "no file"', async () => {
    vi.mocked(FileService.fetchFile).mockRejectedValue(new Error('403'));

    const { result } = renderHook(() => useAuthorizedFile(ROUTE), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.url).toBeNull();
  });
});
