'use client';

import { useState, useRef, useCallback } from 'react';
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
import { GeoService } from '@/services/geoService';

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
  const [saving, setSaving] = useState(false);
  const coordsRef = useRef<{ lat: number; lng: number; placeId?: string } | null>(null);

  const initialCenter =
    stop.address?.latitude && stop.address?.longitude
      ? { lat: stop.address.latitude, lng: stop.address.longitude }
      : undefined;

  const handleCoordsChange = useCallback(
    (coords: { lat: number; lng: number; placeId?: string }) => {
      coordsRef.current = coords;
    },
    []
  );

  const handleSubmit = async () => {
    const coords = coordsRef.current;
    if (!coords || !stop.id) return;

    setSaving(true);
    try {
      // If we have a placeId from search, use it directly.
      // Otherwise reverse geocode to get address data (like AddressPickerModal).
      const placeId = coords.placeId || '';
      if (!placeId) {
        try {
          await GeoService.reverseGeocode(coords.lat, coords.lng);
        } catch {
          // Continue with empty placeId — API can handle coords-only
        }
      }

      await updateStop.mutateAsync({
        orderPublicId,
        stopId: stop.id,
        data: {
          address: {
            latitude: coords.lat,
            longitude: coords.lng,
            placeId,
          },
        },
      });
      coordsRef.current = null;
      onOpenChange(false);
    } catch {
      // Error handled by mutation hook
    } finally {
      setSaving(false);
    }
  };

  const isPending = saving || updateStop.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('orders:detail.edit_stop_address', { defaultValue: 'Set Stop Address' })}
            {stop.name && ` — ${stop.name}`}
          </DialogTitle>
        </DialogHeader>

        <MapAddressPicker initialCenter={initialCenter} onCoordsChange={handleCoordsChange} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={!coordsRef.current || isPending}>
            {isPending
              ? t('common:saving', { defaultValue: 'Saving...' })
              : t('common:save', { defaultValue: 'Save' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
