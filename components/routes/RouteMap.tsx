'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { StopMarker } from './StopMarker';
import { resolveStopAddress } from '@/utils/routes';
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

/** Renders the driving route polyline between route stops. */
function RouteDirections({ waypoints }: { waypoints: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const prevKeyRef = useRef('');

  // Stable key to avoid re-requesting identical directions
  const waypointKey = waypoints.map((w) => `${w.lat},${w.lng}`).join('|');

  useEffect(() => {
    if (!map || !routesLib) return;

    // Create renderer once
    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 4,
          strokeOpacity: 0.7,
        },
      });
    }

    // Clear if fewer than 2 waypoints
    if (waypoints.length < 2) {
      rendererRef.current.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
      prevKeyRef.current = '';
      return;
    }

    // Skip if waypoints haven't changed
    if (waypointKey === prevKeyRef.current) return;
    prevKeyRef.current = waypointKey;

    const service = new routesLib.DirectionsService();
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediates = waypoints.slice(1, -1).map((w) => ({
      location: new google.maps.LatLng(w.lat, w.lng),
      stopover: true,
    }));

    service.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: intermediates,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          rendererRef.current?.setDirections(result);
        }
      }
    );
  }, [map, routesLib, waypoints, waypointKey]);

  // Cleanup renderer on unmount
  useEffect(() => {
    return () => {
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
    };
  }, []);

  return null;
}

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
      .map((stop) => {
        const orderStops = (stop.order?.stops ?? []) as App.Data.Order.OrderStopData[];
        const addr = resolveStopAddress(stop.type, orderStops, stop.order?.deliveryAddress);
        return { stop, addr };
      })
      .filter(({ addr }) => addr?.latitude && addr?.longitude)
      .map(({ stop, addr }) => {
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

  // Waypoints for the directions polyline (in stop sequence order)
  const directionWaypoints = useMemo(
    () => routeMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [routeMarkers]
  );

  const unassignedMarkers = useMemo(() => {
    return unassignedStops
      .map((stop) => {
        const orderStops = (stop.order.stops ?? []) as App.Data.Order.OrderStopData[];
        const addr = resolveStopAddress(stop.stopType, orderStops, stop.order.deliveryAddress);
        return { stop, addr };
      })
      .filter(({ addr }) => addr?.latitude && addr?.longitude)
      .map(({ stop, addr }) => {
        const key = `${stop.order.publicId}-${stop.stopType}`;
        return {
          key,
          lat: addr!.latitude,
          lng: addr!.longitude,
          type: stop.stopType as 'pickup' | 'dropoff',
          publicId: stop.order.publicId ?? '',
          isUnassigned: true,
          label: (stop.order.publicId ?? '').replace(/^ORD-/i, '').slice(0, 3),
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

  // Pan to selected stop when selection changes from sidebar
  useEffect(() => {
    if (!map) return;

    if (selectedStopId) {
      const marker = routeMarkers.find((m) => m.id === selectedStopId);
      if (marker) map.panTo({ lat: marker.lat, lng: marker.lng });
    } else if (selectedUnassignedKey) {
      const marker = unassignedMarkers.find((m) => m.key === selectedUnassignedKey);
      if (marker) map.panTo({ lat: marker.lat, lng: marker.lng });
    }
  }, [map, selectedStopId, selectedUnassignedKey, routeMarkers, unassignedMarkers]);

  return (
    <>
      {/* Driving route polyline */}
      <RouteDirections waypoints={directionWaypoints} />

      {/* Unassigned markers (grey) */}
      {unassignedMarkers.map((marker) => (
        <StopMarker
          key={marker.key}
          lat={marker.lat}
          lng={marker.lng}
          type={marker.type}
          isUnassigned
          isSelected={marker.isSelected}
          label={marker.label}
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
