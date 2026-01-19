import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Hook that loads all catalogs with elements into the store.
 * Call this once at app initialization (e.g., in layout or provider).
 */
export function useLoadCatalogs() {
  const catalogs = useCatalogStore((state) => state.catalogs);
  const setCatalogs = useCatalogStore((state) => state.setCatalogs);
  const setElements = useCatalogStore((state) => state.setElements);
  const token = useAuthStore((state) => state.token);

  // Track the last dataUpdatedAt to detect refetches
  const lastDataUpdatedAt = useRef<number>(0);

  // Always enabled when authenticated (allows refetch to work)
  const query = useQuery({
    queryKey: ['catalogs', 'all'],
    queryFn: () => CatalogService.all(),
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
    // Don't refetch on mount if we already have data in store
    refetchOnMount: catalogs.length === 0,
  });

  useEffect(() => {
    // Update store when we have new data (initial load or refetch)
    if (query.data && query.dataUpdatedAt > lastDataUpdatedAt.current) {
      lastDataUpdatedAt.current = query.dataUpdatedAt;
      const fetchedCatalogs = query.data;
      const elements = fetchedCatalogs.flatMap((c) => c.elements ?? []);

      setCatalogs(fetchedCatalogs);
      setElements(elements);
    }
  }, [query.data, query.dataUpdatedAt, setCatalogs, setElements]);

  return {
    isLoading: query.isLoading,
    isLoaded: catalogs.length > 0,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reactive hooks for catalog data (properly subscribe to store for re-renders)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a catalog element by ID. Reactive - re-renders when elements change.
 */
export function useCatalogElement(id: number | null | undefined) {
  return useCatalogStore((state) => (id ? state.elements.find((e) => e.id === id) : undefined));
}

/**
 * Get a catalog by ID. Reactive - re-renders when catalogs change.
 */
export function useCatalog(id: number | null | undefined) {
  return useCatalogStore((state) => (id ? state.catalogs.find((c) => c.id === id) : undefined));
}

/**
 * Get a catalog by code. Reactive - re-renders when catalogs change.
 */
export function useCatalogByCode(code: string | null | undefined) {
  return useCatalogStore((state) =>
    code ? state.catalogs.find((c) => c.code === code) : undefined
  );
}

/**
 * Get all elements for a catalog by catalog ID. Reactive.
 */
export function useCatalogElements(catalogId: number | null | undefined) {
  return useCatalogStore((state) =>
    catalogId ? state.elements.filter((e) => e.catalogId === catalogId) : []
  );
}

/**
 * Get all elements for a catalog by catalog code. Reactive.
 */
export function useCatalogElementsByCode(catalogCode: string | null | undefined) {
  return useCatalogStore((state) => {
    if (!catalogCode) return [];
    const catalog = state.catalogs.find((c) => c.code === catalogCode);
    if (!catalog) return [];
    return state.elements.filter((e) => e.catalogId === catalog.id);
  });
}
