'use client';

import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import {
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import {
  Coins,
  RefreshCw,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Settings2,
} from 'lucide-react';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  actionLabel,
  capitalize,
  resourceMessage,
  statusLabel,
  validationAttribute,
} from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import { formatDate } from '@/utils/format';
import { useCurrencyList, useUpdateCurrency } from '@/hooks/currencies';
import { useSyncExchangeRates } from '@/hooks/exchange-rates';
import {
  useExchangeRateMode,
  useUpdateExchangeRateMode,
} from '@/hooks/settings/useExchangeRateMode';

type CurrencyData = App.Data.Currency.CurrencyData;

function formatRate(rate?: number | null): string {
  if (rate === undefined || rate === null) return '-';
  return rate.toFixed(6);
}

export default function CurrencySettingsPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyData | null>(null);
  const [editForm, setEditForm] = useState({
    roundingMode: 'nearest',
    roundingIncrement: 0.01,
    manualRate: '',
  });

  const { data, isLoading, error } = useCurrencyList();
  const updateMutation = useUpdateCurrency();
  const syncMutation = useSyncExchangeRates();
  const { data: modeData } = useExchangeRateMode();
  const modeMutation = useUpdateExchangeRateMode();

  const isManualMode = modeData?.exchangeRateMode === Enums.ExchangeRateMode.Manual;

  const currencies = data?.items || [];
  const baseCurrency = currencies.find((c) => c.isBase);

  if (!ready) {
    return null;
  }

  const handleToggleEnabled = (currency: CurrencyData) => {
    if (!currency.code || currency.isBase) return;
    updateMutation.mutate({
      code: currency.code,
      data: { isEnabled: !currency.isEnabled },
    });
  };

  const handleOpenEditDialog = (currency: CurrencyData) => {
    setSelectedCurrency(currency);
    setEditForm({
      roundingMode: currency.roundingMode || 'nearest',
      roundingIncrement: currency.roundingIncrement || 0.01,
      manualRate: currency.manualRate != null ? String(currency.manualRate) : '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveRounding = () => {
    if (!selectedCurrency?.code) return;

    const payload: Record<string, unknown> = {
      roundingMode: editForm.roundingMode,
      roundingIncrement: editForm.roundingIncrement,
    };

    if (isManualMode && !selectedCurrency.isBase) {
      payload.manualRate = editForm.manualRate !== '' ? parseFloat(editForm.manualRate) : null;
    }

    updateMutation.mutate(
      {
        code: selectedCurrency.code,
        data: payload,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedCurrency(null);
        },
      }
    );
  };

  const handleToggleMode = () => {
    modeMutation.mutate(isManualMode ? Enums.ExchangeRateMode.Auto : Enums.ExchangeRateMode.Manual);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {actionLabel('back')}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('common:currency_settings', { defaultValue: 'Currency Settings' })}
          </h1>
          <p className="text-muted-foreground">
            {t('common:currency_settings_description', {
              defaultValue: 'Manage currencies and exchange rates',
            })}
          </p>
        </div>
        {!isManualMode && (
          <Button onClick={() => syncMutation.mutate(undefined)} disabled={syncMutation.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {t('common:sync_rates', { defaultValue: 'Sync Rates Now' })}
          </Button>
        )}
      </div>

      {/* Exchange Rate Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t('currencies:exchange_rate_mode', { defaultValue: 'Exchange Rate Mode' })}
          </CardTitle>
          <CardDescription>
            {isManualMode
              ? t('currencies:mode_manual_description', {
                  defaultValue: 'Set exchange rates manually for each currency.',
                })
              : t('currencies:mode_auto_description', {
                  defaultValue: 'Rates fetched automatically from external providers.',
                })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${!isManualMode ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('currencies:mode_auto', { defaultValue: 'Automatic' })}
              </span>
              <Switch
                checked={isManualMode}
                onCheckedChange={handleToggleMode}
                disabled={modeMutation.isPending}
              />
              <span
                className={`text-sm font-medium ${isManualMode ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t('currencies:mode_manual', { defaultValue: 'Manual' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Currency Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t('common:base_currency', { defaultValue: 'Base Currency' })}
          </CardTitle>
          <CardDescription>
            {t('common:base_currency_description', {
              defaultValue:
                'All pricing rules and quotes are stored in the base currency. Exchange rates convert from this currency.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {baseCurrency ? (
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <span className="text-primary text-xl font-bold">{baseCurrency.symbol}</span>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {baseCurrency.code} - {baseCurrency.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('common:precision', { defaultValue: 'Precision' })}: {baseCurrency.precision}{' '}
                  {t('common:decimal_places', { defaultValue: 'decimal places' })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t('common:no_base_currency', { defaultValue: 'No base currency configured' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Currencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('common:currencies', { defaultValue: 'Currencies' })}</CardTitle>
          <CardDescription>
            {t('common:currencies_description', {
              defaultValue: 'Enable or disable currencies and configure rounding settings',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {resourceMessage('failed_to_load', 'currency', 2)}
            </div>
          ) : currencies.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Coins className="mb-4 h-12 w-12" />
              <p>{t('common:no_currencies', { defaultValue: 'No currencies found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{validationAttribute('code', true)}</TableHead>
                  <TableHead>{validationAttribute('name', true)}</TableHead>
                  <TableHead>{t('common:symbol', { defaultValue: 'Symbol' })}</TableHead>
                  <TableHead>
                    {t('common:exchange_rate', { defaultValue: 'Exchange Rate' })}
                  </TableHead>
                  <TableHead>{t('common:rate_date', { defaultValue: 'Rate Date' })}</TableHead>
                  <TableHead>{t('common:rounding', { defaultValue: 'Rounding' })}</TableHead>
                  <TableHead>{validationAttribute('status', true)}</TableHead>
                  <TableHead>{t('common:enabled', { defaultValue: 'Enabled' })}</TableHead>
                  <TableHead className="w-[100px]">
                    {t('common:actions_label', { defaultValue: 'Actions' })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.code}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      {currency.isBase ? (
                        <span className="text-muted-foreground">
                          1.000000 ({t('common:base', { defaultValue: 'base' })})
                        </span>
                      ) : isManualMode ? (
                        currency.manualRate != null && currency.manualRate > 0 ? (
                          formatRate(1 / currency.manualRate)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )
                      ) : currency.currentRate ? (
                        formatRate(currency.currentRate)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {currency.isBase ? (
                        <span className="text-muted-foreground">-</span>
                      ) : isManualMode ? (
                        <Badge variant="outline" className="text-xs">
                          {t('currencies:mode_manual', { defaultValue: 'Manual' })}
                        </Badge>
                      ) : currency.rateDate ? (
                        <div className="flex items-center gap-1">
                          {formatDate(currency.rateDate)}
                          {currency.rateSource && (
                            <Badge variant="outline" className="text-xs">
                              {currency.rateSource}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">
                            {t('common:no_rate', { defaultValue: 'No rate' })}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {currency.roundingMode} @ {currency.roundingIncrement}
                      </span>
                    </TableCell>
                    <TableCell>
                      {currency.isBase ? (
                        <Badge className="bg-blue-600">
                          {t('common:base', { defaultValue: 'Base' })}
                        </Badge>
                      ) : currency.isEnabled ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {capitalize(statusLabel('active'))}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('common:disabled', { defaultValue: 'Disabled' })}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={currency.isEnabled || false}
                        onCheckedChange={() => handleToggleEnabled(currency)}
                        disabled={currency.isBase || updateMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditDialog(currency)}
                      >
                        {actionLabel('edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Rounding Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('common:edit_rounding', { defaultValue: 'Edit Rounding Settings' })} -{' '}
              {selectedCurrency?.code}
            </DialogTitle>
            <DialogDescription>
              {t('common:edit_rounding_description', {
                defaultValue: 'Configure how amounts are rounded for display in this currency',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isManualMode && !selectedCurrency?.isBase && (
              <div className="grid gap-2">
                <Label htmlFor="manualRate">
                  {t('currencies:manual_rate', { defaultValue: 'Manual Rate' })}
                </Label>
                <Input
                  id="manualRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`${t('common:e_g', { defaultValue: 'e.g.' })} 490.00`}
                  value={editForm.manualRate}
                  onChange={(e) => setEditForm((f) => ({ ...f, manualRate: e.target.value }))}
                />
                <p className="text-muted-foreground text-sm">
                  {baseCurrency?.code} {t('currencies:per_one', { defaultValue: 'per 1' })}{' '}
                  {selectedCurrency?.code}
                </p>
                {editForm.manualRate &&
                  parseFloat(editForm.manualRate) > 0 &&
                  (() => {
                    const rate = parseFloat(editForm.manualRate);
                    const inverse = 1 / rate;
                    const isLikelyWrong = rate < 1;
                    return (
                      <div
                        className={`rounded-md p-3 text-sm ${isLikelyWrong ? 'border border-amber-200 bg-amber-50' : 'bg-muted'}`}
                      >
                        <p className="font-medium">
                          {t('currencies:conversion_preview', {
                            defaultValue: 'Conversion preview',
                          })}
                          :
                        </p>
                        <p>
                          1 {selectedCurrency?.code} ={' '}
                          {rate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}{' '}
                          {baseCurrency?.code}
                        </p>
                        <p className="text-muted-foreground">
                          1 {baseCurrency?.code} ={' '}
                          {inverse.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}{' '}
                          {selectedCurrency?.code}
                        </p>
                        {isLikelyWrong && (
                          <p className="mt-2 flex items-center gap-1 font-medium text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {t('currencies:rate_seems_low', {
                              defaultValue:
                                'This value seems too low. Did you mean {{suggestion}}?',
                              suggestion: inverse.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              }),
                            })}
                          </p>
                        )}
                      </div>
                    );
                  })()}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="roundingMode">
                {t('common:rounding_mode', { defaultValue: 'Rounding Mode' })}
              </Label>
              <Select
                value={editForm.roundingMode}
                onValueChange={(value) => setEditForm((f) => ({ ...f, roundingMode: value }))}
              >
                <SelectTrigger id="roundingMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">
                    {t('common:rounding_nearest', { defaultValue: 'Nearest' })}
                  </SelectItem>
                  <SelectItem value="up">
                    {t('common:rounding_up', { defaultValue: 'Round Up' })}
                  </SelectItem>
                  <SelectItem value="down">
                    {t('common:rounding_down', { defaultValue: 'Round Down' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roundingIncrement">
                {t('common:rounding_increment', { defaultValue: 'Rounding Increment' })}
              </Label>
              <Input
                id="roundingIncrement"
                type="number"
                step="0.01"
                min="0.01"
                value={editForm.roundingIncrement}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    roundingIncrement: parseFloat(e.target.value) || 0.01,
                  }))
                }
              />
              <p className="text-muted-foreground text-sm">
                {t('common:rounding_increment_help', {
                  defaultValue:
                    'Examples: 0.01 (cents), 0.10 (dimes), 0.50 (half dollar), 1.00 (whole)',
                })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {actionLabel('cancel')}
            </Button>
            <Button onClick={handleSaveRounding} disabled={updateMutation.isPending}>
              {actionLabel('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
