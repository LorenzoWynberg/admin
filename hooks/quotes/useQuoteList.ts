import { useQuery } from '@tanstack/react-query';
import { QuoteService } from '@/services/quoteService';

interface UseQuoteListParams {
  page?: number;
  perPage?: number;
  status?: string;
  orderId?: number;
  search?: string;
  enabled?: boolean;
}

export function useQuoteList(params: UseQuoteListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['quotes', 'list', queryParams],
    queryFn: () => QuoteService.list(queryParams),
    enabled,
  });
}
