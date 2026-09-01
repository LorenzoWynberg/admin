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
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBalance, useAdjustBalance } from '@/hooks/balance';
import { actionLabel, statusLabel, validationAttribute } from '@/utils/lang';
import { formatCurrency, formatDate } from '@/utils/format';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Enums } from '@/data/app-enums';

interface BalanceCardProps {
  /** The account whose ledger this is — a user or a business public id. */
  ownerPublicId: string;
  /** Whether the viewer may move the balance. Grant/void is admin-only. */
  canManage?: boolean;
  /** This account's own debt ceiling, or null when it follows the default. */
  debtCeiling?: number | null;
  /** Omit to hide the ceiling control entirely. */
  onDebtCeilingChange?: (value: number | null) => void;
  isSavingCeiling?: boolean;
  /**
   * This account's billing cycle (an `App.Enums.BillingCycle` value).
   * Undefined/null renders as `PerOrder`. Typed as `string`, not the
   * nominal TS enum — DTO fields pass their raw string value here, which a
   * nominal enum type would reject at the call site.
   */
  billingCycle?: string | null;
  /** Omit to hide the billing cycle control entirely. */
  onBillingCycleChange?: (value: string) => void;
  isSavingBillingCycle?: boolean;
  /** Days of grace after a failed settlement before the account is blocked. */
  gracePeriodDays?: number | null;
  /** Omit to hide the grace period control entirely. */
  onGracePeriodDaysChange?: (value: number | null) => void;
  isSavingGracePeriod?: boolean;
  /**
   * Why THIS row is blocked from ordering, or null (an
   * `App.Enums.AccountBlockReason` value, typed as `string` for the same
   * reason as `billingCycle` above). On a business member this describes
   * their own account, never the company's — the company's reason lives on
   * `BusinessData` and is rendered on the business's own card.
   */
  blockReason?: string | null;
}

/**
 * An account's credit balance and the entries behind it.
 *
 * The balance is never edited directly — it is the sum of the entries, so a
 * correction is a new entry rather than a changed number.
 */
