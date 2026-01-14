'use client';

import { capitalize } from '@/utils/lang';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useBusiness, useDeleteBusiness } from '@/hooks/businesses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, User, MapPin, Calendar, Trash2 } from 'lucide-react';

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

export default function BusinessDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const businessId = Number(params.id);

  const { data: business, isLoading, error } = useBusiness(businessId);
  const deleteBusiness = useDeleteBusiness();

  const formatAddress = (address?: App.Data.Address.AddressData | null): string => {
    const notSpecified = t('businesses:detail.not_specified', { defaultValue: 'Not specified' });
    if (!address) return notSpecified;
    if (address.humanReadableAddress) return address.humanReadableAddress;
    const parts: string[] = [];
    if (address.streetAddress) parts.push(address.streetAddress);
    if (address.city?.name) parts.push(address.city.name);
    return parts.join(', ') || notSpecified;
  };

  const handleDelete = () => {
    if (
      confirm(
        t('businesses:detail.confirm_delete', {
          defaultValue: 'Are you sure you want to delete this business? This cannot be undone.',
        }),
      )
    ) {
      deleteBusiness.mutate(businessId, {
        onSuccess: () => router.push('/businesses'),
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

  if (error || !business) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">
          {t('businesses:failed_to_load', { defaultValue: 'Failed to load business' })}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
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
            <p className="text-muted-foreground">
              {capitalize(t('models:business_one', { defaultValue: 'Business' }))} #{business.id}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteBusiness.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common:delete', { defaultValue: 'Delete' })}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('businesses:detail.title', { defaultValue: 'Business Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:name', { defaultValue: 'Name' })}
              </span>
              <span className="font-medium">{business.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:type', { defaultValue: 'Type' })}
              </span>
              <span className="font-medium">{business.typeName || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t('businesses:detail.users_approve_orders', {
                  defaultValue: 'Users Approve Orders',
                })}
              </span>
              <Badge variant={business.usersCanApproveOwnOrders ? 'default' : 'secondary'}>
                {business.usersCanApproveOwnOrders
                  ? t('common:yes', { defaultValue: 'Yes' })
                  : t('common:no', { defaultValue: 'No' })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('businesses:owner', { defaultValue: 'Owner' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.user ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('common:name', { defaultValue: 'Name' })}
                  </span>
                  <span className="font-medium">{business.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('common:email', { defaultValue: 'Email' })}
                  </span>
                  <span className="font-medium">{business.user.email || '-'}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/users/${business.user?.id}`)}
                >
                  {t('drivers:detail.view_user_profile', { defaultValue: 'View User Profile' })}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                {t('businesses:detail.no_owner', { defaultValue: 'No owner assigned' })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('businesses:detail.primary_address', { defaultValue: 'Primary Address' })}
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
              {t('businesses:detail.timestamps', { defaultValue: 'Timestamps' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:created', { defaultValue: 'Created' })}
              </span>
              <span className="font-medium">{formatDate(business.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:updated', { defaultValue: 'Updated' })}
              </span>
              <span className="font-medium">{formatDate(business.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
