'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useCatalog, useCatalogElements } from '@/hooks/catalogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Database, List, Calendar, Pencil } from 'lucide-react';
import { capitalize } from '@/utils/lang';
import { ElementEditDialog } from '@/components/catalogs/ElementEditDialog';

type CatalogElementData = App.Data.CatalogElement.CatalogElementData;

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

export default function CatalogDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const catalogId = Number(params.id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<CatalogElementData | null>(null);

  const { data: catalog, isLoading, error } = useCatalog(catalogId);
  const { data: elementsData, isLoading: elementsLoading } = useCatalogElements(
    catalog?.code || '',
    { enabled: !!catalog?.code }
  );

  const handleEditElement = (element: CatalogElementData) => {
    setSelectedElement(element);
    setEditDialogOpen(true);
  };

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{t('catalogs:failed_to_load', { defaultValue: 'Failed to load catalog' })}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  const elements = elementsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{catalog.name}</h1>
            <Badge variant="outline">{catalog.code}</Badge>
          </div>
          <p className="text-muted-foreground">{capitalize(t('models:catalog_one', { defaultValue: 'Catalog' }))} #{catalog.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('catalogs:detail.title', { defaultValue: 'Catalog Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('catalogs:code', { defaultValue: 'Code' })}</span>
              <Badge variant="outline">{catalog.code}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common:name', { defaultValue: 'Name' })}</span>
              <span className="font-medium">{catalog.name}</span>
            </div>
            {catalog.description && (
              <div>
                <p className="text-sm text-muted-foreground">{t('catalogs:detail.description', { defaultValue: 'Description' })}</p>
                <p className="mt-1">{catalog.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('catalogs:detail.timestamps', { defaultValue: 'Timestamps' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common:created', { defaultValue: 'Created' })}</span>
              <span className="font-medium">{formatDate(catalog.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common:updated', { defaultValue: 'Updated' })}</span>
              <span className="font-medium">{formatDate(catalog.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            {t('catalogs:detail.elements_count', { count: elements.length, defaultValue: `Elements (${elements.length})` })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <List className="mb-4 h-12 w-12" />
              <p>{t('catalogs:detail.no_elements', { defaultValue: 'No elements in this catalog' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalogs:code', { defaultValue: 'Code' })}</TableHead>
                  <TableHead>{t('common:name', { defaultValue: 'Name' })}</TableHead>
                  <TableHead>{t('catalogs:detail.order', { defaultValue: 'Order' })}</TableHead>
                  <TableHead className="w-20">{t('common:actions', { defaultValue: 'Actions' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elements.map((element) => (
                  <TableRow key={element.id}>
                    <TableCell>
                      <Badge variant="outline">{element.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{element.name}</TableCell>
                    <TableCell>{element.order ?? '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditElement(element)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ElementEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        element={selectedElement}
        catalogId={catalogId}
        catalogCode={catalog?.code || ''}
      />
    </div>
  );
}
