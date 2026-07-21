import { api } from '@/lib/api/client';

type SettingData = App.Data.Setting.SettingData;
type UpdateSettingData = App.Data.Setting.UpdateSettingData;
type Single<T> = Api.Response.Single<T>;

type ExchangeRateModeResponse = { exchangeRateMode: string };
type SupportedVehicleTypesResponse = { supportedVehicleTypes: string[] };

export const SettingService = {
  /**
   * Get service window configuration
   */
  async getServiceWindow(): Promise<SettingData> {
    const response = await api.get<Single<SettingData>>('/settings/service-window');
    return response.item;
  },

  /**
   * Update service window configuration (admin only)
   */
  async updateServiceWindow(data: UpdateSettingData): Promise<SettingData> {
    const response = await api.patch<Single<SettingData>>('/settings/service-window', data);
    return response.item;
  },

  /**
   * Get exchange rate mode
   */
  async getExchangeRateMode(): Promise<ExchangeRateModeResponse> {
    const response = await api.get<ExchangeRateModeResponse & { message: string }>(
      '/settings/exchange-rate-mode'
    );
    return { exchangeRateMode: response.exchangeRateMode };
  },

  /**
   * Update exchange rate mode (admin only)
   */
  async updateExchangeRateMode(exchangeRateMode: string): Promise<ExchangeRateModeResponse> {
    const response = await api.patch<ExchangeRateModeResponse & { message: string }>(
      '/settings/exchange-rate-mode',
      { exchangeRateMode }
    );
    return { exchangeRateMode: response.exchangeRateMode };
  },

  /**
   * Get supported vehicle types
   */
  async getSupportedVehicleTypes(): Promise<SupportedVehicleTypesResponse> {
    const response = await api.get<SupportedVehicleTypesResponse & { message: string }>(
      '/settings/supported-vehicle-types'
    );
    return { supportedVehicleTypes: response.supportedVehicleTypes };
  },

  /**
   * Update supported vehicle types (admin only)
   */
  async updateSupportedVehicleTypes(
    supportedVehicleTypes: string[]
  ): Promise<SupportedVehicleTypesResponse> {
    const response = await api.patch<SupportedVehicleTypesResponse & { message: string }>(
      '/settings/supported-vehicle-types',
      { supportedVehicleTypes }
    );
    return { supportedVehicleTypes: response.supportedVehicleTypes };
  },
};
