'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDriver, useDeleteDriver } from '@/hooks/drivers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  CreditCard,
  Car,
  Calendar,
  Trash2,
} from 'lucide-react';

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
  const router = useRouter();
  const driverId = Number(params.id);

  const { data: driver, isLoading, error } = useDriver(driverId);
  const deleteDriver = useDeleteDriver();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this driver? This cannot be undone.')) {
      deleteDriver.mutate(driverId, {
        onSuccess: () => router.push('/drivers'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load driver</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
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
            <h1 className="text-3xl font-bold">{driver.user?.name || 'Unknown'}</h1>
            <p className="text-muted-foreground">Driver #{driver.id}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteDriver.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{driver.user?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{driver.user?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{driver.user?.phone || '-'}</span>
            </div>
            {driver.userId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/users/${driver.userId}`)}
              >
                View User Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              License Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Number</span>
              <span className="font-medium">{driver.licenseNumber || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Expiration Date</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {formatDate(driver.licenseExpirationDate)}
                </span>
                {expired && <Badge variant="destructive">Expired</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Plate</span>
              <span className="font-medium">{driver.licensePlateNumber || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(driver.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">{formatDate(driver.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
