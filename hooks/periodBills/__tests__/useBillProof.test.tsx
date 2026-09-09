import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useBillProof } from '../useBillProof';
import { PeriodBillService } from '@/services/periodBillService';

const OBJECT_URL = 'blob:mock-object-url';

vi.mock('@/services/periodBillService', () => ({
  PeriodBillService: { fetchProof: vi.fn() },
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

describe('useBillProof', () => {
  it('fetches nothing while the viewer is closed', () => {
    renderHook(() => useBillProof('pb-1', false), { wrapper });

    expect(PeriodBillService.fetchProof).not.toHaveBeenCalled();
  });

  it('wraps the fetched bytes in an object URL and reports their type', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockResolvedValue(
      new Blob(['bytes'], { type: 'application/pdf' })
    );

    const { result } = renderHook(() => useBillProof('pb-1', true), { wrapper });

    await waitFor(() => expect(result.current.url).toBe(OBJECT_URL));
    expect(result.current.contentType).toBe('application/pdf');
  });

  // An object URL pins its blob in memory until it is revoked, and a
  // verification workspace opens many of these in a sitting.
  it('releases the object URL when the viewer goes away', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockResolvedValue(new Blob(['bytes']));

    const { result, unmount } = renderHook(() => useBillProof('pb-1', true), { wrapper });
    await waitFor(() => expect(result.current.url).toBe(OBJECT_URL));

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  it('reports a failure rather than an empty url that reads as "no proof"', async () => {
    vi.mocked(PeriodBillService.fetchProof).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useBillProof('pb-1', true), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.url).toBeNull();
  });
});
