'use client';

import {
  DollarSign,
  Building2,
  ArrowLeft,
  Calendar,
  Package,
  Trash2,
  MapPin,
  Route,
  Phone,
  Clock,
  Truck,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { CreateQuoteDialog } from '@/components/orders/CreateQuoteDialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import { useOrder, useDeleteOrder } from '@/hooks/orders';

type OrderStatus = App.Enums.OrderStatus;

function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrder({ id: orderId });
  const deleteOrder = useDeleteOrder();

  const formatAddress = (address?: App.Data.Address.AddressData | null): string => {
    const notSpecified = t('orders:detail.not_specified', { defaultValue: 'Not specified' });
    if (!address) return notSpecified;
    if (address.humanReadableAddress) return address.humanReadableAddress;
    const parts: string[] = [];
    if (address.streetAddress) parts.push(address.streetAddress);
    if (address.city?.name) parts.push(address.city.name);
    if (address.state?.name) parts.push(address.state.name);
    return parts.join(', ') || notSpecified;
  };

  const handleDelete = () => {
    if (
      confirm(
        t('orders:detail.confirm_delete', {
          defaultValue: 'Are you sure you want to delete this order? This cannot be undone.',
        })
      )
    ) {
      deleteOrder.mutate(orderId, {
        onSuccess: () => router.push('/orders'),
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

  if (error || !order) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{resourceMessage('failed_to_load', 'order')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  // Can create quote for: pending (no quote yet), or denied (re-quote after rejection)
  const canCreateQuote =
    (order.status === 'pending' && !order.currentQuote) || order.status === 'denied';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t('orders:order_id', {
                id: order.publicId,
                defaultValue: `Order ${order.publicId}`,
              })}
            </h1>
            <p className="text-muted-foreground text-sm">
              {capitalize(t('common:created', { defaultValue: 'Created' }))}{' '}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status as OrderStatus} />
          {canCreateQuote && order.id && (
            <CreateQuoteDialog
              orderId={order.id}
              orderDistanceKm={order.distanceKm}
              orderEstimatedMinutes={order.estimatedMinutes}
              customerCurrencyCode={order.user?.preferredCurrency || order.currencyCode}
              customerDesiredDelivery={order.fulfilledBefore}
            />
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteOrder.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {capitalize(t('common:delete', { defaultValue: 'Delete' }))}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pickup Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <MapPin className="h-5 w-5" />
              {t('orders:detail.pickup', { defaultValue: 'Pickup' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {order.fromName ||
                    t('orders:detail.not_specified', { defaultValue: 'Not specified' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('orders:detail.contact_name', { defaultValue: 'Contact Name' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {order.fromPhone ||
                    t('orders:detail.not_specified', { defaultValue: 'Not specified' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('phone', true)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">{formatAddress(order.fromAddress)}</p>
                <p className="text-muted-foreground text-sm">
                  {t('orders:detail.address', { defaultValue: 'Address' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="h-5 w-5" />
              {t('orders:detail.delivery', { defaultValue: 'Delivery' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {order.toName ||
                    t('orders:detail.not_specified', { defaultValue: 'Not specified' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('orders:detail.contact_name', { defaultValue: 'Contact Name' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {order.toPhone ||
                    t('orders:detail.not_specified', { defaultValue: 'Not specified' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('phone', true)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">{formatAddress(order.toAddress)}</p>
                <p className="text-muted-foreground text-sm">
                  {t('orders:detail.address', { defaultValue: 'Address' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('orders:detail.title', { defaultValue: 'Order Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.description && (
              <div>
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('description', true)}
                </p>
                <p className="font-medium">{order.description}</p>
              </div>
            )}
            {(order.distanceKm || order.estimatedMinutes) && (
              <div className="flex gap-6">
                {order.distanceKm && (
                  <div className="flex items-start gap-3">
                    <Route className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">{order.distanceKm} km</p>
                      <p className="text-muted-foreground text-sm">
                        {validationAttribute('distance', true)}
                      </p>
                    </div>
                  </div>
                )}
                {order.estimatedMinutes && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">{order.estimatedMinutes} min</p>
                      <p className="text-muted-foreground text-sm">
                        {t('orders:detail.est_trip_time', { defaultValue: 'Est. Trip Time' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-4">
              {order.requiresPin && (
                <Badge variant="secondary">
                  {t('orders:detail.requiresPin', { defaultValue: 'Requires PIN' })}
                </Badge>
              )}
              {order.isContactless && (
                <Badge variant="secondary">
                  {t('orders:detail.isContactless', { defaultValue: 'Contactless' })}
                </Badge>
              )}
            </div>
            {order.fulfilledBefore && (
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">{formatDate(order.fulfilledBefore)}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('orders:detail.deliver_by', { defaultValue: 'Deliver By' })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('orders:detail.quote_payment', { defaultValue: 'Quote & Payment' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.currentQuote ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {validationAttribute('serviceFee', true)}
                  </span>
                  <span className="font-medium">
                    {order.currencyCode} {order.currentQuote.baseFare?.toFixed(2) || '0.00'}
                  </span>
                </div>
                {order.currentQuote.distanceFee != null && order.currentQuote.distanceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {validationAttribute('distanceFee', true)}
                    </span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.distanceFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.currentQuote.timeFee != null && order.currentQuote.timeFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {validationAttribute('timeFee', true)}
                    </span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.timeFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.currentQuote.surcharge != null && order.currentQuote.surcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {validationAttribute('surcharge', true)}
                    </span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.surcharge.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{validationAttribute('total', true)}</span>
                    <span>
                      {order.currencyCode} {order.currentQuote.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/quotes/${order.currentQuote?.publicId}`)}
                >
                  {t('orders:detail.view_quote', { defaultValue: 'View Quote Details' })}
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('orders:detail.no_quote', { defaultValue: 'No quote available' })}
                </p>
                {canCreateQuote && order.id && (
                  <CreateQuoteDialog
                    orderId={order.id}
                    orderDistanceKm={order.distanceKm}
                    orderEstimatedMinutes={order.estimatedMinutes}
                    customerCurrencyCode={order.user?.preferredCurrency || order.currencyCode}
                    customerDesiredDelivery={order.fulfilledBefore}
                  />
                )}
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">
                {t('orders:detail.payment_status', { defaultValue: 'Payment Status' })}
              </span>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {t(`statuses:${order.paymentStatus || 'unpaid'}`, {
                  defaultValue: capitalize(order.paymentStatus || 'unpaid'),
                })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Trip Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('orders:detail.trip_schedule', { defaultValue: 'Trip Schedule' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.fulfilledBefore && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.deliver_by', { defaultValue: 'Deliver By' })}
                </span>
                <span className="font-medium">{formatDate(order.fulfilledBefore)}</span>
              </div>
            )}
            {order.pickupScheduledFor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.pickup_scheduled', { defaultValue: 'Pickup Scheduled' })}
                </span>
                <span className="font-medium">{formatDate(order.pickupScheduledFor)}</span>
              </div>
            )}
            {order.deliveryScheduledFor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.delivery_scheduled', { defaultValue: 'Delivery Scheduled' })}
                </span>
                <span className="font-medium">{formatDate(order.deliveryScheduledFor)}</span>
              </div>
            )}
            {order.pickupCompletedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.pickup_completed', { defaultValue: 'Pickup Completed' })}
                </span>
                <span className="font-medium text-green-600">
                  {formatDate(order.pickupCompletedAt)}
                </span>
              </div>
            )}
            {order.deliveryCompletedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.delivery_completed', { defaultValue: 'Delivery Completed' })}
                </span>
                <span className="font-medium text-green-600">
                  {formatDate(order.deliveryCompletedAt)}
                </span>
              </div>
            )}
            {!order.fulfilledBefore &&
              !order.pickupScheduledFor &&
              !order.deliveryScheduledFor &&
              !order.pickupCompletedAt &&
              !order.deliveryCompletedAt && (
                <p className="text-muted-foreground text-center">
                  {t('orders:detail.no_schedule', { defaultValue: 'No schedule set' })}
                </p>
              )}
          </CardContent>
        </Card>

        {/* Assigned Driver */}
        {order.driver && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t('orders:detail.assigned_driver', { defaultValue: 'Assigned Driver' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">
                    {order.driver.user?.name || t('common:unknown', { defaultValue: 'Unknown' })}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {validationAttribute('name', true)}
                  </p>
                </div>
              </div>
              {order.driver.licensePlateNumber && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    {validationAttribute('licensePlate', true)}
                  </p>
                  <p className="font-medium">{order.driver.licensePlateNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Business */}
        {order.business && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('models:business_one', { defaultValue: 'Business' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.business.name}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
