'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  type MapCameraChangedEvent,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { GeoService } from '@/services/geoService';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const DEFAULT_CENTER = { lat: 9.9281, lng: -84.0907 };

type PlaceAutocompleteItemData = App.Data.Address.PlaceAutocompleteItemData;

export interface MapPickerCoords {
  lat: number;
  lng: number;
  placeId?: string;
}

export interface MapAddressPickerProps {
  initialCenter?: { lat: number; lng: number };
  onCoordsChange: (coords: MapPickerCoords) => void;
}

// ─── Custom search with backend-proxied autocomplete ───────────────────────

interface SearchBarProps {
  mapCenter: { lat: number; lng: number };
  onSelect: (item: PlaceAutocompleteItemData) => void;
}

function SearchBar({ mapCenter, onSelect }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await GeoService.autocomplete(value, mapCenter.lat, mapCenter.lng);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item: PlaceAutocompleteItemData) => {
    setQuery(item.description);
    setOpen(false);
    setSuggestions([]);
    onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={t('orders:detail.search_address', {
            defaultValue: 'Search for an address...',
          })}
          className="pr-9 pl-9"
        />
        {loading && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-[240px] overflow-y-auto rounded-md border shadow-md">
          {suggestions.map((item) => (
            <button
              key={item.placeId}
              type="button"
              className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
              onClick={() => handleSelect(item)}
            >
              <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Map picker content ────────────────────────────────────────────────────

function MapPickerContent({ initialCenter, onCoordsChange }: MapAddressPickerProps) {
  const map = useMap();
  const [pinLifted, setPinLifted] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialCenter ?? DEFAULT_CENTER);
  const programmaticMove = useRef(false);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Report initial center on mount
  useEffect(() => {
    if (initialCenter) {
      onCoordsChange({ lat: initialCenter.lat, lng: initialCenter.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Center-locked scroll zoom: disable Google's cursor-biased zoom and use
  // setZoom() which always zooms at center. Throttle to one zoom step every
  // 300ms while scrolling — feels continuous but not overwhelming.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !map) return;

    let lastDirection = 0;
    let throttled = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      lastDirection = e.deltaY > 0 ? -1 : 1;

      if (throttled) return;
      throttled = true;

      // Apply immediately on first scroll event
      const zoom = map.getZoom();
      if (zoom != null) {
        programmaticMove.current = true;
        map.setZoom(Math.max(1, Math.min(21, zoom + lastDirection)));
      }

      // Then allow next step after 300ms
      setTimeout(() => {
        throttled = false;
      }, 300);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [map]);

  const liftPin = useCallback(() => {
    setPinLifted(true);
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => setPinLifted(false), 2000);
  }, []);

  const settlePin = useCallback(() => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    setPinLifted(false);
  }, []);

  const handleCameraChanged = useCallback(
    (e: MapCameraChangedEvent) => {
      const { lat, lng } = e.detail.center;

      if (isDragging.current) {
        liftPin();
      } else {
        settlePin();
      }

      setMapCenter({ lat, lng });

      if (programmaticMove.current) {
        programmaticMove.current = false;
        return;
      }
      onCoordsChange({ lat, lng });
    },
    [onCoordsChange, liftPin, settlePin]
  );

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    settlePin();
  }, [settlePin]);

  const handleSearchSelect = useCallback(
    async (item: PlaceAutocompleteItemData) => {
      try {
        const details = await GeoService.placeDetails(item.placeId);
        programmaticMove.current = true;
        map?.panTo({ lat: details.lat, lng: details.lng });
        map?.setZoom(17);
        onCoordsChange({
          lat: details.lat,
          lng: details.lng,
          placeId: details.placeId,
        });
      } catch {
        // Details fetch failed — ignore
      }
    },
    [map, onCoordsChange]
  );

  // POI click — user clicks a place (store, restaurant, etc.) on the map
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const lat = e.detail.latLng?.lat;
      const lng = e.detail.latLng?.lng;
      if (lat == null || lng == null) return;

      programmaticMove.current = true;
      map?.panTo({ lat, lng });
      onCoordsChange({
        lat,
        lng,
        placeId: e.detail.placeId ?? undefined,
      });
    },
    [map, onCoordsChange]
  );

  return (
    <div className="space-y-3">
      <SearchBar mapCenter={mapCenter} onSelect={handleSearchSelect} />

      <div
        ref={mapContainerRef}
        className="relative h-[500px] w-full overflow-hidden rounded-lg border"
      >
        <Map
          defaultCenter={initialCenter ?? DEFAULT_CENTER}
          defaultZoom={initialCenter ? 17 : 12}
          mapId="address-picker-map"
          className="h-full w-full"
          gestureHandling="greedy"
          scrollwheel={false}
          onCameraChanged={handleCameraChanged}
          onDragstart={handleDragStart}
          onDragend={handleDragEnd}
          onClick={handleMapClick}
        />

        {/* Fixed center pin — bottom of stick anchored to exact map center */}
        <div className="pointer-events-none absolute inset-0">
          {/* Pin group: positioned so bottom of stick = 50% */}
          <div
            className="absolute top-1/2 left-1/2 flex flex-col items-center"
            style={{
              transform: `translate(-50%, -100%) translateY(${pinLifted ? '-14px' : '0px'})`,
              transition: `transform ${pinLifted ? '120ms' : '220ms'} ease-out`,
            }}
          >
            {/* Pin dot */}
            <div className="h-[18px] w-[18px] rounded-full border-2 border-white bg-emerald-500" />
            {/* Pin stick */}
            <div className="h-[18px] w-[2px] bg-emerald-500" />
          </div>
          {/* Shadow: sits right at map center */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full bg-black"
            style={{
              width: 12,
              height: 12,
              transform: `translate(-50%, -50%) scale(${pinLifted ? 1 : 0.5})`,
              opacity: pinLifted ? 0.45 : 0,
              transition: `opacity ${pinLifted ? '120ms' : '220ms'} ease-out, transform ${pinLifted ? '120ms' : '220ms'} ease-out`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Public component ──────────────────────────────────────────────────────

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
