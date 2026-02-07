'use client';

import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { DraggableUnassignedStop } from './DraggableUnassignedStop';
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
            const key = `${stop.order.publicId}-${stop.stopType}`;
            return (
              <DraggableUnassignedStop
                key={key}
                stop={stop}
                isSelected={selectedStopKey === key}
                onClick={() => onStopClick?.(stop)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
