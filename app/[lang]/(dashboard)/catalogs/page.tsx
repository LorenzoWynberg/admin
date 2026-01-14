'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCatalogList } from '@/hooks/catalogs';
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
import { ChevronLeft, ChevronRight, Search, Database } from 'lucide-react';

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

export default function CatalogsPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useCatalogList({
    page,
    perPage: 15,
    search: search || undefined,
  });

  const catalogs = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{capitalize(t('models:catalog_other', { defaultValue: 'Catalogs' }))}</h1>
          <p className="text-muted-foreground">{t('catalogs:manage_description', { defaultValue: 'Manage catalog data' })}</p>
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
              placeholder={t('catalogs:search_placeholder', { defaultValue: 'Search catalogs...' })}
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
              {t('catalogs:failed_to_load', { defaultValue: 'Failed to load catalogs' })}
            </div>
          ) : catalogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Database className="mb-4 h-12 w-12" />
              <p>{t('catalogs:no_catalogs', { defaultValue: 'No catalogs found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalogs:code', { defaultValue: 'Code' })}</TableHead>
                  <TableHead>{t('common:name', { defaultValue: 'Name' })}</TableHead>
                  <TableHead>{t('catalogs:elements', { defaultValue: 'Elements' })}</TableHead>
                  <TableHead>{t('common:created', { defaultValue: 'Created' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogs.map((catalog) => (
                  <TableRow
                    key={catalog.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/catalogs/${catalog.id}`)}
                  >
                    <TableCell>
                      <Badge variant="outline">{catalog.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{catalog.name}</TableCell>
                    <TableCell>{catalog.elements?.length || 0}</TableCell>
                    <TableCell>{formatDate(catalog.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t('pagination:page_info', { current: meta.currentPage, last: meta.lastPage, total: meta.total, defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} catalogs)` })}
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
