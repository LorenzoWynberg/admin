import { api } from '@/lib/api/client';

type MapAddressData = App.Data.Address.MapAddressData;
type PlaceAutocompleteItemData = App.Data.Address.PlaceAutocompleteItemData;
type PlaceDetailsData = App.Data.Address.PlaceDetailsData;

export const GeoService = {
  async reverseGeocode(lat: number, lng: number): Promise<MapAddressData> {
    return api.get<MapAddressData>(`/geo/reverse-geocode?latitude=${lat}&longitude=${lng}`);
  },

  async autocomplete(
    input: string,
    lat: number,
    lng: number
  ): Promise<PlaceAutocompleteItemData[]> {
    return api.get<PlaceAutocompleteItemData[]>(
      `/geo/places/autocomplete?input=${encodeURIComponent(input)}&lat=${lat}&lng=${lng}&radius=1500`
    );
  },

  async placeDetails(placeId: string): Promise<PlaceDetailsData> {
    return api.get<PlaceDetailsData>(`/geo/places/details/${placeId}`);
  },
};
