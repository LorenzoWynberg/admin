'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HandCoins } from 'lucide-react';

import {
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSettlePeriodBill } from '@/hooks/periodBills';
import { usePaymentDestinations } from '@/hooks/paymentDestinations';
import { DESTINATION_METHODS } from '@/services/paymentDestinationService';
import { useCurrencyList } from '@/hooks/currencies';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

type PeriodBillData = App.Data.PeriodBill.PeriodBillData;
type SettlementMethod = App.Enums.SettlementMethod;

/**
 * Everything but `Credit`, derived rather than listed — the same rule
 * `SettlementMethod::recordableByHandCases()` states on the api side. Credit is
 * a tender the ledger has to have actually moved for, and only the bill's close
 * moves it; recording it here would mark a bill paid with money nothing was
 * spent from. Cash is in, and is admin-only for the opposite reason: the
 * operator who received it is the only party who can say so at all.
 */
const RECORDABLE_METHODS = Object.values(Enums.SettlementMethod).filter(
  (method) => method !== Enums.SettlementMethod.Credit
);

const NO_DESTINATION = 'none';

interface RecordBillPaymentDialogProps {
  bill: PeriodBillData;
}

/** Record a bill settled out of band (admin only). */
export function RecordBillPaymentDialog({ bill }: RecordBillPaymentDialogProps) {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const settle = useSettlePeriodBill();

  const { data: currencyData } = useCurrencyList();
  const { data: destinations } = usePaymentDestinations();

  const [method, setMethod] = useState<string>(Enums.SettlementMethod.Transferencia);
  const [currencyCode, setCurrencyCode] = useState('');
  const [reference, setReference] = useState('');
  const [destinationId, setDestinationId] = useState<string>(NO_DESTINATION);
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState<File | null>(null);

  const currencies = (currencyData?.items ?? []).filter((currency) => currency.isEnabled);
  const takesDestination = DESTINATION_METHODS.includes(method);
  // Pinned to the method and to an active row, because the api's own
  // `Rule::exists()` is: a destination belonging to another method fails.
  const availableDestinations = (destinations ?? []).filter(
    (destination) => destination.active && destination.method === method
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setMethod(Enums.SettlementMethod.Transferencia);
      setCurrencyCode(bill.currencyCode ?? '');
      setReference(bill.reference ?? '');
      setDestinationId(NO_DESTINATION);
      // Seeded from the bill for the same reason `reference` is: the api writes
      // `notes` UNCONDITIONALLY on settle, approve and reject — unlike
      // `reference`, `proof_path` and `settlement_destination`, which each fall
      // back to the bill's existing value when the act carries none. Left blank
      // here, submitting would silently null a note an earlier act recorded,
      // including a rejection reason the customer has already been sent.
      setNotes(bill.notes ?? '');
      setProof(null);
    }
    setOpen(isOpen);
  };

  const handleMethodChange = (value: string) => {
    setMethod(value);
    // A destination belongs to exactly one method, so keeping the old choice
    // across a method change would send one the api is certain to refuse.
    setDestinationId(NO_DESTINATION);
  };

  const handleSubmit = () => {
    settle.mutate(
      {
        publicId: bill.publicId,
        data: {
          method: method as SettlementMethod,
          currencyCode,
          reference: reference.trim() || null,
          destinationId:
            takesDestination && destinationId !== NO_DESTINATION ? Number(destinationId) : null,
          notes: notes.trim() || null,
          proof,
        },
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandCoins className="mr-1 h-4 w-4" />
          {t('manual.record_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('manual.record_title')}</DialogTitle>
          <DialogDescription>{t('period_bill.title')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="settle-method">{validationAttribute('method')}</Label>
            <Select value={method} onValueChange={handleMethodChange}>
              <SelectTrigger id="settle-method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECORDABLE_METHODS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`settlement_method.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settle-currency">{validationAttribute('currencyCode')}</Label>
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
              <SelectTrigger id="settle-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code ?? ''}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {takesDestination && (
            <div className="grid gap-2">
              <Label htmlFor="settle-destination">{validationAttribute('destinationId')}</Label>
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger id="settle-destination" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DESTINATION}>{t('common:none')}</SelectItem>
                  {availableDestinations.map((destination) => (
                    <SelectItem key={destination.id} value={String(destination.id)}>
                      {destination.holderName} — {destination.bankName ?? destination.phoneNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="settle-reference">{validationAttribute('reference')}</Label>
            <Input
              id="settle-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('manual.reference_placeholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settle-proof">{t('record.proof_label')}</Label>
            <Input
              id="settle-proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settle-notes">{validationAttribute('notes')}</Label>
            <Textarea
              id="settle-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t('manual.notes_placeholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button disabled={settle.isPending || currencyCode === ''} onClick={handleSubmit}>
            {t('record.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
