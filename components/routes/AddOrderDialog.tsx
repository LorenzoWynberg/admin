'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddStop } from '@/hooks/routes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, MapPin, Plus } from 'lucide-react';
import type { UnassignedStop } from '@/services/routeService';

interface AddOrderDialogProps {
  routeId: string;
  routeName: string;
  unassignedStops: UnassignedStop[];
}

export function AddOrderDialog({ routeId, routeName, unassignedStops }: AddOrderDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const addStop = useAddStop();

  const handleAdd = (stop: UnassignedStop) => {
    addStop.mutate(
      {
        routeId,
        data: {
          orderId: stop.order.id!,
          type: stop.stopType,
        },
      },
      {
        onSuccess: () => {
          // Don't close — let user add multiple
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
          <Plus className="h-3 w-3" />
          {t('routes:add_orders', { defaultValue: 'Add Orders' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('routes:add_orders', { defaultValue: 'Add Orders' })}</DialogTitle>
          <DialogDescription>{routeName}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {unassignedStops.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {t('routes:no_unassigned', { defaultValue: 'No unassigned stops for this date' })}
            </p>
          ) : (
            unassignedStops.map((stop) => {
              const isPickup = stop.stopType === 'pickup';
              const key = `${stop.order.publicId}-${stop.stopType}`;
              const iconColor = isPickup ? 'text-emerald-600' : 'text-red-600';
              const address = isPickup ? stop.order.fromAddress : stop.order.toAddress;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border p-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {isPickup ? (
                      <Package className={`h-4 w-4 shrink-0 ${iconColor}`} />
                    ) : (
                      <MapPin className={`h-4 w-4 shrink-0 ${iconColor}`} />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <span className={iconColor}>
                          {t(`routes:stop_types.${stop.stopType}`, {
                            defaultValue: stop.stopType,
                          })}
                        </span>
                        <span className="text-muted-foreground">#{stop.order.publicId}</span>
                      </div>
                      {address?.streetAddress && (
                        <p className="text-muted-foreground truncate text-xs">
                          {address.streetAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(stop)}
                    disabled={addStop.isPending}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
