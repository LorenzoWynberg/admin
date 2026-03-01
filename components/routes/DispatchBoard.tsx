'use client';

import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import {
  useRouteList,
  useUnassignedStops,
  useReorderStops,
  useDeleteRoute,
  useAddStop,
} from '@/hooks/routes';
import { useDriverList } from '@/hooks/drivers/useDriverList';
import { DateNavigator } from './DateNavigator';
import { CreateRouteDialog } from './CreateRouteDialog';
import { UnassignedStopsList } from './UnassignedStopsList';
import { RouteCard } from './RouteCard';
import { AddOrderDialog } from './AddOrderDialog';
import { UnassignedStopContent } from './DraggableUnassignedStop';
import { RouteMap } from './RouteMap';
import { DispatchSummaryBar } from './DispatchSummaryBar';
import { ReassignStopDialog } from './ReassignStopDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTodayAppTz } from '@/utils/format';
import type { UnassignedStop } from '@/services/routeService';

type RouteData = App.Data.Route.RouteData;
type RouteStopData = App.Data.Route.RouteStopData;
type Paginated<T> = Api.Response.Paginated<T>;

/** Validates that no dropoff comes before its pickup when both are in the same route. */
function isValidStopOrder(stops: RouteStopData[]): boolean {
  const indices = new Map<number, { pickup: number; dropoff: number }>();

  for (let i = 0; i < stops.length; i++) {
    const orderId = stops[i].orderId;
    if (!orderId) continue;
    const entry = indices.get(orderId) ?? { pickup: -1, dropoff: -1 };
    if (stops[i].type === 'pickup') entry.pickup = i;
    else if (stops[i].type === 'dropoff') entry.dropoff = i;
    indices.set(orderId, entry);
  }

  // Only enforce when both pickup and dropoff are in this route
  for (const { pickup, dropoff } of indices.values()) {
    if (pickup !== -1 && dropoff !== -1 && dropoff < pickup) return false;
  }

  return true;
}

