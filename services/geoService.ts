import { api } from '@/lib/api/client';

type MapAddressData = App.Data.Address.MapAddressData;

export const GeoService = {
  async reverseGeocode(lat: number, lng: number): Promise<MapAddressData> {
    return api.get<MapAddressData>(`/geo/reverse-geocode?latitude=${lat}&longitude=${lng}`);
  },
};
