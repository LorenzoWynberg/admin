import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';

interface UseCatalogParams {
  enabled?: boolean;
}

export function useCatalog(id: number, params: UseCatalogParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['catalogs', 'detail', id],
    queryFn: () => CatalogService.getById(id),
    enabled: enabled && id > 0,
  });
}