export function DispatchBoard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(() => getTodayAppTz());
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [selectedUnassignedKey, setSelectedUnassignedKey] = useState<string | null>(null);
  const [activeDragStop, setActiveDragStop] = useState<UnassignedStop | null>(null);
  const [reassignStopId, setReassignStopId] = useState<number | null>(null);
  const [unassignedExpanded, setUnassignedExpanded] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data: routesData, isLoading: routesLoading } = useRouteList({
    date: dateStr,
    perPage: 50,
  });
  const { data: unassignedStops, isLoading: unassignedLoading } = useUnassignedStops({
    date: dateStr,
  });
  const { data: driversData } = useDriverList({ perPage: 100 });

  const reorderStops = useReorderStops();
  const deleteRoute = useDeleteRoute();
  const addStop = useAddStop();

  const routes = useMemo(() => (routesData?.items ?? []) as RouteData[], [routesData?.items]);
  const unassigned = useMemo(() => (unassignedStops ?? []) as UnassignedStop[], [unassignedStops]);
  const drivers = useMemo(
    () =>
      (driversData?.items ?? []).map((d) => ({
        id: d.id!,
        name: d.user?.name ?? `Driver #${d.publicId}`,
      })),
    [driversData?.items]
  );

  const selectedRoute = routes.find((r) => r.publicId === selectedRouteId) ?? null;
  const selectedRouteStops = useMemo(
    () => (selectedRoute?.stops ?? []) as RouteStopData[],
    [selectedRoute?.stops]
  );

  // Summary stats
  const totalStops = useMemo(
    () => routes.reduce((sum, r) => sum + ((r.stops as RouteStopData[]) ?? []).length, 0),
    [routes]
  );
  const flaggedStops = useMemo(
    () =>
      routes.reduce(
        (sum, r) =>
          sum +
          ((r.stops as RouteStopData[]) ?? []).filter((s: RouteStopData) => s.delayFlaggedAt)
            .length,
        0
      ),
    [routes]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      if (id.startsWith('unassigned-')) {
        const data = event.active.data.current as {
          orderId: number;
          stopType: 'pickup' | 'dropoff';
        };
        const stop = unassigned.find(
          (s) => s.order.id === data.orderId && s.stopType === data.stopType
        );
        setActiveDragStop(stop ?? null);
      }
    },
    [unassigned]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragStop(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragStop(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // --- Cross-container: unassigned stop → route ---
      if (activeId.startsWith('unassigned-')) {
        const { orderId, stopType } = active.data.current as {
          orderId: number;
          stopType: 'pickup' | 'dropoff';
        };

        let targetRouteId: string | null = null;

        if (overId.startsWith('route-')) {
          targetRouteId = overId.replace('route-', '');
        } else {
          const numericId = Number(overId);
          if (!Number.isNaN(numericId)) {
            const ownerRoute = routes.find((r) =>
              (r.stops ?? []).some((s: RouteStopData) => s.id === numericId)
            );
            targetRouteId = ownerRoute?.publicId ?? null;
          }
        }

        if (targetRouteId) {
          const targetRoute = routes.find((r) => r.publicId === targetRouteId);
          if (targetRoute?.status === 'completed' || targetRoute?.status === 'cancelled') {
            return;
          }

          if (stopType === 'dropoff') {
            const order = unassigned.find(
              (s) => s.order.id === orderId && s.stopType === 'dropoff'
            )?.order;

            const orderStops = (order?.stops ?? []) as App.Data.Order.OrderStopData[];
            const pickupCompleted = orderStops.some((s) => s.type === 'pickup' && !!s.completedAt);
            const pickupInARoute = routes.some((r) =>
              (r.stops ?? []).some(
                (s: RouteStopData) => s.orderId === orderId && s.type === 'pickup'
              )
            );

            if (!pickupCompleted && !pickupInARoute) {
              toast.error(
                t('routes:errors.pickup_required_first', {
                  defaultValue: 'A pickup stop must exist before adding a dropoff.',
                })
              );
              return;
            }
          }

          addStop.mutate({ routeId: targetRouteId, data: { orderId, type: stopType } });
        }
        return;
      }

      // --- Reordering within the selected route ---
      if (!selectedRouteId) return;

      const stops = selectedRouteStops;
      const activeIndex = stops.findIndex((s) => s.id === active.id);
      const overIndex = stops.findIndex((s) => s.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newOrder = arrayMove(stops, activeIndex, overIndex);

        if (!isValidStopOrder(newOrder)) {
          toast.error(
            t('routes:validation.pickup_before_dropoff', {
              defaultValue: 'Pickup must come before dropoff for the same order',
            })
          );
          return;
        }

        const routeListKey = ['routes', 'list', { date: dateStr, perPage: 50 }];
        const previousRoutes = queryClient.getQueryData<Paginated<RouteData>>(routeListKey);

        queryClient.setQueryData<Paginated<RouteData>>(routeListKey, (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: (old.items as RouteData[]).map((route) =>
              route.publicId === selectedRouteId ? { ...route, stops: newOrder } : route
            ),
          };
        });

        reorderStops.mutate(
          { routeId: selectedRouteId, stopIds: newOrder.map((s) => s.id) },
          {
            onError: () => {
              queryClient.setQueryData(routeListKey, previousRoutes);
            },
          }
        );
      }
    },
    [
      selectedRouteId,
      selectedRouteStops,
      reorderStops,
      addStop,
      routes,
      unassigned,
      queryClient,
      dateStr,
      t,
    ]
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DateNavigator date={date} onDateChange={setDate} />
          <CreateRouteDialog date={dateStr} />
        </div>

        {/* Summary bar */}
        <div className="border-b px-4 py-2">
          <DispatchSummaryBar
            assigned={totalStops}
            outsourced={0}
            unassigned={unassigned.length}
            flagged={flaggedStops}
          />
        </div>

        {/* Main content */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel — routes first (monitoring-first) */}
          <div className="w-80 shrink-0 overflow-hidden border-r">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {/* Routes (primary content) */}
                {routesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : routes.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    {t('routes:no_routes', { defaultValue: 'No routes found' })}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {routes.map((route) => (
                      <div key={route.publicId}>
                        <RouteCard
                          route={route}
                          isSelected={selectedRouteId === route.publicId}
                          isAddingStop={
                            addStop.isPending && addStop.variables?.routeId === route.publicId
                          }
                          onSelect={() =>
                            setSelectedRouteId(
                              selectedRouteId === route.publicId ? null : route.publicId!
                            )
                          }
                          onStopClick={handleStopClick}
                          selectedStopId={selectedStopId}
                          onDelete={() => handleDeleteRoute(route.publicId!)}
                          onReassignStop={(stopId) => setReassignStopId(stopId)}
                        />
                        {route.publicId && (
                          <div className="mt-1.5">
                            <AddOrderDialog routeId={route.publicId} unassignedStops={unassigned} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Unassigned stops — exception section, only shown when there are exceptions */}
                {!unassignedLoading && unassigned.length > 0 && (
                  <>
                    <hr />
                    <button
                      className="flex w-full items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm font-medium text-amber-800"
                      onClick={() => setUnassignedExpanded(!unassignedExpanded)}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        {t('routes:unassigned_stops', { defaultValue: 'Unassigned Stops' })} (
                        {unassigned.length})
                      </span>
                      <span className="ml-auto text-xs">{unassignedExpanded ? '▲' : '▼'}</span>
                    </button>
                    {unassignedExpanded && (
                      <UnassignedStopsList
                        stops={unassigned}
                        isLoading={unassignedLoading}
                        onStopClick={handleUnassignedClick}
                        selectedStopKey={selectedUnassignedKey}
                        date={dateStr}
                        routes={routes}
                      />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

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

      <DragOverlay dropAnimation={null}>
        {activeDragStop && (
          <div className="w-72">
            <UnassignedStopContent stop={activeDragStop} />
          </div>
        )}
      </DragOverlay>

      {/* Reassign dialog */}
      {reassignStopId !== null && (
        <ReassignStopDialog
          stopId={reassignStopId}
          open
          onOpenChange={(open) => {
            if (!open) setReassignStopId(null);
          }}
          routes={routes}
          drivers={drivers}
        />
      )}
    </DndContext>
  );
}
