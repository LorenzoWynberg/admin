'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBatchAddStops } from '@/hooks/routes';
import { Enums } from '@/data/app-enums';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UnassignedStop } from '@/services/routeService';

type RouteData = App.Data.Route.RouteData;

const CLOSED_STATUSES = new Set<string>([Enums.RouteStatus.COMPLETED, Enums.RouteStatus.CANCELLED]);

interface BatchAddStopsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStops: UnassignedStop[];
  routes: RouteData[];
}

export function BatchAddStopsDialog({
  open,
  onOpenChange,
  selectedStops,
  routes,
}: BatchAddStopsDialogProps) {
  const { t } = useTranslation();
  const batchAddStops = useBatchAddStops();
  const [targetRouteId, setTargetRouteId] = useState<string>('');
  const [optimize, setOptimize] = useState(false);

  const availableRoutes = routes.filter((r) => !CLOSED_STATUSES.has(r.status ?? ''));

  const handleSubmit = () => {
    if (!targetRouteId) return;

    batchAddStops.mutate(
      {
        routeId: targetRouteId,
        data: {
          stops: selectedStops
            .filter((s) => s.order.id != null)
            .map((s) => ({
              orderId: s.order.id!,
              type: s.stopType,
            })),
          optimize,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTargetRouteId('');
          setOptimize(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('routes:add_to_route', { defaultValue: 'Add to Route' })}</DialogTitle>
          <DialogDescription>
            {t('routes:selected_count', {
              defaultValue: '{{count}} selected',
              count: selectedStops.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>{t('routes:select_route', { defaultValue: 'Select Route' })}</Label>
            <Select value={targetRouteId} onValueChange={setTargetRouteId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('routes:select_route', { defaultValue: 'Select Route' })}
                />
              </SelectTrigger>
              <SelectContent>
                {availableRoutes.map((route) => (
                  <SelectItem key={route.publicId} value={route.publicId!}>
                    {route.publicId}
                    {route.driver?.user?.name ? ` — ${route.driver.user.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="optimize-batch"
              checked={optimize}
              onCheckedChange={(checked) => setOptimize(checked === true)}
            />
            <Label htmlFor="optimize-batch" className="cursor-pointer text-sm">
              {t('routes:optimize_after_adding', { defaultValue: 'Optimize after adding' })}
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={!targetRouteId || batchAddStops.isPending}>
            {t('routes:add_to_route', { defaultValue: 'Add to Route' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
