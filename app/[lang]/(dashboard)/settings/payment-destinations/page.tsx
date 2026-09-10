'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';

import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentDestinationDialog } from '@/components/paymentDestinations/PaymentDestinationDialog';
import { usePaymentDestinations, useDeletePaymentDestination } from '@/hooks/paymentDestinations';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import {
  actionLabel,
  capitalize,
  modelLabel,
  resourceMessage,
  validationAttribute,
} from '@/utils/lang';
import { Enums } from '@/data/app-enums';

type PaymentDestinationData = App.Data.PaymentDestination.PaymentDestinationData;

/**
 * Where customers are told to send money.
 *
 * Deactivating is the ordinary move rather than deleting: a bill records the
 * destination it showed as a snapshot, so a removed row never rewrites history,
 * but a deactivated one stays legible to whoever is reading an old bill.
 */
export default function PaymentDestinationsPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();

  const { data: destinations, isLoading } = usePaymentDestinations();
  const remove = useDeletePaymentDestination();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentDestinationData | undefined>(undefined);

  if (!ready) return null;

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (destination: PaymentDestinationData) => {
    setEditing(destination);
    setDialogOpen(true);
  };

  const handleDelete = (destination: PaymentDestinationData) => {
    if (destination.id == null) return;
    if (!confirm(resourceMessage('confirm_delete', 'payment_destination'))) return;
    remove.mutate(destination.id);
  };

  const rows = destinations ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {actionLabel('back')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">
          {capitalize(modelLabel('payment_destination', 2, false))}
        </h1>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          {resourceMessage('create', 'payment_destination')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center">{t('common:loading')}</div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {resourceMessage('exists_yet', 'payment_destination', 0)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{validationAttribute('method')}</TableHead>
                  <TableHead>{validationAttribute('holderName')}</TableHead>
                  <TableHead>{validationAttribute('accountNumber')}</TableHead>
                  <TableHead>{validationAttribute('currencyCode')}</TableHead>
                  <TableHead>{t('common:active', { count: 2 })}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell>{t(`payments:settlement_method.${destination.method}`)}</TableCell>
                    <TableCell>{destination.holderName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {destination.method === Enums.SettlementMethod.SinpeMobile
                        ? destination.phoneNumber
                        : destination.accountNumber}
                    </TableCell>
                    <TableCell>{destination.currencyCode ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={destination.active ? 'secondary' : 'outline'}>
                        {destination.active
                          ? t('common:active', { count: 1 })
                          : t('common:inactive', { count: 1 })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(destination)}
                        aria-label={actionLabel('edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(destination)}
                        aria-label={actionLabel('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentDestinationDialog
        destination={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
