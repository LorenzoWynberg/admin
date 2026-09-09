import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { useRejectDeclaration, useSettlePeriodBill } from '../usePeriodBillMutations';
import { PeriodBillService } from '@/services/periodBillService';
import { ApiError } from '@/lib/api/error';
import { Enums } from '@/data/app-enums';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/periodBillService', () => ({
  PeriodBillService: {
    settle: vi.fn(),
    approveDeclaration: vi.fn(),
    rejectDeclaration: vi.fn(),
  },
}));

// The real helpers resolve translations from the api at runtime (see
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

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.success).mockClear();
  vi.mocked(PeriodBillService.settle).mockReset();
  vi.mocked(PeriodBillService.rejectDeclaration).mockReset();
});

// Every refusal on these routes is one the operator can act on — a currency
// this bill cannot settle in, a destination belonging to another method, a
// bucket still open — and each arrives from the api already translated.
// Replacing it with a generic "error updating" throws away the only part that
// says what to do differently.
describe('period-bill acts — refusal reporting', () => {
  it("shows the api's own explanation when a settlement is refused", async () => {
    const refusal = 'This bill can only be settled in CRC.';
    vi.mocked(PeriodBillService.settle).mockRejectedValue(new ApiError(refusal, 422));

    const { result } = renderHook(() => useSettlePeriodBill(), { wrapper });
    result.current.mutate({
      publicId: 'pb-1',
      data: {
        method: Enums.SettlementMethod.Cash as App.Enums.SettlementMethod,
        currencyCode: 'USD',
      },
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(refusal);
  });

  it('falls back to the generic message when the failure carries none', async () => {
    vi.mocked(PeriodBillService.settle).mockRejectedValue(new Error('Network request failed'));

    const { result } = renderHook(() => useSettlePeriodBill(), { wrapper });
    result.current.mutate({
      publicId: 'pb-1',
      data: {
        method: Enums.SettlementMethod.Cash as App.Enums.SettlementMethod,
        currencyCode: 'CRC',
      },
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('updating:period_bill');
  });

  it('reports a rejection under the act the operator pressed, not a denial', async () => {
    vi.mocked(PeriodBillService.rejectDeclaration).mockResolvedValue(
      {} as App.Data.PeriodBill.PeriodBillData
    );

    const { result } = renderHook(() => useRejectDeclaration(), { wrapper });
    result.current.mutate({ publicId: 'pb-1', notes: 'not in the account' });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('rejected:period_bill');
  });
});
