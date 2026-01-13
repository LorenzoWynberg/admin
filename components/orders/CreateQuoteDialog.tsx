'use client';

import { useState, useEffect } from 'react';
import { useCreateQuote, useSendQuote } from '@/hooks/quotes';
import { GeoService } from '@/services/geoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Send, MapPin, Loader2 } from 'lucide-react';

interface CreateQuoteDialogProps {
  orderId: number;
  defaultCurrency?: string;
  fromAddress?: {
    latitude: number;
    longitude: number;
  } | null;
  toAddress?: {
    latitude: number;
    longitude: number;
  } | null;
  orderDistanceKm?: number | null;
  orderEstimatedMinutes?: number | null;
}

export function CreateQuoteDialog({
  orderId,
  defaultCurrency = 'CRC',
  fromAddress,
  toAddress,
  orderDistanceKm,
  orderEstimatedMinutes,
}: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const createQuote = useCreateQuote();
  const sendQuote = useSendQuote();

  const [formData, setFormData] = useState({
    currencyCode: defaultCurrency,
    distanceKm: orderDistanceKm?.toString() || '',
    distanceFee: '',
    timeFee: '',
    surcharge: '',
    discountRate: '',
    notes: '',
    pickupProposedFor: '',
    deliveryProposedFor: '',
    validUntil: '',
  });

  const [drivingMinutes, setDrivingMinutes] = useState<number | null>(orderEstimatedMinutes ?? null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDistance = async () => {
    if (!fromAddress || !toAddress) return;

    setIsCalculating(true);
    try {
      const result = await GeoService.getDistance({
        fromLat: fromAddress.latitude,
        fromLng: fromAddress.longitude,
        toLat: toAddress.latitude,
        toLng: toAddress.longitude,
        driving: true,
      });

      const distance = result.driving_km ?? result.straight_line_km;
      setFormData((prev) => ({
        ...prev,
        distanceKm: distance.toString(),
      }));
      setDrivingMinutes(result.driving_minutes);
    } catch (error) {
      console.error('Failed to calculate distance:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    // Only auto-calculate if no distance from order and dialog is open
    if (open && fromAddress && toAddress && !formData.distanceKm && !orderDistanceKm) {
      calculateDistance();
    }
  }, [open]);

  const handleSubmit = async (andSend: boolean) => {
    const now = new Date();
    const defaultPickup = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const defaultDelivery = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    const defaultValid = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const data = {
      orderId,
      currencyCode: formData.currencyCode,
      distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
      distanceFee: formData.distanceFee ? parseFloat(formData.distanceFee) : null,
      timeFee: formData.timeFee ? parseFloat(formData.timeFee) : null,
      surcharge: formData.surcharge ? parseFloat(formData.surcharge) : null,
      discountRate: formData.discountRate ? parseFloat(formData.discountRate) : null,
      notes: formData.notes || undefined,
      pickupProposedFor: formData.pickupProposedFor || defaultPickup,
      deliveryProposedFor: formData.deliveryProposedFor || defaultDelivery,
      validUntil: formData.validUntil || defaultValid,
    };

    createQuote.mutate(data, {
      onSuccess: (quote) => {
        if (andSend && quote.id) {
          sendQuote.mutate(quote.id, {
            onSuccess: () => setOpen(false),
          });
        } else {
          setOpen(false);
        }
      },
    });
  };

  const isPending = createQuote.isPending || sendQuote.isPending;
  const canCalculate = fromAddress && toAddress;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Quote for Order #{orderId}</DialogTitle>
          <DialogDescription>
            Fill in the pricing details for this delivery quote.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="currencyCode">Currency</Label>
            <Select
              value={formData.currencyCode}
              onValueChange={(v) => handleChange('currencyCode', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRC">CRC (Colones)</SelectItem>
                <SelectItem value="USD">USD (Dollars)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="distanceKm">Distance (km)</Label>
              {canCalculate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={calculateDistance}
                  disabled={isCalculating}
                  className="h-auto py-1 px-2 text-xs"
                >
                  {isCalculating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <MapPin className="mr-1 h-3 w-3" />
                  )}
                  Calculate
                </Button>
              )}
            </div>
            <Input
              id="distanceKm"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.distanceKm}
              onChange={(e) => handleChange('distanceKm', e.target.value)}
            />
            {drivingMinutes && (
              <p className="text-xs text-muted-foreground">
                Estimated driving time: {drivingMinutes} min
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="distanceFee">Distance Fee</Label>
              <Input
                id="distanceFee"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.distanceFee}
                onChange={(e) => handleChange('distanceFee', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeFee">Time Fee</Label>
              <Input
                id="timeFee"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.timeFee}
                onChange={(e) => handleChange('timeFee', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="surcharge">Surcharge</Label>
              <Input
                id="surcharge"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.surcharge}
                onChange={(e) => handleChange('surcharge', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discountRate">Discount (%)</Label>
              <Input
                id="discountRate"
                type="number"
                step="1"
                placeholder="0"
                value={formData.discountRate}
                onChange={(e) => handleChange('discountRate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes for the customer..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
          >
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isPending}>
            <Send className="mr-2 h-4 w-4" />
            Create & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
