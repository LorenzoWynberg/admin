import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { useApproveRefundRequest } from '../useApproveRefundRequest';
import { RefundRequestService } from '@/services/refundRequestService';
import { Enums } from '@/data/app-enums';
import { ApiError } from '@/lib/api/error';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/refundRequestService', () => ({
  RefundRequestService: { approve: vi.fn() },
}));

// The real helpers resolve translations from the API at runtime (see
// config/i18next.ts), which this test suite has no server for.
vi.mock('@/utils/lang', () => ({
  crudSuccessMessage: (action: string, resource: string) => `${action}:${resource}`,
  crudErrorMessage: (action: string, resource: string) => `${action}:${resource}`,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function approve() {
  const { result } = renderHook(() => useApproveRefundRequest(), { wrapper });
  result.current.mutate({ publicId: 'rr-1', data: { method: Enums.RefundMethod.Gateway } });
  return result;
}

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  vi.mocked(RefundRequestService.approve).mockReset();
});

// Every refusal the API returns here is one the admin can act on — a gateway
// refund on an account-billed delivery, a charge already given back — and each
// arrives already translated. Replacing it with a generic "error approving"
// throws away the only part that says what to do differently.
describe('useApproveRefundRequest — refusal reporting', () => {
  it("shows the API's own explanation when the approval is refused", async () => {
    const refusal =
      'A delivery billed to an account was never charged to a card, so there is nothing to reverse — it can only be refunded as credit.';
    vi.mocked(RefundRequestService.approve).mockRejectedValue(new ApiError(refusal, 422));

    approve();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(refusal);
  });

  it('falls back to the generic message when the failure carries none', async () => {
    vi.mocked(RefundRequestService.approve).mockRejectedValue(new Error('Network request failed'));

    approve();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('approving:refund_request');
  });
});
