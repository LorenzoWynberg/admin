import { useQuery } from '@tanstack/react-query';
import { ExchangeRateService } from '@/services/exchangeRateService';

interface UseExchangeRateListParams {
  enabled?: boolean;
}

export function useExchangeRateList(params: UseExchangeRateListParams = {}) {
  const { enabled = true } = params;

  return useQuery({
    queryKey: ['exchange-rates', 'list'],
    queryFn: () => ExchangeRateService.list(),
    enabled,
  });
}

interface UseExchangeRateHistoryParams {
  from: string;
  to: string;
  currency?: string;
  enabled?: boolean;
}

export function useExchangeRateHistory(params: UseExchangeRateHistoryParams) {
  const { from, to, currency, enabled = true } = params;

  return useQuery({
    queryKey: ['exchange-rates', 'history', { from, to, currency }],
    queryFn: () => ExchangeRateService.history({ from, to, currency }),
    enabled: enabled && Boolean(from && to),
  });
}
