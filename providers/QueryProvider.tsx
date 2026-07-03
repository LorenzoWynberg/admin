'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

const ONE_DAY = 1000 * 60 * 60 * 24;

// Noop on the server (no localStorage); real persistence in the browser. This
// makes the last-seen data render instantly and stay available offline (PWA).
const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: ONE_DAY, // keep entries long enough to persist for offline
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              // Don't retry on auth errors
              if (
                error &&
                typeof error === 'object' &&
                'status' in error &&
                (error.status === 401 || error.status === 403)
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  // Bust the persisted cache when the auth token changes, so one account never
  // sees another's cached data on a shared browser (and logout clears it).
  const token = useAuthStore((state) => state.token);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: ONE_DAY, buster: token ?? 'anon' }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
