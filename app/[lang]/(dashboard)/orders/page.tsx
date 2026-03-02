'use client';

import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';

import { useState, useCallback } from 'react';
import {
  actionLabel,
  capitalize,
  modelLabel,
  resourceMessage,
  statusLabel,
  validationAttribute,
} from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import { formatDate } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { useOrderList } from '@/hooks/orders';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentStatusBadge } from '@/components/orders/PaymentStatusBadge';
import { ChevronLeft, ChevronRight, Search, Package, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

type OrderStatus = App.Enums.OrderStatus;

function formatAddress(address?: App.Data.Address.AddressData | null): string {
  if (!address) return '-';
  if (address.humanReadableAddress) return address.humanReadableAddress;
  const parts: string[] = [];
  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.city?.name) parts.push(address.city.name);
  return parts.join(', ') || '-';
}

export default function OrdersPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [pickupFrom, setPickupFrom] = useState('');
  const [pickupTo, setPickupTo] = useState('');
  const [deliveryFrom, setDeliveryFrom] = useState('');
  const [deliveryTo, setDeliveryTo] = useState('');

  const resetPage = useCallback(() => setPage(1), []);

  const { data, isLoading, error } = useOrderList({
    page,
    perPage: 15,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
    pickupFrom: pickupFrom || undefined,
    pickupTo: pickupTo || undefined,
    deliveryFrom: deliveryFrom || undefined,
    deliveryTo: deliveryTo || undefined,
  });

  const orders = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  const statusOptions = [
    { value: 'all', label: t('statuses:all', { defaultValue: 'All Statuses' }) },
    { value: Enums.OrderStatus.PENDING, label: statusLabel('pending') },
    { value: Enums.OrderStatus.ESTIMATED, label: statusLabel('estimated') },
    { value: Enums.OrderStatus.APPROVED, label: statusLabel('approved') },
    { value: Enums.OrderStatus.DENIED, label: statusLabel('denied') },
    { value: Enums.OrderStatus.ASSIGNED, label: statusLabel('assigned') },
    { value: Enums.OrderStatus.PICKING_UP, label: statusLabel('picking_up') },
    { value: Enums.OrderStatus.IN_TRANSIT, label: statusLabel('in_transit') },
    { value: Enums.OrderStatus.COMPLETED, label: statusLabel('completed') },
    { value: Enums.OrderStatus.DELIVERY_FAILED, label: statusLabel('delivery_failed') },
    { value: Enums.OrderStatus.CANCELED, label: statusLabel('canceled') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{capitalize(modelLabel('order', 2))}</h1>
          <p className="text-muted-foreground">
            {t('orders:manage_description', { defaultValue: 'Manage delivery orders and quotes' })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('common:filters', { defaultValue: 'Filters' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('orders:search_placeholder', { defaultValue: 'Search orders...' })}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('orders:filter_by_status', { defaultValue: 'Filter by status' })}
                />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="grid gap-1">
              <Label className="text-muted-foreground text-xs">
                {t('orders:detail.pickup_scheduled', { defaultValue: 'Pickup Scheduled' })}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={pickupFrom}
                  onChange={(e) => {
                    setPickupFrom(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="date"
                  value={pickupTo}
                  onChange={(e) => {
                    setPickupTo(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                {(pickupFrom || pickupTo) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setPickupFrom('');
                      setPickupTo('');
                      resetPage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-muted-foreground text-xs">
                {t('orders:detail.delivery_scheduled', { defaultValue: 'Delivery Scheduled' })}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={deliveryFrom}
                  onChange={(e) => {
                    setDeliveryFrom(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="date"
                  value={deliveryTo}
                  onChange={(e) => {
                    setDeliveryTo(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                {(deliveryFrom || deliveryTo) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setDeliveryFrom('');
                      setDeliveryTo('');
                      resetPage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {resourceMessage('failed_to_load', 'order', 2)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12" />
              <p>{t('orders:no_orders', { defaultValue: 'No orders found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{validationAttribute('id', true)}</TableHead>
                  <TableHead>{validationAttribute('status', true)}</TableHead>
                  <TableHead>
                    {t('orders:detail.payment_status', { defaultValue: 'Payment' })}
                  </TableHead>
                  <TableHead>{t('orders:detail.stops', { defaultValue: 'Stops' })}</TableHead>
                  <TableHead>{t('orders:to', { defaultValue: 'To' })}</TableHead>
                  <TableHead>{capitalize(modelLabel('quote'))}</TableHead>
                  <TableHead>{actionLabel('created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/orders/${order.publicId}`)}
                  >
                    <TableCell className="font-medium">{order.publicId}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-center">
                      {
                        ((order.stops ?? []) as App.Data.Order.OrderStopData[]).filter(
                          (s) => s.type !== Enums.OrderStopType.Dropoff
                        ).length
                      }
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formatAddress(order.deliveryAddress)}
                    </TableCell>
                    <TableCell>
                      {order.currentQuote?.total
                        ? `${order.currencyCode} ${order.currentQuote.total.toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-sm">
              {t('pagination:page_info', {
                current: meta.currentPage,
                last: meta.lastPage,
                total: meta.total,
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} orders)`,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('pagination:previous', { defaultValue: 'Previous' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.lastPage}
              >
                {t('pagination:next', { defaultValue: 'Next' })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
