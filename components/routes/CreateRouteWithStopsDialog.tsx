'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDriverList } from '@/hooks/drivers/useDriverList';
import { useCreateRouteWithStops } from '@/hooks/routes';
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

interface CreateRouteWithStopsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStops: UnassignedStop[];
  date: string;
}

export function CreateRouteWithStopsDialog({
  open,
  onOpenChange,
  selectedStops,
  date,
}: CreateRouteWithStopsDialogProps) {
  const { t } = useTranslation();
  const createRouteWithStops = useCreateRouteWithStops();
  const { data: driversData } = useDriverList({ perPage: 100 });
  const drivers = driversData?.items ?? [];
  const [driverId, setDriverId] = useState<string>('');
  const [optimize, setOptimize] = useState(false);

  const handleSubmit = () => {
    createRouteWithStops.mutate(
      {
        date,
        driverId: driverId ? Number(driverId) : null,
        stops: selectedStops
          .filter((s) => s.order.id != null)
          .map((s) => ({
            orderId: s.order.id!,
            type: s.stopType,
          })),
        optimize,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setDriverId('');
          setOptimize(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('routes:create_new_route', { defaultValue: 'Create New Route' })}
          </DialogTitle>
          <DialogDescription>
            {date} —{' '}
            {t('routes:selected_count', {
              defaultValue: '{{count}} selected',
              count: selectedStops.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>{t('routes:fields.driver', { defaultValue: 'Driver' })}</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger>
                <SelectValue placeholder={t('routes:fields.driver', { defaultValue: 'Driver' })} />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={String(driver.id)}>
                    {driver.user?.name ?? `Driver #${driver.publicId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="optimize-create"
              checked={optimize}
              onCheckedChange={(checked) => setOptimize(checked === true)}
            />
            <Label htmlFor="optimize-create" className="cursor-pointer text-sm">
              {t('routes:optimize_after_adding', { defaultValue: 'Optimize after adding' })}
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={createRouteWithStops.isPending}>
            {t('common:create', { defaultValue: 'Create' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
