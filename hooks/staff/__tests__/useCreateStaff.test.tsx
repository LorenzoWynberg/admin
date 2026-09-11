import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { useCreateStaff } from '../useStaffMutations';
import { StaffService } from '@/services/staffService';
import { ApiError } from '@/lib/api/error';
import { Enums } from '@/data/app-enums';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/services/staffService', () => ({
  StaffService: { create: vi.fn() },
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

const staffPayload: App.Data.User.StoreStaffData = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  dateOfBirth: '1990-01-01',
  phone: '+506 8888-8888',
  sexId: 1,
  langCode: 'en',
  role: Enums.Role.DISPATCH as App.Enums.Role,
};

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  vi.mocked(StaffService.create).mockReset();
});

describe('useCreateStaff — there is no Staff model, so it keys off user/users', () => {
  it('invalidates the users cache and shows the user-keyed success toast', async () => {
    vi.mocked(StaffService.create).mockResolvedValue({
      id: 1,
      publicId: 'user-1',
      role: 'dispatch',
    } as unknown as App.Data.User.UserData);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateStaff(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate(staffPayload);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('created:user'));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] });
    // No password ever leaves this hook toward the service.
    expect(StaffService.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ password: expect.anything() })
    );
  });

  it("shows the API's own explanation when creation is refused (403/422)", async () => {
    const refusal = 'Role must be dispatch or admin.';
    vi.mocked(StaffService.create).mockRejectedValue(new ApiError(refusal, 422));

    const { result } = renderHook(() => useCreateStaff(), { wrapper });
    result.current.mutate(staffPayload);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(refusal);
  });

  it('falls back to the generic user-creation error when the failure carries none', async () => {
    vi.mocked(StaffService.create).mockRejectedValue(new Error('Network request failed'));

    const { result } = renderHook(() => useCreateStaff(), { wrapper });
    result.current.mutate(staffPayload);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('creating:user');
  });
});
