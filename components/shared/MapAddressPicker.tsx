'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, useMap, type MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import {
  PlacesAutocompleteInner,
  type PlaceResult,
} from '@/components/shared/PlacesAutocompleteInput';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const DEFAULT_CENTER = { lat: 9.9281, lng: -84.0907 };

export interface MapAddressPickerProps {
  initialCenter?: { lat: number; lng: number };
  onCoordsChange: (coords: { lat: number; lng: number; placeId?: string }) => void;
}

function MapPickerContent({ initialCenter, onCoordsChange }: MapAddressPickerProps) {
  const map = useMap();
  const [pinLifted, setPinLifted] = useState(false);
  const programmaticMove = useRef(false);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Report initial center on mount
  useEffect(() => {
    if (initialCenter) {
      onCoordsChange({ lat: initialCenter.lat, lng: initialCenter.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liftPin = useCallback(() => {
    setPinLifted(true);
    // Safety timeout — force settle after 2s (mirrors client pattern)
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => setPinLifted(false), 2000);
  }, []);

  const settlePin = useCallback(() => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    setPinLifted(false);
  }, []);

  const handleCameraChanged = useCallback(
    (e: MapCameraChangedEvent) => {
      settlePin();
      if (programmaticMove.current) {
        programmaticMove.current = false;
        return;
      }
      const { lat, lng } = e.detail.center;
      onCoordsChange({ lat, lng });
    },
    [onCoordsChange, settlePin]
  );

  const handleDragStart = useCallback(() => {
    liftPin();
  }, [liftPin]);

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      programmaticMove.current = true;
      map?.panTo({ lat: place.latitude, lng: place.longitude });
      map?.setZoom(17);
      onCoordsChange({
        lat: place.latitude,
        lng: place.longitude,
        placeId: place.placeId,
      });
    },
    [map, onCoordsChange]
  );

  return (
    <div className="space-y-3">
      {/* Search bar above the map — avoids collision with Google map controls */}
      <PlacesAutocompleteInner onPlaceSelect={handlePlaceSelect} />

      <div className="relative h-[500px] w-full overflow-hidden rounded-lg border">
        <Map
          defaultCenter={initialCenter ?? DEFAULT_CENTER}
          defaultZoom={initialCenter ? 17 : 12}
          mapId="address-picker-map"
          className="h-full w-full"
          gestureHandling="greedy"
          onCameraChanged={handleCameraChanged}
          onDragstart={handleDragStart}
        />

        {/* Fixed center pin — pointer-events: none so map receives all gestures */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="flex flex-col items-center"
            style={{
              transform: `translateY(${pinLifted ? '-14px' : '0'})`,
              transition: `transform ${pinLifted ? '120ms' : '220ms'} ease-out`,
            }}
          >
            {/* Pin dot */}
            <div className="h-[18px] w-[18px] rounded-full border-2 border-white bg-emerald-500" />
            {/* Pin stick */}
            <div className="h-[18px] w-[2px] bg-emerald-500" />
          </div>
          {/* Shadow */}
          <div
            className="absolute rounded-full bg-black"
            style={{
              width: 12,
              height: 12,
              marginTop: 24,
              opacity: pinLifted ? 0.45 : 0,
              transform: `scale(${pinLifted ? 1 : 0.5})`,
              transition: `opacity ${pinLifted ? '120ms' : '220ms'} ease-out, transform ${pinLifted ? '120ms' : '220ms'} ease-out`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function MapAddressPicker(props: MapAddressPickerProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted text-muted-foreground flex h-[500px] items-center justify-center rounded-lg border">
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
