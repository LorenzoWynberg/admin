import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Enums } from '@/data/app-enums';

const STORAGE_KEY = 'admin-auth-storage';

// The store rehydrates from localStorage while its module evaluates, so each
// case seeds storage first and then imports a fresh copy of the module.
async function loadStore() {
  vi.resetModules();
  const { useAuthStore } = await import('../useAuthStore');
  return useAuthStore;
}

beforeEach(() => {
  localStorage.clear();
});

describe('useAuthStore hydration', () => {
  it('flags the store hydrated after restoring a persisted session', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { user: { id: 1, role: Enums.Role.ADMIN }, token: 'tok' },
        version: 0,
      })
    );

    const useAuthStore = await loadStore();

    await vi.waitFor(() => expect(useAuthStore.getState().hydrated).toBe(true));
    expect(useAuthStore.getState().token).toBe('tok');
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('flags the store hydrated when nothing was persisted', async () => {
    const useAuthStore = await loadStore();

    await vi.waitFor(() => expect(useAuthStore.getState().hydrated).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
