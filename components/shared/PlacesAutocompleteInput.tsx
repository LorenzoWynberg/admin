'use client';

import { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export interface PlaceResult {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface PlacesAutocompleteInputProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PlacesAutocompleteInner({
  onPlaceSelect,
  placeholder,
  disabled,
}: PlacesAutocompleteInputProps) {
  const { t } = useTranslation();
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!placesLib || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'cr' },
      fields: ['place_id', 'formatted_address', 'geometry'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.place_id || !place.geometry?.location) return;

      const result: PlaceResult = {
        placeId: place.place_id,
        description: place.formatted_address || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      setInputValue(result.description);
      onPlaceSelect(result);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [placesLib, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={
        placeholder ||
        t('orders:detail.search_address', { defaultValue: 'Search for an address...' })
      }
      disabled={disabled}
    />
  );
}

export function PlacesAutocompleteInput(props: PlacesAutocompleteInputProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <Input disabled placeholder="Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable Places" />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <PlacesAutocompleteInner {...props} />
    </APIProvider>
  );
}
