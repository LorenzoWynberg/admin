'use client';

import { useParams } from 'next/navigation';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useOrder, useApproveOrder, useDenyOrder, useDeleteOrder } from '@/hooks/orders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { CreateQuoteDialog } from '@/components/orders/CreateQuoteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Package,
  Calendar,
  DollarSign,
  Truck,
  Building2,
  CheckCircle,
  XCircle,
  Trash2,
  Route,
  Clock,
} from 'lucide-react';

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

function formatAddress(address?: App.Data.Address.AddressData | null): string {
  if (!address) return 'Not specified';
  if (address.humanReadableAddress) return address.humanReadableAddress;
  const parts: string[] = [];
  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.city?.name) parts.push(address.city.name);
  if (address.state?.name) parts.push(address.state.name);
  return parts.join(', ') || 'Not specified';
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useLocalizedRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useOrder({ id: orderId });
  const approveOrder = useApproveOrder();
  const denyOrder = useDenyOrder();
  const deleteOrder = useDeleteOrder();

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this order?')) {
      approveOrder.mutate(orderId);
    }
  };

  const handleDeny = () => {
    if (confirm('Are you sure you want to deny this order?')) {
      denyOrder.mutate(orderId);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      deleteOrder.mutate(orderId, {
        onSuccess: () => router.push('/orders'),
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

  if (error || !order) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load order</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const canApproveOrDeny = order.status === 'estimated';
  const canCreateQuote = order.status === 'pending' && !order.currentQuote;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>
              <OrderStatusBadge status={order.status as OrderStatus} />
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canCreateQuote && (
            <CreateQuoteDialog
              orderId={orderId}
              defaultCurrency={order.currencyCode || 'CRC'}
              orderDistanceKm={order.distanceKm}
              orderEstimatedMinutes={order.estimatedMinutes}
            />
          )}
          {canApproveOrDeny && (
            <>
              <Button
                variant="outline"
                onClick={handleDeny}
                disabled={denyOrder.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Deny
              </Button>
              <Button onClick={handleApprove} disabled={approveOrder.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteOrder.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pickup Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <MapPin className="h-5 w-5" />
              Pickup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.fromName || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">Contact Name</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.fromPhone || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatAddress(order.fromAddress)}</p>
                <p className="text-sm text-muted-foreground">Address</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="h-5 w-5" />
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.toName || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">Contact Name</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.toPhone || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatAddress(order.toAddress)}</p>
                <p className="text-sm text-muted-foreground">Address</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{order.description}</p>
              </div>
            )}
            {(order.distanceKm || order.estimatedMinutes) && (
              <div className="flex gap-6">
                {order.distanceKm && (
                  <div className="flex items-start gap-3">
                    <Route className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.distanceKm} km</p>
                      <p className="text-sm text-muted-foreground">Distance</p>
                    </div>
                  </div>
                )}
                {order.estimatedMinutes && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.estimatedMinutes} min</p>
                      <p className="text-sm text-muted-foreground">Est. Trip Time</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-4">
              {order.requiresPin && (
                <Badge variant="secondary">Requires PIN</Badge>
              )}
              {order.isContactless && (
                <Badge variant="secondary">Contactless</Badge>
              )}
            </div>
            {order.fulfilledBefore && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(order.fulfilledBefore)}</p>
                  <p className="text-sm text-muted-foreground">Deliver By</p>
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
              Quote & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.currentQuote ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">
                    {order.currencyCode} {order.currentQuote.baseFare?.toFixed(2) || '0.00'}
                  </span>
                </div>
                {order.currentQuote.distanceFee && order.currentQuote.distanceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance Fee</span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.distanceFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.currentQuote.timeFee && order.currentQuote.timeFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Fee</span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.timeFee.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.currentQuote.surcharge && order.currentQuote.surcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Surcharge</span>
                    <span className="font-medium">
                      {order.currencyCode} {order.currentQuote.surcharge.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {order.currencyCode} {order.currentQuote.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/quotes/${order.currentQuote?.id}`)}
                >
                  View Quote Details
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No quote available</p>
                {canCreateQuote && (
                  <CreateQuoteDialog
                    orderId={orderId}
                    defaultCurrency={order.currencyCode || 'CRC'}
                    orderDistanceKm={order.distanceKm}
                    orderEstimatedMinutes={order.estimatedMinutes}
                  />
                )}
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {order.paymentStatus || 'Unpaid'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Driver */}
        {order.driver && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Assigned Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.driver.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">Name</p>
                </div>
              </div>
              {order.driver.licensePlateNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
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
                Business
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
