import { api } from '@/lib/api/client';

type ExchangeRateData = App.Data.ExchangeRate.ExchangeRateData;
type Paginated<T> = Api.Response.Paginated<T>;
type SuccessBasic = Api.Response.SuccessBasic;

interface HistoryParams {
  from: string;
  to: string;
  currency?: string;
}

interface SyncParams {
  currencies?: string[];
}

interface SyncResult extends SuccessBasic {
  extra: {
    results: Record<string, { success: boolean; rate?: number; error?: string }>;
    successCount: number;
    failedCount: number;
  };
}

export const ExchangeRateService = {
  /**
   * List today's exchange rates
   */
  async list(): Promise<Paginated<ExchangeRateData>> {
    return api.get<Paginated<ExchangeRateData>>('/exchange-rates');
  },

  /**
   * Get historical exchange rates
   */
  async history(params: HistoryParams): Promise<Paginated<ExchangeRateData>> {
    const query = new URLSearchParams();
    query.set('from', params.from);
    query.set('to', params.to);
    if (params.currency) query.set('currency', params.currency);
    return api.get<Paginated<ExchangeRateData>>(`/exchange-rates/history?${query.toString()}`);
  },

  /**
   * Manually trigger exchange rate sync
   */
  async sync(params: SyncParams = {}): Promise<SyncResult> {
    return api.post<SyncResult>('/exchange-rates/sync', { body: params });
  },
};
