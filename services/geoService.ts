import { api } from '@/lib/api/client';

type MapAddressData = App.Data.Address.MapAddressData;
type PlaceAutocompleteItemData = App.Data.Address.PlaceAutocompleteItemData;
type PlaceDetailsData = App.Data.Address.PlaceDetailsData;
type Single<T> = Api.Response.Single<T>;
type Multiple<T> = Api.Response.Multiple<T>;

export const GeoService = {
  async reverseGeocode(lat: number, lng: number): Promise<MapAddressData> {
    const res = await api.get<Single<MapAddressData>>(
      `/geo/reverse-geocode?latitude=${lat}&longitude=${lng}`
    );
    return res.item;
  },

  async autocomplete(
    input: string,
    lat: number,
    lng: number
  ): Promise<PlaceAutocompleteItemData[]> {
    const res = await api.get<Multiple<PlaceAutocompleteItemData>>(
      `/geo/places/autocomplete?input=${encodeURIComponent(input)}&lat=${lat}&lng=${lng}&radius=1500`
    );
    return res.items;
  },

  async placeDetails(placeId: string): Promise<PlaceDetailsData> {
    const res = await api.get<Single<PlaceDetailsData>>(`/geo/places/details/${placeId}`);
    return res.item;
  },
};
