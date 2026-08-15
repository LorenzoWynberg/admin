import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@/providers/EchoProvider';

/**
 * Listen for needs-attention broadcast events and invalidate the query cache.
 * This should be called from a component that's mounted when authenticated.
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
    });

    return () => {
      echo.private('admin').stopListening('.needs-attention.changed');
    };
  }, [echo]);
}
