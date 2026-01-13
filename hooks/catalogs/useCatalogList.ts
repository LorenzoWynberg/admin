import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';

interface UseCatalogListParams {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

export function useCatalogList(params: UseCatalogListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['catalogs', 'list', queryParams],
    queryFn: () => CatalogService.list(queryParams),
    enabled,
  });
}
