'use client';

import { useTranslation } from 'react-i18next';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useDriverList } from '@/hooks/drivers/useDriverList';
import { useUpdateRoute, useRemoveStop } from '@/hooks/routes';
import { RouteStatusBadge } from './RouteStatusBadge';
import { SortableStopCard } from './SortableStopCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, Trash2 } from 'lucide-react';

type RouteData = App.Data.Route.RouteData;
type RouteStopData = App.Data.Route.RouteStopData;

interface RouteCardProps {
  route: RouteData;
  isSelected: boolean;
  onSelect: () => void;
  onStopClick?: (stop: RouteStopData) => void;
  selectedStopId?: number | null;
  onDelete?: () => void;
}

export function RouteCard({
  route,
  isSelected,
  onSelect,
  onStopClick,
  selectedStopId,
  onDelete,
}: RouteCardProps) {
  const { t } = useTranslation();
  const updateRoute = useUpdateRoute();
  const removeStop = useRemoveStop();
  const { data: driversData } = useDriverList({ perPage: 100 });
  const drivers = driversData?.items ?? [];

  const stops = (route.stops ?? []) as RouteStopData[];
  const stopIds = stops.map((s) => s.id);

  const { setNodeRef } = useDroppable({ id: `route-${route.publicId}` });

  const handleDriverChange = (driverId: string) => {
    if (!route.publicId) return;
    updateRoute.mutate({
      id: route.publicId,
      data: { driverId: driverId === 'none' ? null : Number(driverId) },
    });
  };

  const handleRemoveStop = (stopId: number) => {
    if (!route.publicId) return;
    removeStop.mutate({ routeId: route.publicId, stopId });
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/30'
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <button className="flex items-center gap-2 text-left" onClick={onSelect}>
          <Truck className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">{route.name}</span>
        </button>
        <div className="flex items-center gap-2">
          <RouteStatusBadge status={route.status} />
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-6 w-6"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Driver select */}
      <div className="mb-3">
        <Select
          value={route.driverId ? String(route.driverId) : 'none'}
          onValueChange={handleDriverChange}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder={t('routes:fields.driver', { defaultValue: 'Driver' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('common:none', { defaultValue: 'No driver' })}</SelectItem>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={String(driver.id)}>
                {driver.user?.name ?? `Driver #${driver.publicId}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stops */}
      <div ref={setNodeRef} className="min-h-[40px] space-y-1.5">
        {stops.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-xs">
            {t('routes:empty_route', { defaultValue: 'No stops — drag orders here' })}
          </p>
        ) : (
          <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
            {stops.map((stop) => (
              <SortableStopCard
                key={stop.id}
                stop={stop}
                isSelected={selectedStopId === stop.id}
                onClick={() => onStopClick?.(stop)}
                onRemove={() => handleRemoveStop(stop.id)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
