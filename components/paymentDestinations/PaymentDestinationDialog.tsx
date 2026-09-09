'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  useCreatePaymentDestination,
  useUpdatePaymentDestination,
} from '@/hooks/paymentDestinations';
import { useCurrencyList } from '@/hooks/currencies';
import { DESTINATION_METHODS } from '@/services/paymentDestinationService';
import { actionLabel, resourceMessage, validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

type PaymentDestinationData = App.Data.PaymentDestination.PaymentDestinationData;
type SettlementMethod = App.Enums.SettlementMethod;

interface FormState {
  method: string;
  currencyCode: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  holderName: string;
  legalId: string;
  maxAmount: string;
  active: boolean;
  sortOrder: string;
}

function blankForm(): FormState {
  return {
    method: Enums.SettlementMethod.Transferencia,
    currencyCode: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    iban: '',
    holderName: '',
    legalId: '',
    maxAmount: '',
    active: true,
    sortOrder: '',
  };
}

function formFrom(destination: PaymentDestinationData): FormState {
  return {
    method: destination.method ?? Enums.SettlementMethod.Transferencia,
    currencyCode: destination.currencyCode ?? '',
    phoneNumber: destination.phoneNumber ?? '',
    bankName: destination.bankName ?? '',
    accountNumber: destination.accountNumber ?? '',
    iban: destination.iban ?? '',
    holderName: destination.holderName ?? '',
    legalId: destination.legalId ?? '',
    maxAmount: destination.maxAmount != null ? String(destination.maxAmount) : '',
    active: destination.active ?? true,
    sortOrder: destination.sortOrder != null ? String(destination.sortOrder) : '',
  };
}

interface PaymentDestinationDialogProps {
  /** Absent for a create, present for an edit. */
  destination?: PaymentDestinationData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create or edit a destination.
 *
 * `method` is editable only on create: it decides which of the other fields the
 * row may carry, so changing it in place would leave a destination holding the
 * wrong method's fields — the api refuses it outright (`'method' => prohibited`
 * on the update DTO). Swapping a method means deactivating the row and creating
 * a new one.
 */
export function PaymentDestinationDialog({
  destination,
  open,
  onOpenChange,
}: PaymentDestinationDialogProps) {
  const { t } = useTranslation();
  const isEdit = destination !== undefined;

  const [form, setForm] = useState<FormState>(() =>
    destination ? formFrom(destination) : blankForm()
  );
  const [seeded, setSeeded] = useState(false);

  const create = useCreatePaymentDestination();
  const update = useUpdatePaymentDestination();
  const { data: currencyData } = useCurrencyList();

  const currencies = (currencyData?.items ?? []).filter((currency) => currency.isEnabled);

  if (open && !seeded) {
    setForm(destination ? formFrom(destination) : blankForm());
    setSeeded(true);
  }
  if (!open && seeded) {
    setSeeded(false);
  }

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isSinpe = form.method === Enums.SettlementMethod.SinpeMobile;

  const isValid =
    form.holderName.trim().length >= 2 &&
    form.legalId.trim().length >= 2 &&
    (isSinpe
      ? form.phoneNumber.trim() !== ''
      : form.currencyCode !== '' &&
        form.bankName.trim() !== '' &&
        form.accountNumber.trim() !== '');

  const pending = create.isPending || update.isPending;

  /**
   * Only the fields this method admits are sent. Every sibling field is
   * `prohibited` on the api side, so a stale SINPE phone number left on a
   * transfer payload fails the whole request rather than being ignored.
   */
  const methodFields = isSinpe
    ? { phoneNumber: form.phoneNumber.trim() }
    : {
        currencyCode: form.currencyCode,
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        iban: form.iban.trim() || null,
      };

  const shared = {
    holderName: form.holderName.trim(),
    legalId: form.legalId.trim(),
    maxAmount: form.maxAmount.trim() === '' ? null : Number(form.maxAmount),
    active: form.active,
    sortOrder: form.sortOrder.trim() === '' ? null : Number(form.sortOrder),
  };

  const handleSubmit = () => {
    if (!isValid) return;
    const close = { onSuccess: () => onOpenChange(false) };

    if (isEdit && destination?.id != null) {
      update.mutate({ id: destination.id, data: { ...methodFields, ...shared } }, close);
      return;
    }

    create.mutate({ method: form.method as SettlementMethod, ...methodFields, ...shared }, close);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Every field carries its own label and the title names the act, so there
          is nothing a description would add. Radix warns unless the opt-out is
          explicit, which is what `aria-describedby={undefined}` is for. */}
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {resourceMessage(isEdit ? 'edit' : 'create', 'payment_destination')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="destination-method">{validationAttribute('method')}</Label>
            <Select
              value={form.method}
              onValueChange={(value) => set('method', value)}
              disabled={isEdit}
            >
              <SelectTrigger id="destination-method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t(`payments:settlement_method.${method}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSinpe ? (
            <div className="grid gap-2">
              <Label htmlFor="destination-phone">{validationAttribute('phoneNumber')}</Label>
              <Input
                id="destination-phone"
                value={form.phoneNumber}
                onChange={(e) => set('phoneNumber', e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="destination-currency">{validationAttribute('currencyCode')}</Label>
                <Select
                  value={form.currencyCode}
                  onValueChange={(value) => set('currencyCode', value)}
                >
                  <SelectTrigger id="destination-currency" className="w-full">
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
              <div className="grid gap-2">
                <Label htmlFor="destination-bank">{validationAttribute('bankName')}</Label>
                <Input
                  id="destination-bank"
                  value={form.bankName}
                  onChange={(e) => set('bankName', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination-account">{validationAttribute('accountNumber')}</Label>
                <Input
                  id="destination-account"
                  value={form.accountNumber}
                  onChange={(e) => set('accountNumber', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination-iban">{validationAttribute('iban')}</Label>
                <Input
                  id="destination-iban"
                  value={form.iban}
                  onChange={(e) => set('iban', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="destination-holder">{validationAttribute('holderName')}</Label>
            <Input
              id="destination-holder"
              value={form.holderName}
              onChange={(e) => set('holderName', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="destination-legal-id">{validationAttribute('legalId')}</Label>
            <Input
              id="destination-legal-id"
              value={form.legalId}
              onChange={(e) => set('legalId', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="destination-max">{validationAttribute('maxAmount')}</Label>
              <Input
                id="destination-max"
                type="number"
                min="0"
                step="0.01"
                value={form.maxAmount}
                onChange={(e) => set('maxAmount', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination-sort">{validationAttribute('sortOrder')}</Label>
              <Input
                id="destination-sort"
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="destination-active"
              checked={form.active}
              onCheckedChange={(checked) => set('active', checked)}
            />
            <Label htmlFor="destination-active" className="font-normal">
              {validationAttribute('active')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button disabled={!isValid || pending} onClick={handleSubmit}>
            {actionLabel('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
