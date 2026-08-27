'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Loader2, Plus, Minus } from 'lucide-react';

import {
  DialogDescription,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreditLedger, useGrantCredit } from '@/hooks/credits';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { formatCurrency, formatDate } from '@/utils/format';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Enums } from '@/data/app-enums';

interface CreditLedgerCardProps {
  /** The account whose ledger this is — a user or a business public id. */
  ownerPublicId: string;
  /** Whether the viewer may move the balance. Grant/void is admin-only. */
  canManage?: boolean;
}

/**
 * An account's credit balance and the entries behind it.
 *
 * The balance is never edited directly — it is the sum of the entries, so a
 * correction is a new entry rather than a changed number.
 */
export function CreditLedgerCard({ ownerPublicId, canManage = false }: CreditLedgerCardProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useCreditLedger(ownerPublicId);

  const balance = data?.balance ?? 0;
  const entries = data?.entries ?? [];
  const symbol = data?.baseCurrency ?? '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" />
          {t('payments:credit.title')}
        </CardTitle>
        {canManage && <GrantCreditDialog ownerPublicId={ownerPublicId} balance={balance} />}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-semibold">{formatCurrency(balance, symbol)}</p>
          <p className="text-muted-foreground text-xs">{t('payments:credit.balance_hint')}</p>
        </div>

        {isLoading && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}

        {!isLoading && entries.length === 0 && (
          <p className="text-muted-foreground text-sm">{t('payments:credit.empty')}</p>
        )}

        {entries.length > 0 && (
          <ul className="divide-border divide-y">
            {entries.map((entry) => (
              <CreditEntryRow key={entry.publicId} entry={entry} symbol={symbol} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function CreditEntryRow({ entry, symbol }: { entry: App.Data.Credit.CreditData; symbol: string }) {
  const { t } = useTranslation();
  const amount = entry.amount ?? 0;
  const isCredit = amount >= 0;

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="space-y-0.5">
        <Badge variant="outline">{t(`payments:credit_type.${entry.type}`)}</Badge>
        {entry.notes && <p className="text-muted-foreground text-xs">{entry.notes}</p>}
        {entry.createdAt && (
          <p className="text-muted-foreground text-xs">{formatDate(entry.createdAt)}</p>
        )}
      </div>
      <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-destructive'}`}>
        {isCredit ? '+' : '−'}
        {formatCurrency(Math.abs(amount), symbol)}
      </p>
    </li>
  );
}

function GrantCreditDialog({ ownerPublicId, balance }: { ownerPublicId: string; balance: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(Enums.CreditEntryType.AdminGrant);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const grant = useGrantCredit();

  const parsed = parseFloat(amount);
  const isVoid = type === Enums.CreditEntryType.AdminVoid;
  const isValid =
    !isNaN(parsed) && parsed > 0 && notes.trim().length >= 3 && (!isVoid || parsed <= balance);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setType(Enums.CreditEntryType.AdminGrant);
      setAmount('');
      setNotes('');
    }
    setOpen(isOpen);
  };

  const handleSubmit = () => {
    if (!isValid) return;

    grant.mutate(
      { ownerPublicId, amount: parsed, type, notes: notes.trim() },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('payments:credit.adjust')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payments:credit.adjust')}</DialogTitle>
          <DialogDescription>{t('payments:credit.adjust_description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isVoid ? 'outline' : 'default'}
              size="sm"
              onClick={() => setType(Enums.CreditEntryType.AdminGrant)}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t('payments:credit_type.admin_grant')}
            </Button>
            <Button
              type="button"
              variant={isVoid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType(Enums.CreditEntryType.AdminVoid)}
            >
              <Minus className="mr-1 h-4 w-4" />
              {t('payments:credit_type.admin_void')}
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="credit-amount">{validationAttribute('amount', true)} *</Label>
            <Input
              id="credit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {isVoid && parsed > balance && (
              <p className="text-destructive text-xs">
                {t('payments:credit.void_exceeds_balance')}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="credit-notes">{validationAttribute('notes', true)} *</Label>
            <Textarea
              id="credit-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('payments:credit.notes_placeholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={grant.isPending || !isValid}>
            {grant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
