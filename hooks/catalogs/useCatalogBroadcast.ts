import { useEffect } from 'react';
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

  useEffect(() => {
    if (!echo) return;

    echo.channel('catalogs').listen('.catalogs.updated', () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    });
  }, [echo, reset, queryClient]);
}
