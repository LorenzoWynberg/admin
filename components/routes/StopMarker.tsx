'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Enums } from '@/data/app-enums';

interface StopMarkerProps {
  lat: number;
  lng: number;
  type: string;
  isUnassigned?: boolean;
  isSelected?: boolean;
  label?: string;
  onClick?: () => void;
}

/** Normalize stop types to pickup/dropoff for display purposes (e.g. Purchase → pickup) */
function isPickupType(type: string): boolean {
  return (
    type === Enums.RouteStopType.PICKUP ||
    type === Enums.OrderStopType.Purchase ||
    type === 'pickup'
  );
}

export function StopMarker({
  lat,
  lng,
  type,
  isUnassigned = false,
  isSelected = false,
  label,
  onClick,
}: StopMarkerProps) {
  const isPickup = isPickupType(type);
  const bgColor = isUnassigned ? 'bg-gray-400' : isPickup ? 'bg-emerald-500' : 'bg-red-500';

  const ringClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  return (
    <AdvancedMarker position={{ lat, lng }} onClick={onClick}>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${bgColor} ${ringClass} cursor-pointer`}
      >
        {label ? (
          <span className="truncate px-0.5 text-[10px]">{label}</span>
        ) : isPickup ? (
          'P'
        ) : (
          'D'
        )}
      </div>
    </AdvancedMarker>
  );
}
