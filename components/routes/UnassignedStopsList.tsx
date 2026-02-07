'use client';

import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { Package, MapPin } from 'lucide-react';
import type { UnassignedStop } from '@/services/routeService';

interface UnassignedStopsListProps {
  stops: UnassignedStop[];
  isLoading: boolean;
  onStopClick?: (stop: UnassignedStop) => void;
  selectedStopKey?: string | null;
}

export function UnassignedStopsList({
  stops,
  isLoading,
  onStopClick,
  selectedStopKey,
}: UnassignedStopsListProps) {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({ id: 'unassigned' });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div ref={setNodeRef}>
      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
        {t('routes:unassigned_stops', { defaultValue: 'Unassigned' })} ({stops.length})
      </h3>

      {stops.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          {t('routes:no_unassigned', { defaultValue: 'No unassigned stops for this date' })}
        </p>
      ) : (
        <div className="space-y-2">
          {stops.map((stop) => {
            const isPickup = stop.stopType === 'pickup';
            const key = `${stop.order.publicId}-${stop.stopType}`;
            const isSelected = selectedStopKey === key;
            const colorClass = isPickup
              ? 'border-l-emerald-500 bg-emerald-50/50'
              : 'border-l-red-500 bg-red-50/50';
            const iconColor = isPickup ? 'text-emerald-600' : 'text-red-600';
            const address = isPickup ? stop.order.fromAddress : stop.order.toAddress;

            return (
              <div
                key={key}
                className={`cursor-pointer rounded-md border border-l-4 p-2 transition-colors hover:shadow-sm ${colorClass} ${
                  isSelected ? 'ring-primary ring-2' : ''
                }`}
                onClick={() => onStopClick?.(stop)}
              >
                <div className="flex items-center gap-2">
                  {isPickup ? (
                    <Package className={`h-4 w-4 shrink-0 ${iconColor}`} />
                  ) : (
                    <MapPin className={`h-4 w-4 shrink-0 ${iconColor}`} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <span className={iconColor}>
                        {t(`routes:stop_types.${stop.stopType}`, { defaultValue: stop.stopType })}
                      </span>
                      <span className="text-muted-foreground">#{stop.order.publicId}</span>
                    </div>
                    {address?.streetAddress && (
                      <p className="text-muted-foreground truncate text-xs">
                        {address.streetAddress}
                      </p>
                    )}
                    {stop.scheduledFor && (
                      <p className="text-muted-foreground text-xs">
                        {new Date(stop.scheduledFor).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
