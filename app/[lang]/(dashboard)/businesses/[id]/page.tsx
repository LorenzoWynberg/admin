'use client';

import { useParams } from 'next/navigation';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useBusiness, useDeleteBusiness } from '@/hooks/businesses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
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

function formatAddress(address?: App.Data.Address.AddressData | null): string {
  if (!address) return 'Not specified';
  if (address.humanReadableAddress) return address.humanReadableAddress;
  const parts: string[] = [];
  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.city?.name) parts.push(address.city.name);
  return parts.join(', ') || 'Not specified';
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useLocalizedRouter();
  const businessId = Number(params.id);

  const { data: business, isLoading, error } = useBusiness(businessId);
  const deleteBusiness = useDeleteBusiness();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this business? This cannot be undone.')) {
      deleteBusiness.mutate(businessId, {
        onSuccess: () => router.push('/businesses'),
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

  if (error || !business) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load business</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <p className="text-muted-foreground">Business #{business.id}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteBusiness.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{business.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{business.typeName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Users Approve Orders</span>
              <Badge variant={business.usersCanApproveOwnOrders ? 'default' : 'secondary'}>
                {business.usersCanApproveOwnOrders ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.user ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{business.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{business.user.email || '-'}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/users/${business.user?.id}`)}
                >
                  View User Profile
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No owner assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Primary Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatAddress(business.primaryAddress)}</p>
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
              <span className="font-medium">{formatDate(business.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">{formatDate(business.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
