import { useCurrencyList } from './useCurrencyList';

export function useOrderCurrencySymbol(currencyCode?: string | null): string {
  const { data } = useCurrencyList();
  const currencies = data?.items || [];
  const match = currencyCode ? currencies.find((c) => c.code === currencyCode) : undefined;
  return match?.symbol || currencyCode || '₡';
}
