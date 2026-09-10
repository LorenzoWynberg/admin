import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@/providers/EchoProvider';

/**
 * Listen for needs-attention broadcast events and invalidate the query cache.
 * This should be called from a component that's mounted when authenticated.
 *
 * `.needs-attention.changed` fires for both an order-side change and a
 * period-bill one, so this listener spans two domains but stays beside
 * orders: `EchoProvider` is its only call site, and one subscription on the
 * shared `admin` channel already covers both queues (the same shape
 * `useNotificationBroadcast` uses for its `refund-requests` key).
 *
 * Keys are invalidated individually rather than by `period-bills` prefix: the
 * event carries no bill id, so a prefix invalidation would evict every open
 * bill-detail cache (`['period-bills', publicId]`) on every occurrence —
 * unlike `usePeriodBillMutations`, which knows the one bill that changed and
 * prefix-invalidates on purpose.
 */
export function useNeedsAttentionBroadcast() {
  const echo = useEcho();
  const queryClient = useQueryClient();

  // Use ref to avoid re-subscribing when queryClient reference changes
  const queryClientRef = useRef(queryClient);
  useEffect(() => {
    queryClientRef.current = queryClient;
  });

  useEffect(() => {
    if (!echo) return;

    echo.private('admin').listen('.needs-attention.changed', () => {
      queryClientRef.current.invalidateQueries({
        queryKey: ['orders', 'needs-attention'],
      });
      queryClientRef.current.invalidateQueries({
        queryKey: ['orders', 'pending-reconciliation'],
      });
      queryClientRef.current.invalidateQueries({
        queryKey: ['period-bills', 'needs-attention'],
      });
    });

    return () => {
      echo.private('admin').stopListening('.needs-attention.changed');
    };
  }, [echo]);
}
