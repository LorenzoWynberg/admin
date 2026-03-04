'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Loader2, Receipt } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderReceipts } from '@/hooks/orders';
import { formatDate } from '@/utils/format';
import { ImagePreviewDialog } from './ImagePreviewDialog';

type OrderReceiptData = App.Data.Order.OrderReceiptData;

interface ReceiptSectionProps {
  orderPublicId: string;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ReceiptCard({
  receipt,
  onPreview,
}: {
  receipt: OrderReceiptData;
  onPreview: (receipt: OrderReceiptData) => void;
}) {
  const { t } = useTranslation();
  const isImage = receipt.mimeType?.startsWith('image/');

  return (
    <div className="bg-muted/30 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-medium">
              {receipt.originalName || receipt.publicId}
            </span>
            {isImage && (
              <Badge variant="secondary" className="text-xs">
                {t('common:image', { defaultValue: 'Image' })}
              </Badge>
            )}
          </div>
          {receipt.notes && (
            <p className="text-muted-foreground pl-6 text-xs">{receipt.notes}</p>
          )}
          <div className="text-muted-foreground flex items-center gap-3 pl-6 text-xs">
            {receipt.createdAt && <span>{formatDate(receipt.createdAt)}</span>}
            {receipt.sizeBytes != null && <span>{formatBytes(receipt.sizeBytes)}</span>}
          </div>
        </div>
        {receipt.fileUrl && (
          isImage ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => onPreview(receipt)}
            >
              <Receipt className="mr-2 h-4 w-4" />
              {t('common:view', { defaultValue: 'View' })}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('common:view', { defaultValue: 'View' })}
              </a>
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export function ReceiptSection({ orderPublicId }: ReceiptSectionProps) {
  const { t } = useTranslation();
  const { data: receipts, isLoading, error } = useOrderReceipts({ orderPublicId });
  const [previewReceipt, setPreviewReceipt] = useState<OrderReceiptData | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('models:order_receipt', { count: 2, defaultValue: 'Receipts' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-destructive text-center text-sm">
              {t('common:error', { defaultValue: 'Failed to load data' })}
            </p>
          ) : !receipts || receipts.length === 0 ? (
            <div className="py-6 text-center">
              <Receipt className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                {t('resource:empty', {
                  resource: t('models:order_receipt', { count: 2, defaultValue: 'receipts' }),
                  defaultValue: 'No receipts for this order',
                })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.publicId || receipt.id}
                  receipt={receipt}
                  onPreview={setPreviewReceipt}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ImagePreviewDialog receipt={previewReceipt} onClose={() => setPreviewReceipt(null)} />
    </>
  );
}
