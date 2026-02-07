'use client';

import { useTranslation } from 'react-i18next';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useDriverList } from '@/hooks/drivers/useDriverList';
import { useUpdateRoute, useRemoveStop, useOptimizeRoute } from '@/hooks/routes';
import { Enums } from '@/data/app-enums';
import { statusLabel } from '@/utils/lang';
import { SortableStopCard } from './SortableStopCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, Trash2, Sparkles } from 'lucide-react';

type RouteData = App.Data.Route.RouteData;
type RouteStopData = App.Data.Route.RouteStopData;

/** Statuses the admin can manually set. In progress / completed are driver-driven. */
const ADMIN_SETTABLE_STATUSES = [
  Enums.RouteStatus.DRAFT,
  Enums.RouteStatus.SCHEDULED,
  Enums.RouteStatus.CANCELLED,
];

const statusStyles: Record<string, string> = {
  draft: 'text-gray-700',
  scheduled: 'text-blue-700',
  in_progress: 'text-orange-700',
  completed: 'text-green-700',
  cancelled: 'text-red-700',
};

const LOCKED_STOP_STATUSES = new Set<string>([
  Enums.RouteStopStatus.COMPLETED,
  Enums.RouteStopStatus.SKIPPED,
]);

const CLOSED_ROUTE_STATUSES = new Set<string>([
  Enums.RouteStatus.COMPLETED,
  Enums.RouteStatus.CANCELLED,
]);

interface RouteCardProps {
  route: RouteData;
  isSelected: boolean;
  isAddingStop?: boolean;
  onSelect: () => void;
  onStopClick?: (stop: RouteStopData) => void;
  selectedStopId?: number | null;
  onDelete?: () => void;
}

export function RouteCard({
  route,
  isSelected,
  isAddingStop,
  onSelect,
  onStopClick,
  selectedStopId,
  onDelete,
}: RouteCardProps) {
  const { t } = useTranslation();
  const updateRoute = useUpdateRoute();
  const removeStop = useRemoveStop();
  const optimizeRoute = useOptimizeRoute();
  const { data: driversData } = useDriverList({ perPage: 100 });
  const drivers = driversData?.items ?? [];

  const stops = (route.stops ?? []) as RouteStopData[];
  const stopIds = stops.map((s) => s.id);
  const isClosed = CLOSED_ROUTE_STATUSES.has(route.status ?? '');
  const canOptimize = !isClosed && stops.length >= 2;

  const { setNodeRef } = useDroppable({
    id: `route-${route.publicId}`,
    disabled: isClosed,
  });

  const handleDriverChange = (driverId: string) => {
    if (!route.publicId) return;
    updateRoute.mutate({
      id: route.publicId,
      data: { driverId: driverId === 'none' ? null : Number(driverId) },
    });
  };

  const handleStatusChange = (status: string) => {
    if (!route.publicId) return;
    updateRoute.mutate({ id: route.publicId, data: { status } });
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
          <span className="text-sm font-semibold">{route.publicId}</span>
        </button>
        <div className="flex items-center gap-2">
          {route.status && (
            <Select value={route.status} onValueChange={handleStatusChange}>
              <SelectTrigger
                size="sm"
                className={`h-6 w-auto gap-1 border-0 px-2 text-xs font-medium shadow-none ${statusStyles[route.status] ?? ''}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_SETTABLE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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

      {/* Optimize */}
      {canOptimize && (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={optimizeRoute.isPending}
            onClick={() => route.publicId && optimizeRoute.mutate(route.publicId)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {optimizeRoute.isPending
              ? t('routes:optimizing', { defaultValue: 'Optimizing...' })
              : t('routes:optimize_route', { defaultValue: 'Optimize Route' })}
          </Button>
        </div>
      )}

      {/* Stops */}
      <div ref={setNodeRef} className="min-h-[40px] space-y-1.5">
        {stops.length === 0 && !isAddingStop ? (
          <p className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-xs">
            {t('routes:empty_route', { defaultValue: 'No stops — drag orders here' })}
          </p>
        ) : (
          <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
            {stops.map((stop) => {
              const isLocked = LOCKED_STOP_STATUSES.has(stop.status ?? '');
              return (
                <SortableStopCard
                  key={stop.id}
                  stop={stop}
                  isSelected={selectedStopId === stop.id}
                  onClick={() => onStopClick?.(stop)}
                  onRemove={isLocked ? undefined : () => handleRemoveStop(stop.id)}
                  disabled={isLocked}
                />
              );
            })}
          </SortableContext>
        )}
        {isAddingStop && (
          <div className="flex animate-pulse items-center gap-2 rounded-md border border-l-4 border-l-gray-300 bg-gray-50/50 p-2">
            <div className="bg-muted h-4 w-4 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted h-3 w-24 rounded" />
              <div className="bg-muted h-3 w-32 rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
