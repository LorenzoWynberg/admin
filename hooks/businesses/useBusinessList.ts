import { useQuery } from '@tanstack/react-query';
import { BusinessService } from '@/services/businessService';

interface UseBusinessListParams {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

export function useBusinessList(params: UseBusinessListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['businesses', 'list', queryParams],
    queryFn: () => BusinessService.list(queryParams),
    enabled,
  });
}
