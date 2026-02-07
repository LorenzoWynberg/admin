'use client';

import { useMemo, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { StopMarker } from './StopMarker';
import type { UnassignedStop } from '@/services/routeService';

type RouteStopData = App.Data.Route.RouteStopData;

interface RouteMapProps {
  routeStops: RouteStopData[];
  unassignedStops: UnassignedStop[];
  selectedStopId?: number | null;
  onStopClick?: (stopId: number) => void;
  onUnassignedClick?: (key: string) => void;
  selectedUnassignedKey?: string | null;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// Costa Rica default center
const DEFAULT_CENTER = { lat: 9.9281, lng: -84.0907 };

function MapContent({
  routeStops,
  unassignedStops,
  selectedStopId,
  onStopClick,
  onUnassignedClick,
  selectedUnassignedKey,
}: RouteMapProps) {
  const map = useMap();

  const routeMarkers = useMemo(() => {
    return routeStops
      .filter((stop) => {
        const addr = stop.type === 'pickup' ? stop.order?.fromAddress : stop.order?.toAddress;
        return addr?.latitude && addr?.longitude;
      })
      .map((stop) => {
        const addr = stop.type === 'pickup' ? stop.order?.fromAddress : stop.order?.toAddress;
        return {
          id: stop.id,
          lat: addr!.latitude,
          lng: addr!.longitude,
          type: stop.type as 'pickup' | 'dropoff',
          label: `${stop.sequence}`,
          publicId: stop.order?.publicId ?? '',
          isSelected: selectedStopId === stop.id,
        };
      });
  }, [routeStops, selectedStopId]);

  const unassignedMarkers = useMemo(() => {
    return unassignedStops
      .filter((stop) => {
        const addr = stop.stopType === 'pickup' ? stop.order.fromAddress : stop.order.toAddress;
        return addr?.latitude && addr?.longitude;
      })
      .map((stop) => {
        const addr = stop.stopType === 'pickup' ? stop.order.fromAddress : stop.order.toAddress;
        const key = `${stop.order.publicId}-${stop.stopType}`;
        return {
          key,
          lat: addr!.latitude,
          lng: addr!.longitude,
          type: stop.stopType as 'pickup' | 'dropoff',
          publicId: stop.order.publicId ?? '',
          isUnassigned: true,
          isSelected: selectedUnassignedKey === key,
        };
      });
  }, [unassignedStops, selectedUnassignedKey]);

  const handleRouteStopClick = useCallback(
    (id: number, lat: number, lng: number) => {
      onStopClick?.(id);
      map?.panTo({ lat, lng });
    },
    [map, onStopClick]
  );

  const handleUnassignedClick = useCallback(
    (key: string, lat: number, lng: number) => {
      onUnassignedClick?.(key);
      map?.panTo({ lat, lng });
    },
    [map, onUnassignedClick]
  );

  return (
    <>
      {/* Unassigned markers (grey) */}
      {unassignedMarkers.map((marker) => (
        <StopMarker
          key={marker.key}
          lat={marker.lat}
          lng={marker.lng}
          type={marker.type}
          isUnassigned
          isSelected={marker.isSelected}
          label={marker.publicId}
          onClick={() => handleUnassignedClick(marker.key, marker.lat, marker.lng)}
        />
      ))}

      {/* Route stop markers (colored) */}
      {routeMarkers.map((marker) => (
        <StopMarker
          key={marker.id}
          lat={marker.lat}
          lng={marker.lng}
          type={marker.type}
          isSelected={marker.isSelected}
          label={marker.label}
          onClick={() => handleRouteStopClick(marker.id, marker.lat, marker.lng)}
        />
      ))}
    </>
  );
}

export function RouteMap(props: RouteMapProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted text-muted-foreground flex h-full items-center justify-center rounded-lg border">
        <p className="text-sm">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={12}
        mapId="dispatch-map"
        className="h-full w-full rounded-lg"
        gestureHandling="cooperative"
      >
        <MapContent {...props} />
      </Map>
    </APIProvider>
  );
}
