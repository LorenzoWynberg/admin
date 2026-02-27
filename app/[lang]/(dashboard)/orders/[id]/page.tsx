'use client';

import {
  Building2,
  ArrowLeft,
  Calendar,
  FileText,
  ListOrdered,
  MessageSquare,
  Package,
  ShoppingBag,
  Trash2,
  MapPin,
  Route,
  Phone,
  Clock,
  Timer,
  Truck,
  User,
  Calculator,
  Pencil,
  Plus,
} from 'lucide-react';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { CreateQuoteDialog } from '@/components/orders/CreateQuoteDialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ProofOfDeliveryCard } from '@/components/orders/ProofOfDeliveryCard';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { QuoteDetailDialog } from '@/components/quotes/QuoteDetailDialog';
import { PaymentSection } from '@/components/payments/PaymentSection';
import { EditStopAddressDialog } from '@/components/orders/EditStopAddressDialog';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { actionLabel, capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format';
import { useOrder, useDeleteOrder, useCalculateDistance } from '@/hooks/orders';
import { useCurrencyList } from '@/hooks/currencies';
import { Enums } from '@/data/app-enums';

type QuoteStatus = App.Enums.QuoteStatus;

type OrderStatus = App.Enums.OrderStatus;

export default function OrderDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrder({ id: orderId });
  const deleteOrder = useDeleteOrder();
  const calculateDistance = useCalculateDistance();
  const { data: currencyData } = useCurrencyList();
  const [editingStop, setEditingStop] = useState<App.Data.Order.OrderStopData | null>(null);

  // Get currency symbol for the order's currency
  const currencies = currencyData?.items || [];
  const orderCurrency = order?.currencyCode
    ? currencies.find((c) => c.code === order.currencyCode)
    : null;
  const currencySymbol = orderCurrency?.symbol || order?.currencyCode || '$';

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

  const orderStops = (order?.stops ?? []) as App.Data.Order.OrderStopData[];

  const isQuoteExpired = order.currentQuote?.status === 'expired';
  // Can create quote for: pending (no/expired quote), or denied (re-quote after rejection)
  const canCreateQuote =
    (order.status === 'pending' && (!order.currentQuote || isQuoteExpired)) ||
    order.status === 'denied';

  // Sort quotes newest first (highest version first)
  const sortedQuotes = [...(order.quotes || [])].sort(
    (a, b) => (b.version || 0) - (a.version || 0)
  );

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
              {actionLabel('created')} {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status as OrderStatus} />
          {canCreateQuote && order.id && order.publicId && (
            <CreateQuoteDialog
              orderId={order.id}
              orderPublicId={order.publicId}
              orderDistanceKm={order.totalDistanceKm}
              orderEstimatedMinutes={order.totalEstimatedMinutes}
              customerCurrencyCode={order.user?.preferredCurrency || order.currencyCode}
              customerDesiredDelivery={order.desiredDeliveryAt}
              customerDesiredPickup={order.desiredPickupAt}
              windowStart={order.windowStart}
              windowEnd={order.windowEnd}
              timeSensitive={order.timeSensitive}
            />
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteOrder.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {actionLabel('delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5" />
              {t('orders:detail.stops', { defaultValue: 'Stops' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(order.contactName || order.contactPhone) && (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  {t('orders:detail.order_contact', { defaultValue: 'Order Contact' })}
                </p>
                {order.contactName && (
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">{order.contactName}</span>
                  </div>
                )}
                {order.contactPhone && (
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">{order.contactPhone}</span>
                  </div>
                )}
              </div>
            )}
            {orderStops.length > 0 ? (
              <div className="space-y-3">
                {orderStops
                  .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                  .map((stop, idx) => (
                    <div key={stop.publicId || idx} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {stop.type === 'purchase' && (
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                          )}
                          {stop.type === 'pickup' && <MapPin className="h-4 w-4 text-green-600" />}
                          {stop.type === 'dropoff' && <MapPin className="h-4 w-4 text-red-600" />}
                          <Badge
                            variant="outline"
                            className={
                              stop.type === 'dropoff'
                                ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400'
                                : 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                            }
                          >
                            {t(`orders:stop_types.${stop.type}`, {
                              defaultValue: capitalize(stop.type || 'stop'),
                            })}
                          </Badge>
                          {(stop.name || stop.type === 'dropoff') && (
                            <span className="text-sm font-medium">
                              {stop.name ||
                                t('orders:detail.delivery', { defaultValue: 'Delivery' })}
                            </span>
                          )}
                        </div>
                        {stop.status && (
                          <Badge variant="secondary">
                            {t(`statuses:${stop.status}`, {
                              defaultValue: capitalize(stop.status),
                            })}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 pl-6">
                        {stop.address ? (
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{formatAddress(stop.address)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={() => setEditingStop(stop)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingStop(stop)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {t('orders:detail.add_address', {
                              defaultValue: 'Add Address',
                            })}
                          </Button>
                        )}
                        {stop.contactName && (
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-3.5 w-3.5" />
                            <span className="text-sm">{stop.contactName}</span>
                          </div>
                        )}
                        {stop.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-muted-foreground h-3.5 w-3.5" />
                            <span className="text-sm">{stop.contactPhone}</span>
                          </div>
                        )}
                        {stop.instructions && (
                          <div className="flex items-start gap-2">
                            <FileText className="text-muted-foreground mt-0.5 h-3.5 w-3.5" />
                            <span className="text-sm">{stop.instructions}</span>
                          </div>
                        )}
                        {stop.completedAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-sm text-green-600">
                              {formatDateTime(stop.completedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center text-sm">
                {t('orders:detail.no_stops', { defaultValue: 'No stops' })}
              </p>
            )}
            {order.deliveryAddress && (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  {t('orders:detail.delivery_address', { defaultValue: 'Delivery Address' })}
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{formatAddress(order.deliveryAddress)}</span>
                </div>
              </div>
            )}
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
            {(order.totalDistanceKm || order.totalEstimatedMinutes) && (
              <div className="flex gap-6">
                {order.totalDistanceKm && (
                  <div className="flex items-start gap-3">
                    <Route className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">{order.totalDistanceKm} km</p>
                      <p className="text-muted-foreground text-sm">
                        {validationAttribute('distance', true)}
                      </p>
                    </div>
                  </div>
                )}
                {order.totalEstimatedMinutes && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">{order.totalEstimatedMinutes} min</p>
                      <p className="text-muted-foreground text-sm">
                        {t('orders:detail.est_trip_time', { defaultValue: 'Est. Trip Time' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!order.totalDistanceKm &&
              orderStops.length >= 2 &&
              orderStops.every((s) => s.address) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => order.publicId && calculateDistance.mutate(order.publicId)}
                  disabled={calculateDistance.isPending}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {calculateDistance.isPending
                    ? t('common:loading', { defaultValue: 'Loading...' })
                    : t('orders:detail.calculate_distance', {
                        defaultValue: 'Calculate Distance',
                      })}
                </Button>
              )}
            <div className="flex flex-wrap gap-2">
              {order.deliveryTier && (
                <Badge
                  variant={
                    order.deliveryTier === 'custom'
                      ? 'outline'
                      : order.deliveryTier === 'cheapest'
                        ? 'secondary'
                        : 'default'
                  }
                  className={
                    order.deliveryTier === 'expedited'
                      ? 'border-transparent bg-blue-600 text-white'
                      : undefined
                  }
                >
                  {t(`orders:tiers.${order.deliveryTier}`, {
                    defaultValue: order.deliveryTier,
                  })}
                </Badge>
              )}
              {order.timeSensitive && (
                <Badge
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
                >
                  <Timer className="h-3 w-3" />
                  {t('orders:window.time_sensitive', { defaultValue: 'Time-Sensitive' })}
                </Badge>
              )}
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
              {order.requiresPhoto && (
                <Badge variant="secondary">
                  {t('routes:pod.require_photo', { defaultValue: 'Photo Proof' })}
                </Badge>
              )}
              {order.requiresSignature && (
                <Badge variant="secondary">
                  {t('routes:pod.require_signature', { defaultValue: 'Signature' })}
                </Badge>
              )}
            </div>
            {order.windowStart && order.windowEnd && (
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">
                    {formatDateTime(order.windowStart)} — {formatDateTime(order.windowEnd)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t('orders:window.window_start', { defaultValue: 'Window Start' })} –{' '}
                    {t('orders:window.window_end', { defaultValue: 'Window End' })}
                  </p>
                </div>
              </div>
            )}
            {order.desiredPickupAt && (
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">{formatDate(order.desiredPickupAt)}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('orders:detail.pick_up_by', { defaultValue: 'Pick Up By' })}
                  </p>
                </div>
              </div>
            )}
            {order.desiredDeliveryAt && (
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">{formatDate(order.desiredDeliveryAt)}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('orders:detail.deliver_by', { defaultValue: 'Deliver By' })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('orders:detail.quote_history', { defaultValue: 'Quote History' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedQuotes.length > 0 ? (
              <div className="space-y-3">
                {sortedQuotes.map((quote) => {
                  const isCurrent = quote.id === order.currentQuoteId;
                  return (
                    <div
                      key={quote.publicId || quote.id}
                      className={`rounded-lg border p-3 ${isCurrent ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate font-mono text-sm">{quote.publicId}</span>
                            <QuoteStatusBadge status={quote.status as QuoteStatus} />
                            {isCurrent && (
                              <Badge variant="outline" className="text-xs">
                                {t('orders:detail.current_quote', { defaultValue: 'Current' })}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            v{quote.version || 1} &middot; {formatDate(quote.createdAt)}
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-semibold">
                          {formatCurrency(quote.total || 0, currencySymbol)}
                        </p>
                      </div>
                      {quote.rejectionReason && (
                        <div className="mt-2 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            {quote.rejectionReason}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex justify-end">
                        <QuoteDetailDialog
                          quote={quote}
                          currencySymbol={currencySymbol}
                          isCurrent={isCurrent}
                          trigger={
                            <Button variant="ghost" size="sm">
                              {t('orders:detail.view_quote', {
                                defaultValue: 'View Quote Details',
                              })}
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('orders:detail.no_quote', { defaultValue: 'No quote available' })}
                </p>
              </div>
            )}
            {canCreateQuote && order.id && order.publicId && (
              <CreateQuoteDialog
                orderId={order.id}
                orderPublicId={order.publicId}
                orderDistanceKm={order.totalDistanceKm}
                orderEstimatedMinutes={order.totalEstimatedMinutes}
                customerCurrencyCode={order.user?.preferredCurrency || order.currencyCode}
                customerDesiredDelivery={order.desiredDeliveryAt}
                customerDesiredPickup={order.desiredPickupAt}
              />
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

        {/* Payments Section */}
        {order.publicId && (
          <PaymentSection orderPublicId={order.publicId} currencySymbol={currencySymbol} />
        )}

        {/* Trip Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('orders:detail.trip_schedule', { defaultValue: 'Trip Schedule' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.desiredPickupAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.pick_up_by', { defaultValue: 'Pick Up By' })}
                </span>
                <span className="font-medium">{formatDate(order.desiredPickupAt)}</span>
              </div>
            )}
            {order.desiredDeliveryAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('orders:detail.deliver_by', { defaultValue: 'Deliver By' })}
                </span>
                <span className="font-medium">{formatDate(order.desiredDeliveryAt)}</span>
              </div>
            )}
            {orderStops.some((s) => s.completedAt) && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t('orders:detail.stop_completions', { defaultValue: 'Stop Completions' })}
                </p>
                {orderStops
                  .filter((s) => s.completedAt)
                  .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                  .map((stop, idx) => (
                    <div key={stop.publicId || idx} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {stop.name ||
                          t(`orders:stop_types.${stop.type}`, {
                            defaultValue: capitalize(stop.type || 'stop'),
                          })}
                      </span>
                      <span className="font-medium text-green-600">
                        {formatDateTime(stop.completedAt!)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
            {!order.desiredDeliveryAt &&
              !order.desiredPickupAt &&
              !orderStops.some((s) => s.completedAt) && (
                <p className="text-muted-foreground text-center">
                  {t('orders:detail.no_schedule', { defaultValue: 'No schedule set' })}
                </p>
              )}
          </CardContent>
        </Card>

        {/* Proof of Delivery */}
        {order.status === Enums.OrderStatus.COMPLETED && order.publicId && (
          <ProofOfDeliveryCard orderPublicId={order.publicId} />
        )}

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

        {/* Chat */}
        {order.publicId && order.id && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('chat:title', { defaultValue: 'Chat' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChatTabs
                orderPublicId={order.publicId}
                orderId={order.id}
                showDelivery={
                  !!(
                    order.status &&
                    (
                      [
                        Enums.OrderStatus.ASSIGNED,
                        Enums.OrderStatus.PICKING_UP,
                        Enums.OrderStatus.ARRIVED_AT_PICKUP,
                        Enums.OrderStatus.PICKED_UP,
                        Enums.OrderStatus.IN_TRANSIT,
                        Enums.OrderStatus.ARRIVED_AT_DROP_OFF,
                        Enums.OrderStatus.WAITING_CONFIRMATION,
                        Enums.OrderStatus.COMPLETED,
                        Enums.OrderStatus.DELIVERY_FAILED,
                        Enums.OrderStatus.RETURNED_TO_SENDER,
                      ] as string[]
                    ).includes(order.status)
                  )
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Stop Address Dialog */}
      {order.publicId && editingStop && (
        <EditStopAddressDialog
          open={!!editingStop}
          onOpenChange={(open) => !open && setEditingStop(null)}
          stop={editingStop}
          orderPublicId={order.publicId}
        />
      )}
    </div>
  );
}
