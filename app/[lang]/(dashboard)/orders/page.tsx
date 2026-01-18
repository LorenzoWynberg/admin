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

import { useState } from 'react';
import { capitalize, validationAttribute } from '@/utils/lang';
import { Input } from '@/components/ui/input';
import { useOrderList } from '@/hooks/orders';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';

type OrderStatus = App.Enums.OrderStatus;

function formatDate(dateString?: string): string {
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

  const { data, isLoading, error } = useOrderList({
    page,
    perPage: 15,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });

  const orders = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  const statusOptions = [
    { value: 'all', label: t('orders:status.all', { defaultValue: 'All Statuses' }) },
    { value: 'pending', label: t('orders:status.pending', { defaultValue: 'Pending' }) },
    { value: 'estimated', label: t('orders:status.estimated', { defaultValue: 'Quote Ready' }) },
    { value: 'approved', label: t('orders:status.approved', { defaultValue: 'Approved' }) },
    { value: 'denied', label: t('orders:status.denied', { defaultValue: 'Denied' }) },
    { value: 'assigned', label: t('orders:status.assigned', { defaultValue: 'Assigned' }) },
    { value: 'picking_up', label: t('orders:status.picking_up', { defaultValue: 'Picking Up' }) },
    { value: 'in_transit', label: t('orders:status.in_transit', { defaultValue: 'In Transit' }) },
    { value: 'completed', label: t('orders:status.completed', { defaultValue: 'Completed' }) },
    {
      value: 'delivery_failed',
      label: t('orders:status.delivery_failed', { defaultValue: 'Failed' }),
    },
    { value: 'canceled', label: t('orders:status.canceled', { defaultValue: 'Canceled' }) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {capitalize(t('models:order_other', { defaultValue: 'Orders' }))}
          </h1>
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
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('orders:search_placeholder', { defaultValue: 'Search orders...' })}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
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
              {t('orders:failed_to_load', { defaultValue: 'Failed to load orders' })}
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
                  <TableHead>{validationAttribute('id')}</TableHead>
                  <TableHead>{validationAttribute('status', true)}</TableHead>
                  <TableHead>{t('orders:from', { defaultValue: 'From' })}</TableHead>
                  <TableHead>{t('orders:to', { defaultValue: 'To' })}</TableHead>
                  <TableHead>{t('models:quote_one', { defaultValue: 'Quote' })}</TableHead>
                  <TableHead>{t('common:created', { defaultValue: 'Created' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formatAddress(order.fromAddress)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formatAddress(order.toAddress)}
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