export function BalanceCard({
  ownerPublicId,
  canManage = false,
  debtCeiling,
  onDebtCeilingChange,
  isSavingCeiling = false,
  billingCycle,
  onBillingCycleChange,
  isSavingBillingCycle = false,
  gracePeriodDays,
  onGracePeriodDaysChange,
  isSavingGracePeriod = false,
  blockReason,
}: BalanceCardProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useBalance(ownerPublicId);

  const balance = data?.balance ?? 0;
  const entries = data?.entries ?? [];
  const symbol = data?.baseCurrency ?? '';

  // A short delivery can leave an account owing us. Admin reads the ledger of
  // record, so it stays in base currency — but it has to be obvious at a
  // glance which way the money points.
  const isDebt = balance < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" />
          {isDebt ? t('payments:balance.debt_title') : t('payments:balance.title')}
          <BlockReasonBadge reason={blockReason} />
        </CardTitle>
        {canManage && <GrantCreditDialog ownerPublicId={ownerPublicId} balance={balance} />}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className={`text-2xl font-semibold ${isDebt ? 'text-destructive' : ''}`}>
            {formatCurrency(balance, symbol)}
          </p>
          <p className="text-muted-foreground text-xs">
            {isDebt ? t('payments:balance.debt_hint') : t('payments:balance.balance_hint')}
          </p>
        </div>

        {isLoading && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}

        {!isLoading && entries.length === 0 && (
          <p className="text-muted-foreground text-sm">{t('payments:balance.empty')}</p>
        )}

        {entries.length > 0 && (
          <ul className="divide-border divide-y">
            {entries.map((entry) => (
              <CreditEntryRow key={entry.publicId} entry={entry} symbol={symbol} />
            ))}
          </ul>
        )}

        {canManage && onDebtCeilingChange && (
          <DebtCeilingField
            value={debtCeiling ?? null}
            onChange={onDebtCeilingChange}
            isPending={isSavingCeiling}
          />
        )}

        {canManage && onBillingCycleChange && (
          <BillingCycleField
            value={billingCycle}
            onChange={onBillingCycleChange}
            isPending={isSavingBillingCycle}
          />
        )}

        {canManage && onGracePeriodDaysChange && (
          <GracePeriodField
            value={gracePeriodDays ?? null}
            onChange={onGracePeriodDaysChange}
            isPending={isSavingGracePeriod}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Why this account cannot order right now — over its debt ceiling, or a
 * settlement past its grace period. Renders nothing when the account isn't
 * blocked, since the absence of a reason is the common case.
 */
function BlockReasonBadge({ reason }: { reason?: string | null }) {
  if (!reason) return null;

  return (
    <Badge data-testid="block-reason-badge" variant="destructive">
      {statusLabel(reason)}
    </Badge>
  );
}

/**
 * How often this account is charged: per order, or on a deferred cycle that
 * accrues deliveries and settles them together. Options are derived from the
 * enum itself so a new cycle case can't silently go missing from the list.
 */
function BillingCycleField({
  value,
  onChange,
  isPending,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  isPending: boolean;
}) {
  const current = value ?? Enums.BillingCycle.PerOrder;

  return (
    <div className="grid gap-2">
      <Label htmlFor="billing-cycle">{validationAttribute('billingCycle', true)}</Label>
      <Select value={current} onValueChange={onChange} disabled={isPending}>
        <SelectTrigger id="billing-cycle" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Enums.BillingCycle).map((cycle) => (
            <SelectItem key={cycle} value={cycle}>
              {statusLabel(cycle)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * How many days a deferred account gets after a failed settlement before it
 * is blocked from ordering. Blank follows the configured default, same as
 * the debt ceiling above.
 */
function GracePeriodField({
  value,
  onChange,
  isPending,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  isPending: boolean;
}) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  const trimmed = draft.trim();
  const parsed = trimmed === '' ? null : Number(trimmed);
  const isValid = parsed === null || (Number.isInteger(parsed) && parsed >= 0);
  const isDirty = (value === null ? '' : String(value)) !== trimmed;

  return (
    <div className="grid gap-2">
      <Label htmlFor="grace-period">{validationAttribute('gracePeriodDays', true)}</Label>
      <div className="flex gap-2">
        <Input
          id="grace-period"
          type="number"
          step="1"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!isValid || !isDirty || isPending}
          onClick={() => onChange(parsed)}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {actionLabel('save')}
        </Button>
      </div>
    </div>
  );
}

/**
 * How far this account may go into debt before it is refused a new order.
 *
 * Blank means the account follows the configured default, which is what
 * almost every account should do — this is here for the two ends of the
 * curve: a long-standing business that has earned more rope, and someone who
 * has walked away from a debt once and has earned less.
 */
function DebtCeilingField({
  value,
  onChange,
  isPending,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  const trimmed = draft.trim();
  const parsed = trimmed === '' ? null : Number(trimmed);
  const isValid = parsed === null || (!isNaN(parsed) && parsed >= 0);
  const isDirty = (value === null ? '' : String(value)) !== trimmed;

  return (
    <div className="border-border grid gap-2 border-t pt-4">
      <Label htmlFor="debt-ceiling">{validationAttribute('balanceDebtCeiling', true)}</Label>
      <div className="flex gap-2">
        <Input
          id="debt-ceiling"
          type="number"
          step="0.01"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('payments:balance.ceiling_default')}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!isValid || !isDirty || isPending}
          onClick={() => onChange(parsed)}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {actionLabel('save')}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{t('payments:balance.ceiling_hint')}</p>
    </div>
  );
}

function CreditEntryRow({
  entry,
  symbol,
}: {
  entry: App.Data.Balance.BalanceEntryData;
  symbol: string;
}) {
  const { t } = useTranslation();
  const amount = entry.amount ?? 0;
  const isCredit = amount >= 0;

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="space-y-0.5">
        <Badge variant="outline">{t(`payments:balance_entry_type.${entry.type}`)}</Badge>
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
  const [type, setType] = useState<string>(Enums.BalanceEntryType.AdminGrant);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const grant = useAdjustBalance();

  const parsed = parseFloat(amount);
  const isVoid = type === Enums.BalanceEntryType.AdminVoid;
  const isValid =
    !isNaN(parsed) && parsed > 0 && notes.trim().length >= 3 && (!isVoid || parsed <= balance);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setType(Enums.BalanceEntryType.AdminGrant);
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
          {t('payments:balance.adjust')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payments:balance.adjust')}</DialogTitle>
          <DialogDescription>{t('payments:balance.adjust_description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isVoid ? 'outline' : 'default'}
              size="sm"
              onClick={() => setType(Enums.BalanceEntryType.AdminGrant)}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t('payments:balance_entry_type.admin_grant')}
            </Button>
            <Button
              type="button"
              variant={isVoid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType(Enums.BalanceEntryType.AdminVoid)}
            >
              <Minus className="mr-1 h-4 w-4" />
              {t('payments:balance_entry_type.admin_void')}
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
                {t('payments:balance.void_exceeds_balance')}
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
              placeholder={t('payments:balance.notes_placeholder')}
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
