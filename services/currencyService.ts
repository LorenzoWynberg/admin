import { api } from '@/lib/api/client';

type CurrencyData = App.Data.Currency.CurrencyData;
type UpdateCurrencyData = App.Data.Currency.UpdateCurrencyData;
type Single<T> = Api.Response.Single<T>;
type Paginated<T> = Api.Response.Paginated<T>;

export const CurrencyService = {
  /**
   * List all currencies with rate info
   */
  async list(): Promise<Paginated<CurrencyData>> {
    return api.get<Paginated<CurrencyData>>('/currencies');
  },

  /**
   * Get a single currency by code
   */
  async getByCode(code: string): Promise<CurrencyData> {
    const response = await api.get<Single<CurrencyData>>(`/currencies/${code}`);
    return response.item;
  },

  /**
   * Update currency settings
   */
  async update(code: string, data: UpdateCurrencyData): Promise<CurrencyData> {
    const response = await api.patch<Single<CurrencyData>>(`/currencies/${code}`, {
      body: data,
    });
    return response.item;
  },

  /**
   * Set a currency as the base currency
   */
  async setBase(code: string): Promise<CurrencyData> {
    const response = await api.post<Single<CurrencyData>>(`/currencies/${code}/set-base`);
    return response.item;
  },
};
