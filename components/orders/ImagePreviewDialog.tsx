'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

type OrderReceiptData = App.Data.Order.OrderReceiptData;

interface ImagePreviewDialogProps {
  receipt: OrderReceiptData | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ receipt, onClose }: ImagePreviewDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={receipt !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            {receipt?.originalName || receipt?.publicId}
          </DialogTitle>
        </DialogHeader>
        {receipt?.fileUrl && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.fileUrl}
              alt={receipt.originalName || receipt.publicId || ''}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  {t('common:download', { defaultValue: 'Download' })}
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
