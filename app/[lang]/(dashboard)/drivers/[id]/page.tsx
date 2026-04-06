'use client';

import {
  actionLabel,
  capitalize,
  modelLabel,
  resourceMessage,
  statusLabel,
  validationAttribute,
} from '@/utils/lang';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCallback, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useDriver, useDeleteDriver, useUpdateDriver } from '@/hooks/drivers';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapAddressPicker, type MapPickerCoords } from '@/components/shared/MapAddressPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DriverScheduleTab } from '@/components/drivers/DriverScheduleTab';
import { ArrowLeft, User, CreditCard, Car, Calendar, Trash2, MapPin, Pencil } from 'lucide-react';
import { GeoService } from '@/services/geoService';
import { formatDate } from '@/utils/format';

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isLicenseExpired(date?: string): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function DriverDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const driverId = params.id as string;

  const { data: driver, isLoading, error } = useDriver(driverId);
  const deleteDriver = useDeleteDriver();
  const updateDriver = useUpdateDriver();

  const handleDelete = () => {
    if (
      confirm(
        t('drivers:detail.confirm_delete', {
          defaultValue: 'Are you sure you want to delete this driver? This cannot be undone.',
        })
      )
    ) {
      deleteDriver.mutate(driverId, {
        onSuccess: () => router.push('/drivers'),
      });
    }
  };

  const [mapOpen, setMapOpen] = useState(false);
  const [mapSaving, setMapSaving] = useState(false);
  const [hasCoords, setHasCoords] = useState(false);
  const coordsRef = useRef<MapPickerCoords | null>(null);

  const handleCoordsChange = useCallback((coords: MapPickerCoords) => {
    coordsRef.current = coords;
    setHasCoords(true);
  }, []);

  const handleSaveBaseLocation = async () => {
    const coords = coordsRef.current;
    if (!coords) return;
    setMapSaving(true);
    try {
      let baseAddress: string | null = null;
      try {
        const geo = await GeoService.reverseGeocode(coords.lat, coords.lng);
        baseAddress = geo.humanReadableAddress;
      } catch {
        // Non-critical — save coords even if geocode fails
      }
      await updateDriver.mutateAsync({
        id: driverId,
        data: { baseLatitude: coords.lat, baseLongitude: coords.lng, baseAddress },
      });
      coordsRef.current = null;
      setHasCoords(false);
      setMapOpen(false);
    } catch {
      // Error handled by mutation hook
    } finally {
      setMapSaving(false);
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{resourceMessage('failed_to_load', 'driver')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  const expired = isLicenseExpired(driver.licenseExpirationDate);
  const baseCenter =
    driver.baseLatitude != null && driver.baseLongitude != null
      ? { lat: driver.baseLatitude, lng: driver.baseLongitude }
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage src={driver.user?.avatar} />
            <AvatarFallback>{getInitials(driver.user?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {driver.user?.name || t('common:unknown', { defaultValue: 'Unknown' })}
            </h1>
            <p className="text-muted-foreground">
              {capitalize(modelLabel('driver'))} {driver.publicId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={driver.active !== false}
              onCheckedChange={(checked) =>
                updateDriver.mutate({ id: driverId, data: { active: checked } })
              }
              disabled={updateDriver.isPending}
            />
            <Label className="text-sm font-medium">
              {driver.active !== false ? statusLabel('active') : statusLabel('inactive')}
            </Label>
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteDriver.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {actionLabel('delete')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">
            {t('drivers:tabs.details', { defaultValue: 'Details' })}
          </TabsTrigger>
          {!driver.isOutsourced && (
            <TabsTrigger value="schedule">
              {t('drivers:tabs.schedule', { defaultValue: 'Schedule' })}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('drivers:detail.user_account', { defaultValue: 'User Account' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{validationAttribute('name', true)}</span>
                  <span className="font-medium">{driver.user?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('email', true)}
                  </span>
                  <span className="font-medium">{driver.user?.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('phone', true)}
                  </span>
                  <span className="font-medium">{driver.user?.phone || '-'}</span>
                </div>
                {driver.user?.publicId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/users/${driver.user?.publicId}`)}
                  >
                    {t('drivers:detail.view_user_profile', {
                      defaultValue: 'View User Profile',
                    })}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('drivers:detail.license_info', { defaultValue: 'License Information' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('licenseNumber', true)}
                  </span>
                  <span className="font-medium">{driver.licenseNumber || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('expirationDate', true)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatDate(driver.licenseExpirationDate)}</span>
                    {expired && <Badge variant="destructive">{statusLabel('expired')}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {t('drivers:detail.vehicle_info', { defaultValue: 'Vehicle Information' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('licensePlate', true)}
                  </span>
                  <span className="font-medium">{driver.licensePlateNumber || '-'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {validationAttribute('timestamps', true)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{actionLabel('created')}</span>
                  <span className="font-medium">{formatDate(driver.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{actionLabel('updated')}</span>
                  <span className="font-medium">{formatDate(driver.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Base Location — internal drivers only */}
            {!driver.isOutsourced && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('drivers:detail.base_location', { defaultValue: 'Base Location' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {baseCenter ? (
                    <div>
                      {driver.baseAddress && <p className="font-medium">{driver.baseAddress}</p>}
                      <p className="text-muted-foreground text-sm">
                        {baseCenter.lat.toFixed(5)}, {baseCenter.lng.toFixed(5)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {t('drivers:detail.no_base_location', {
                        defaultValue: 'No base location set',
                      })}
                    </p>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setMapOpen(true)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    {baseCenter ? actionLabel('edit') : actionLabel('set')}
                  </Button>

                  <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          {t('drivers:detail.base_location', {
                            defaultValue: 'Base Location',
                          })}
                        </DialogTitle>
                      </DialogHeader>

                      <MapAddressPicker
                        initialCenter={baseCenter}
                        onCoordsChange={handleCoordsChange}
                      />

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setMapOpen(false)}>
                          {actionLabel('cancel')}
                        </Button>
                        <Button onClick={handleSaveBaseLocation} disabled={!hasCoords || mapSaving}>
                          {mapSaving
                            ? t('common:saving', { defaultValue: 'Saving...' })
                            : actionLabel('save')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {!driver.isOutsourced && (
          <TabsContent value="schedule">
            <DriverScheduleTab driverId={driverId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
