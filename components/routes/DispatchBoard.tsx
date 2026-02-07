'use client';

import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRouteList, useUnassignedStops, useReorderStops, useDeleteRoute } from '@/hooks/routes';
import { DateNavigator } from './DateNavigator';
import { CreateRouteDialog } from './CreateRouteDialog';
import { UnassignedStopsList } from './UnassignedStopsList';
import { RouteCard } from './RouteCard';
import { AddOrderDialog } from './AddOrderDialog';
import { RouteMap } from './RouteMap';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UnassignedStop } from '@/services/routeService';

type RouteData = App.Data.Route.RouteData;
type RouteStopData = App.Data.Route.RouteStopData;

export function DispatchBoard() {
  const [date, setDate] = useState(new Date());
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [selectedUnassignedKey, setSelectedUnassignedKey] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data: routesData, isLoading: routesLoading } = useRouteList({
    date: dateStr,
    perPage: 50,
  });
  const { data: unassignedStops, isLoading: unassignedLoading } = useUnassignedStops({
    date: dateStr,
  });

  const reorderStops = useReorderStops();
  const deleteRoute = useDeleteRoute();

  const routes = (routesData?.items ?? []) as RouteData[];
  const unassigned = (unassignedStops ?? []) as UnassignedStop[];

  const selectedRoute = routes.find((r) => r.publicId === selectedRouteId) ?? null;
  const selectedRouteStops = useMemo(
    () => (selectedRoute?.stops ?? []) as RouteStopData[],
    [selectedRoute?.stops]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !selectedRouteId) return;

      // Reordering within the same route
      const stops = selectedRouteStops;
      const activeIndex = stops.findIndex((s) => s.id === active.id);
      const overIndex = stops.findIndex((s) => s.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newOrder = arrayMove(stops, activeIndex, overIndex);
        reorderStops.mutate({
          routeId: selectedRouteId,
          stopIds: newOrder.map((s) => s.id),
        });
      }
    },
    [selectedRouteId, selectedRouteStops, reorderStops]
  );

  const handleStopClick = (stop: RouteStopData) => {
    setSelectedStopId(stop.id);
    setSelectedUnassignedKey(null);
  };

  const handleUnassignedClick = (stop: UnassignedStop) => {
    const key = `${stop.order.publicId}-${stop.stopType}`;
    setSelectedUnassignedKey(key);
    setSelectedStopId(null);
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute.mutate(routeId);
    if (selectedRouteId === routeId) {
      setSelectedRouteId(null);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DateNavigator date={date} onDateChange={setDate} />
          <CreateRouteDialog date={dateStr} />
        </div>

        {/* Main content */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel — sidebar with stops and routes */}
          <ScrollArea className="w-80 shrink-0 border-r">
            <div className="space-y-4 p-4">
              {/* Unassigned stops */}
              <UnassignedStopsList
                stops={unassigned}
                isLoading={unassignedLoading}
                onStopClick={handleUnassignedClick}
                selectedStopKey={selectedUnassignedKey}
              />

              {/* Divider */}
              <hr />

              {/* Routes */}
              {routesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : routes.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No routes for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {routes.map((route) => (
                    <div key={route.publicId}>
                      <RouteCard
                        route={route}
                        isSelected={selectedRouteId === route.publicId}
                        onSelect={() =>
                          setSelectedRouteId(
                            selectedRouteId === route.publicId ? null : route.publicId!
                          )
                        }
                        onStopClick={handleStopClick}
                        selectedStopId={selectedStopId}
                        onDelete={() => handleDeleteRoute(route.publicId!)}
                      />
                      {route.publicId && (
                        <div className="mt-1.5">
                          <AddOrderDialog
                            routeId={route.publicId}
                            routeName={route.name}
                            unassignedStops={unassigned}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right panel — Map */}
          <div className="flex-1 p-2">
            <RouteMap
              routeStops={selectedRouteStops}
              unassignedStops={unassigned}
              selectedStopId={selectedStopId}
              onStopClick={(id) => {
                setSelectedStopId(id);
                setSelectedUnassignedKey(null);
              }}
              onUnassignedClick={(key) => {
                setSelectedUnassignedKey(key);
                setSelectedStopId(null);
              }}
              selectedUnassignedKey={selectedUnassignedKey}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
