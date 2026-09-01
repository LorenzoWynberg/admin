import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { useDenyRefundRequest } from '../useDenyRefundRequest';
import { RefundRequestService } from '@/services/refundRequestService';
import { ApiError } from '@/lib/api/error';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/refundRequestService', () => ({
  RefundRequestService: { deny: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function deny() {
  const { result } = renderHook(() => useDenyRefundRequest(), { wrapper });
  result.current.mutate({ publicId: 'rr-1', adminNotes: null });
  return result;
}

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  vi.mocked(RefundRequestService.deny).mockReset();
});

// The denial endpoint refuses for one reason the admin can act on — the
// request was already resolved, usually by another admin — and it arrives
// already translated. Reporting "failed to deny" in its place hides the fact
// that the work is already done.
describe('useDenyRefundRequest — refusal reporting', () => {
  it("shows the API's own explanation when the denial is refused", async () => {
    const refusal = 'This refund request has already been resolved.';
    vi.mocked(RefundRequestService.deny).mockRejectedValue(new ApiError(refusal, 422));

    deny();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(refusal);
  });

  it('falls back to the generic message when the failure carries none', async () => {
    vi.mocked(RefundRequestService.deny).mockRejectedValue(new Error('Network request failed'));

    deny();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('resource:error.updating');
  });
});
