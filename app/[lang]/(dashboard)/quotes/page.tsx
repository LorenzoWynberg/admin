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
import { useQuoteList } from '@/hooks/quotes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, FileText } from 'lucide-react';

type QuoteStatus = App.Enums.QuoteStatus;

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

function formatCurrency(amount?: number | null): string {
  if (amount == null) return '-';
  return amount.toFixed(2);
}

export default function QuotesPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuoteList({
    page,
    perPage: 15,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });

  const quotes = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  const statusOptions = [
    { value: 'all', label: t('quotes:status.all', { defaultValue: 'All Statuses' }) },
    { value: 'draft', label: t('quotes:status.draft', { defaultValue: 'Draft' }) },
    { value: 'sent', label: t('quotes:status.sent', { defaultValue: 'Sent' }) },
    { value: 'accepted', label: t('quotes:status.accepted', { defaultValue: 'Accepted' }) },
    { value: 'rejected', label: t('quotes:status.rejected', { defaultValue: 'Rejected' }) },
    { value: 'expired', label: t('quotes:status.expired', { defaultValue: 'Expired' }) },
    { value: 'finalized', label: t('quotes:status.finalized', { defaultValue: 'Finalized' }) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {capitalize(t('models:quote_other', { defaultValue: 'Quotes' }))}
          </h1>
          <p className="text-muted-foreground">
            {t('quotes:manage_description', { defaultValue: 'Create and manage delivery quotes' })}
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
                placeholder={t('quotes:search_placeholder', { defaultValue: 'Search quotes...' })}
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
                  placeholder={t('quotes:filter_by_status', { defaultValue: 'Filter by status' })}
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

      {/* Quotes Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {t('quotes:failed_to_load', { defaultValue: 'Failed to load quotes' })}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12" />
              <p>{t('quotes:no_quotes', { defaultValue: 'No quotes found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{validationAttribute('id')}</TableHead>
                  <TableHead>{t('models:order_one', { defaultValue: 'Order' })}</TableHead>
                  <TableHead>{t('common:status', { defaultValue: 'Status' })}</TableHead>
                  <TableHead>{validationAttribute('total')}</TableHead>
                  <TableHead>{t('quotes:valid_until', { defaultValue: 'Valid Until' })}</TableHead>
                  <TableHead>{t('common:created', { defaultValue: 'Created' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/quotes/${quote.id}`)}
                  >
                    <TableCell className="font-medium">#{quote.id}</TableCell>
                    <TableCell>
                      {quote.orderId ? (
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/orders/${quote.orderId}`);
                          }}
                        >
                          {t('orders:order_id', {
                            id: quote.orderId,
                            defaultValue: `Order #${quote.orderId}`,
                          })}
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <QuoteStatusBadge status={quote.status as QuoteStatus} />
                    </TableCell>
                    <TableCell>{formatCurrency(quote.total)}</TableCell>
                    <TableCell>{formatDate(quote.validUntil)}</TableCell>
                    <TableCell>{formatDate(quote.createdAt)}</TableCell>
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
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} quotes)`,
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
