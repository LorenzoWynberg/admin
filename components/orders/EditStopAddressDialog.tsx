'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateStop } from '@/hooks/orders';
import { MapAddressPicker } from '@/components/shared/MapAddressPicker';
import type { PlaceResult } from '@/components/shared/PlacesAutocompleteInput';

type OrderStopData = App.Data.Order.OrderStopData;

interface EditStopAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stop: OrderStopData;
  orderPublicId: string;
}

export function EditStopAddressDialog({
  open,
  onOpenChange,
  stop,
  orderPublicId,
}: EditStopAddressDialogProps) {
  const { t } = useTranslation();
  const updateStop = useUpdateStop();
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const initialCenter =
    stop.address?.latitude && stop.address?.longitude
      ? { lat: stop.address.latitude, lng: stop.address.longitude }
      : undefined;

  const handleSubmit = async () => {
    if (!selectedPlace || !stop.id) return;

    try {
      await updateStop.mutateAsync({
        orderPublicId,
        stopId: stop.id,
        data: {
          address: {
            latitude: selectedPlace.latitude,
            longitude: selectedPlace.longitude,
            placeId: selectedPlace.placeId,
          },
        },
      });
      setSelectedPlace(null);
      onOpenChange(false);
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('orders:detail.edit_stop_address', { defaultValue: 'Set Stop Address' })}
            {stop.name && ` — ${stop.name}`}
          </DialogTitle>
        </DialogHeader>

        <MapAddressPicker initialCenter={initialCenter} onSelect={setSelectedPlace} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedPlace || updateStop.isPending}>
            {updateStop.isPending
              ? t('common:saving', { defaultValue: 'Saving...' })
              : t('common:save', { defaultValue: 'Save' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
