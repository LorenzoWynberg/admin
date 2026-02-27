'use client';

import { useState, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import {
  PlacesAutocompleteInner,
  type PlaceResult,
} from '@/components/shared/PlacesAutocompleteInput';
import { GeoService } from '@/services/geoService';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const DEFAULT_CENTER = { lat: 9.9281, lng: -84.0907 };

export interface MapAddressPickerProps {
  initialCenter?: { lat: number; lng: number };
  onSelect: (place: PlaceResult) => void;
}

function MapPickerContent({ initialCenter, onSelect }: MapAddressPickerProps) {
  const map = useMap();
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialCenter ?? null
  );
  const [addressText, setAddressText] = useState('');
  const reverseGeocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const data = await GeoService.reverseGeocode(lat, lng);
        setAddressText(data.humanReadableAddress);
        onSelect({
          placeId: '',
          description: data.humanReadableAddress,
          latitude: lat,
          longitude: lng,
        });
      } catch {
        // Reverse geocode failed — keep position, clear text
        setAddressText('');
      }
    },
    [onSelect]
  );

  const moveMarkerTo = useCallback(
    (lat: number, lng: number) => {
      setMarkerPosition({ lat, lng });
      map?.panTo({ lat, lng });

      if (reverseGeocodeTimeout.current) clearTimeout(reverseGeocodeTimeout.current);
      reverseGeocodeTimeout.current = setTimeout(() => {
        handleReverseGeocode(lat, lng);
      }, 300);
    },
    [map, handleReverseGeocode]
  );

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      setMarkerPosition({ lat: place.latitude, lng: place.longitude });
      setAddressText(place.description);
      map?.panTo({ lat: place.latitude, lng: place.longitude });
      map?.setZoom(17);
      onSelect(place);
    },
    [map, onSelect]
  );

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const lat = e.detail.latLng?.lat;
      const lng = e.detail.latLng?.lng;
      if (lat != null && lng != null) {
        moveMarkerTo(lat, lng);
      }
    },
    [moveMarkerTo]
  );

  const handleDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat != null && lng != null) {
        moveMarkerTo(lat, lng);
      }
    },
    [moveMarkerTo]
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative h-[350px] w-full overflow-hidden rounded-lg border">
          <Map
            defaultCenter={initialCenter ?? DEFAULT_CENTER}
            defaultZoom={initialCenter ? 17 : 12}
            mapId="address-picker-map"
            className="h-full w-full"
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            {markerPosition && (
              <AdvancedMarker position={markerPosition} draggable onDragEnd={handleDragEnd}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 3.362 2.98l.464.313Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </AdvancedMarker>
            )}
          </Map>

          {/* Search bar overlay */}
          <div className="absolute top-3 right-3 left-3 z-10">
            <PlacesAutocompleteInner onPlaceSelect={handlePlaceSelect} />
          </div>
        </div>
      </div>

      {addressText && <p className="text-muted-foreground text-sm">{addressText}</p>}
    </div>
  );
}

export function MapAddressPicker(props: MapAddressPickerProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted text-muted-foreground flex h-[350px] items-center justify-center rounded-lg border">
        <p className="text-sm">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <MapPickerContent {...props} />
    </APIProvider>
  );
}
