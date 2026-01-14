'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddressList } from '@/hooks/addresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { capitalize } from '@/utils/lang';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, MapPin } from 'lucide-react';

function formatDate(dateString?: string): string {
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

export default function AddressesPage() {
  const { t, ready } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useAddressList({
    page,
    perPage: 15,
    search: search || undefined,
  });

  const addresses = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{capitalize(t('models:address_other', { defaultValue: 'Addresses' }))}</h1>
          <p className="text-muted-foreground">{t('addresses:manage_description', { defaultValue: 'View saved addresses' })}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common:filters', { defaultValue: 'Filters' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('addresses:search_placeholder', { defaultValue: 'Search addresses...' })}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">
              {t('addresses:failed_to_load', { defaultValue: 'Failed to load addresses' })}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MapPin className="mb-4 h-12 w-12" />
              <p>{t('addresses:no_addresses', { defaultValue: 'No addresses found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('addresses:label', { defaultValue: 'Label' })}</TableHead>
                  <TableHead>{t('models:address_one', { defaultValue: 'Address' })}</TableHead>
                  <TableHead>{t('addresses:city', { defaultValue: 'City' })}</TableHead>
                  <TableHead>{t('common:type', { defaultValue: 'Type' })}</TableHead>
                  <TableHead>{t('common:created', { defaultValue: 'Created' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell className="font-medium">
                      {address.label || '-'}
                      {address.isPrimary && (
                        <Badge variant="secondary" className="ml-2">
                          {t('addresses:primary', { defaultValue: 'Primary' })}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {address.humanReadableAddress || address.streetAddress || '-'}
                    </TableCell>
                    <TableCell>{address.city?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{address.type}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(address.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t('pagination:page_info', { current: meta.currentPage, last: meta.lastPage, total: meta.total, defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} addresses)` })}
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
