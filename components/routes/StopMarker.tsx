'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';

interface StopMarkerProps {
  lat: number;
  lng: number;
  type: 'pickup' | 'dropoff';
  isUnassigned?: boolean;
  isSelected?: boolean;
  label?: string;
  onClick?: () => void;
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
  const bgColor = isUnassigned
    ? 'bg-gray-400'
    : type === 'pickup'
      ? 'bg-emerald-500'
      : 'bg-red-500';

  const ringClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  return (
    <AdvancedMarker position={{ lat, lng }} onClick={onClick}>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${bgColor} ${ringClass} cursor-pointer`}
      >
        {label ? (
          <span className="truncate px-0.5 text-[10px]">{label}</span>
        ) : type === 'pickup' ? (
          'P'
        ) : (
          'D'
        )}
      </div>
    </AdvancedMarker>
  );
}
