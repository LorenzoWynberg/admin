import { useQuery } from '@tanstack/react-query';
import { QuoteService } from '@/services/quoteService';

interface UseQuoteParams {
  enabled?: boolean;
}

export function useQuote(id: number, params: UseQuoteParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['quotes', 'detail', id],
    queryFn: () => QuoteService.getById(id),
    enabled: enabled && id > 0,
  });
}
