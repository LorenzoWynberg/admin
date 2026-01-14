import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';

interface UseCatalogElementsParams {
  enabled?: boolean;
}

export function useCatalogElements(code: string, params: UseCatalogElementsParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['catalogs', 'elements', code],
    queryFn: () => CatalogService.getElementsByCode(code),
    enabled: enabled && !!code,
  });
}
