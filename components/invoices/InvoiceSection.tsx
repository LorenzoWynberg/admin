'use client';

import { Download, FileText, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderInvoices } from '@/hooks/invoices';
import { formatDate, formatCurrency } from '@/utils/format';
import { Enums } from '@/data/app-enums';
import { capitalize } from '@/utils/lang';

type InvoiceData = App.Data.Invoice.InvoiceData;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.mandados.test:60';

interface InvoiceSectionProps {
  orderPublicId: string;
  currencySymbol?: string;
}

function getTypeBadgeVariant(type?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case Enums.InvoiceType.PaymentReceipt:
      return 'default';
    case Enums.InvoiceType.FinalReceipt:
      return 'secondary';
    case Enums.InvoiceType.RefundReceipt:
      return 'outline';
    case Enums.InvoiceType.SurchargeReceipt:
      return 'destructive';
    default:
      return 'outline';
  }
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  [Enums.InvoiceType.PaymentReceipt]: 'statuses:payment_receipt',
  [Enums.InvoiceType.RefundReceipt]: 'statuses:refund_receipt',
  [Enums.InvoiceType.SurchargeReceipt]: 'statuses:surcharge_receipt',
  [Enums.InvoiceType.FinalReceipt]: 'statuses:final_receipt',
};

function InvoiceCard({
  invoice,
  currencySymbol,
}: {
  invoice: InvoiceData;
  currencySymbol: string;
}) {
  const { t } = useTranslation();
  const docNumber =
    invoice.documentNumber ||
    `REC-${invoice.sequenceYear}-${String(invoice.sequenceNumber).padStart(4, '0')}`;

  const typeLabel = invoice.type
    ? t(TYPE_LABEL_KEYS[invoice.type] || 'statuses:receipt')
    : t('statuses:receipt');

  return (
    <div className="bg-muted/30 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{docNumber}</span>
            <Badge variant={getTypeBadgeVariant(invoice.type)}>{typeLabel}</Badge>
          </div>
          <p className="text-muted-foreground text-xs">{invoice.publicId}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">
            {formatCurrency(invoice.total || 0, currencySymbol)}
          </p>
          {invoice.createdAt && (
            <p className="text-muted-foreground text-xs">{formatDate(invoice.createdAt)}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`${API_URL}/invoices/${invoice.publicId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </a>
        </Button>
      </div>
    </div>
  );
}

export function InvoiceSection({ orderPublicId, currencySymbol = '₡' }: InvoiceSectionProps) {
  const { t } = useTranslation();
  const { data: invoices, isLoading, error } = useOrderInvoices({ orderPublicId });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {capitalize(t('models:invoice', { count: 2, defaultValue: 'Invoices' }))}
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
        ) : !invoices || invoices.length === 0 ? (
          <div className="py-6 text-center">
            <FileText className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {t('resource:empty', {
                resource: t('models:invoice', { count: 2, defaultValue: 'invoices' }),
                defaultValue: 'No invoices for this order',
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.publicId || invoice.id}
                invoice={invoice}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
