'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStop } from '@/hooks/orders';
import { actionLabel, capitalize } from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import {
  MapAddressPicker,
  type MapPickerCoords,
  type MapMarker,
} from '@/components/shared/MapAddressPicker';

type OrderStopData = App.Data.Order.OrderStopData;

const formSchema = z.object({
  type: z.string().min(1),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderPublicId: string;
  hasDropoff: boolean;
  otherStops?: OrderStopData[];
}

export function AddStopDialog({
  open,
  onOpenChange,
  orderPublicId,
  hasDropoff,
  otherStops,
}: AddStopDialogProps) {
  const { t } = useTranslation();
  const createStop = useCreateStop();
  const [saving, setSaving] = useState(false);
  const coordsRef = useRef<MapPickerCoords | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: Enums.OrderStopType.Purchase,
      contactName: '',
      contactPhone: '',
      instructions: '',
    },
  });

  const markers: MapMarker[] = (otherStops ?? [])
    .filter((s) => s.address?.latitude && s.address?.longitude)
    .map((s) => ({
      lat: s.address!.latitude,
      lng: s.address!.longitude,
      type: (s.type ?? 'pickup') as MapMarker['type'],
      label: s.instructions ?? undefined,
    }));

  const handleCoordsChange = useCallback((coords: MapPickerCoords) => {
    coordsRef.current = coords;
  }, []);

  const stopTypeOptions = [
    { value: Enums.OrderStopType.Purchase, label: 'purchase' },
    { value: Enums.OrderStopType.Pickup, label: 'pickup' },
    ...(!hasDropoff ? [{ value: Enums.OrderStopType.Dropoff, label: 'dropoff' }] : []),
  ];

  const handleSubmit = async (values: FormValues) => {
    const coords = coordsRef.current;

    setSaving(true);
    try {
      await createStop.mutateAsync({
        orderPublicId,
        data: {
          type: values.type,
          ...(coords
            ? {
                address: {
                  latitude: coords.lat,
                  longitude: coords.lng,
                  ...(coords.placeId ? { placeId: coords.placeId } : {}),
                },
              }
            : { addressId: null }),
          ...(values.contactName ? { contactName: values.contactName } : {}),
          ...(values.contactPhone ? { contactPhone: values.contactPhone } : {}),
          ...(values.instructions ? { instructions: values.instructions } : {}),
        },
      });
      form.reset();
      coordsRef.current = null;
      onOpenChange(false);
    } catch {
      // Error handled by mutation hook
    } finally {
      setSaving(false);
    }
  };

  const isPending = saving || createStop.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('orders:detail.add_stop', { defaultValue: 'Add Stop' })}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {capitalize(t('validation:attributes.type', { defaultValue: 'Type' }))}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stopTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(`routes:stop_types.${opt.label}`, {
                            defaultValue: capitalize(opt.label),
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MapAddressPicker onCoordsChange={handleCoordsChange} markers={markers} />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('validation:attributes.contactName', { defaultValue: 'Contact Name' })}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('validation:attributes.contactPhone', { defaultValue: 'Contact Phone' })}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('validation:attributes.instructions', { defaultValue: 'Instructions' })}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {actionLabel('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('common:saving', { defaultValue: 'Saving...' })
                  : actionLabel('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
