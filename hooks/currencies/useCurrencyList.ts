import { useQuery } from '@tanstack/react-query';
import { CurrencyService } from '@/services/currencyService';

interface UseCurrencyListParams {
  enabled?: boolean;
}

export function useCurrencyList(params: UseCurrencyListParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['currencies', 'list'],
    queryFn: () => CurrencyService.list(),
    enabled,
  });
}
