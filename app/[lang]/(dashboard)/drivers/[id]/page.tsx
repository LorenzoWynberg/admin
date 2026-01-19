'use client';

import { capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useDriver, useDeleteDriver } from '@/hooks/drivers';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, CreditCard, Car, Calendar, Trash2 } from 'lucide-react';

function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

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
              {capitalize(t('models:driver_one', { defaultValue: 'Driver' }))} {driver.publicId}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteDriver.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common:delete', { defaultValue: 'Delete' })}
        </Button>
      </div>

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
              <span className="text-muted-foreground">{validationAttribute('email', true)}</span>
              <span className="font-medium">{driver.user?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{validationAttribute('phone', true)}</span>
              <span className="font-medium">{driver.user?.phone || '-'}</span>
            </div>
            {driver.user?.publicId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/users/${driver.user?.publicId}`)}
              >
                {t('drivers:detail.view_user_profile', { defaultValue: 'View User Profile' })}
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
                {expired && (
                  <Badge variant="destructive">
                    {t('drivers:detail.expired', { defaultValue: 'Expired' })}
                  </Badge>
                )}
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
              <span className="text-muted-foreground">
                {t('common:created', { defaultValue: 'Created' })}
              </span>
              <span className="font-medium">{formatDate(driver.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:updated', { defaultValue: 'Updated' })}
              </span>
              <span className="font-medium">{formatDate(driver.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
