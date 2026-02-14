'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { DraggableUnassignedStop } from './DraggableUnassignedStop';
import { BatchAddStopsDialog } from './BatchAddStopsDialog';
import { CreateRouteWithStopsDialog } from './CreateRouteWithStopsDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Plus, ListPlus } from 'lucide-react';
import type { UnassignedStop } from '@/services/routeService';

type RouteData = App.Data.Route.RouteData;

interface UnassignedStopsListProps {
  stops: UnassignedStop[];
  isLoading: boolean;
  onStopClick?: (stop: UnassignedStop) => void;
  selectedStopKey?: string | null;
  date: string;
  routes: RouteData[];
}

export function UnassignedStopsList({
  stops,
  isLoading,
  onStopClick,
  selectedStopKey,
  date,
  routes,
}: UnassignedStopsListProps) {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({ id: 'unassigned' });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getKey = (stop: UnassignedStop) => `${stop.order.publicId}-${stop.stopType}`;

  const toggleSelect = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const selectAll = () => {
    setSelectedKeys(new Set(stops.map(getKey)));
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedKeys(new Set());
  };

  const selectedStops = stops.filter((s) => selectedKeys.has(getKey(s)));

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
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t('routes:unassigned_stops', { defaultValue: 'Unassigned' })} ({stops.length})
        </h3>
        {stops.length > 0 && (
          <Button
            variant={selectMode ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          >
            <CheckSquare className="h-3 w-3" />
            {t('routes:select', { defaultValue: 'Select' })}
          </Button>
        )}
      </div>

      {/* Select all / Clear + actions */}
      {selectMode && stops.length > 0 && (
        <div className="mb-2 space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={selectAll}>
              {t('routes:select_all', { defaultValue: 'Select All' })}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
              {t('routes:clear_selection', { defaultValue: 'Clear' })}
            </Button>
            {selectedKeys.size > 0 && (
              <span className="text-muted-foreground ml-auto text-xs">
                {t('routes:selected_count', {
                  defaultValue: '{{count}} selected',
                  count: selectedKeys.size,
                })}
              </span>
            )}
          </div>

          {selectedKeys.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1 text-xs"
                onClick={() => setBatchDialogOpen(true)}
              >
                <ListPlus className="h-3.5 w-3.5" />
                {t('routes:add_to_route', { defaultValue: 'Add to Route' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1 text-xs"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('routes:create_new_route', { defaultValue: 'Create New Route' })}
              </Button>
            </div>
          )}
        </div>
      )}

      {stops.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          {t('routes:no_unassigned', { defaultValue: 'No unassigned stops for this date' })}
        </p>
      ) : (
        <div className="space-y-2">
          {stops.map((stop) => {
            const key = getKey(stop);
            return (
              <div key={key} className="flex items-start gap-1.5">
                {selectMode && (
                  <div className="flex pt-2.5">
                    <Checkbox
                      checked={selectedKeys.has(key)}
                      onCheckedChange={() => toggleSelect(key)}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <DraggableUnassignedStop
                    stop={stop}
                    isSelected={selectedStopKey === key}
                    onClick={() => (selectMode ? toggleSelect(key) : onStopClick?.(stop))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BatchAddStopsDialog
        open={batchDialogOpen}
        onOpenChange={(open) => {
          setBatchDialogOpen(open);
          if (!open) exitSelectMode();
        }}
        selectedStops={selectedStops}
        routes={routes}
      />

      <CreateRouteWithStopsDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) exitSelectMode();
        }}
        selectedStops={selectedStops}
        date={date}
      />
    </div>
  );
}
