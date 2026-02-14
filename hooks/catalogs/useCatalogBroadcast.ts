import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@/providers/EchoProvider';
import { useCatalogStore } from '@/stores/useCatalogStore';

/**
 * Listen for catalog broadcast events and refresh catalogs when they change.
 * This should be called from a component that's mounted when authenticated.
 */
export function useCatalogBroadcast() {
  const echo = useEcho();
  const reset = useCatalogStore((state) => state.reset);
  const queryClient = useQueryClient();

  // Use refs to avoid re-subscribing when callbacks change
  const callbacksRef = useRef({ reset, queryClient });
  useEffect(() => {
    callbacksRef.current = { reset, queryClient };
  });

  useEffect(() => {
    if (!echo) return;

    echo.channel('catalogs').listen('.catalogs.updated', () => {
      callbacksRef.current.reset();
      callbacksRef.current.queryClient.invalidateQueries({
        queryKey: ['catalogs'],
      });
    });

    return () => {
      echo.leaveChannel('catalogs');
    };
  }, [echo]);
}
