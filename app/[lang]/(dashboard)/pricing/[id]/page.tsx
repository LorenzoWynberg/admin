'use client';

import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import {
  usePricingRule,
  useActivatePricingRule,
  useDeactivatePricingRule,
  useDeletePricingRule,
  useDuplicatePricingRule,
} from '@/hooks/pricing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Pencil, Trash2, Copy, Power, PowerOff, DollarSign } from 'lucide-react';
import { useState } from 'react';

function formatCurrency(amount?: number, currencyCode?: string): string {
  if (amount === undefined) return '-';
  return `${currencyCode || ''} ${amount.toFixed(2)}`.trim();
}

function formatPercent(rate?: number): string {
  if (rate === undefined) return '-';
  return `${(rate * 100).toFixed(1)}%`;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export default function PricingRuleDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation('pricing');
  const router = useLocalizedRouter();
  const ruleId = Number(params.id);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  const { data: rule, isLoading, error } = usePricingRule({ id: ruleId });
  const activateMutation = useActivatePricingRule();
  const deactivateMutation = useDeactivatePricingRule();
  const deleteMutation = useDeletePricingRule();
  const duplicateMutation = useDuplicatePricingRule();

  const handleActivate = () => {
    activateMutation.mutate(ruleId);
    setActivateDialogOpen(false);
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate(ruleId);
  };

  const handleDelete = () => {
    deleteMutation.mutate(ruleId, {
      onSuccess: () => router.push('/pricing'),
    });
    setDeleteDialogOpen(false);
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(
      { id: ruleId },
      {
        onSuccess: (newRule) => {
          router.push(`/pricing/${newRule.id}`);
        },
      }
    );
  };

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{t('failed_to_load')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{rule.name}</h1>
            <div className="text-muted-foreground flex items-center gap-2">
              <span>
                {rule.currencyCode} - v{rule.version}
              </span>
              {rule.isActive ? (
                <Badge variant="default" className="bg-green-600">
                  {t('status_active')}
                </Badge>
              ) : (
                <Badge variant="secondary">{t('status_inactive')}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t('duplicate')}
          </Button>
          {rule.isActive ? (
            <Button
              variant="outline"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              <PowerOff className="mr-2 h-4 w-4" />
              {t('deactivate')}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setActivateDialogOpen(true)}
              disabled={activateMutation.isPending}
            >
              <Power className="mr-2 h-4 w-4" />
              {t('activate')}
            </Button>
          )}
          <Button onClick={() => router.push(`/pricing/${ruleId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('edit')}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('common:details', { defaultValue: 'Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('column_currency')}</span>
              <span className="font-medium">{rule.currencyCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('column_base_fare')}</span>
              <span className="font-medium">
                {formatCurrency(rule.baseFare, rule.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('column_tax_rate')}</span>
              <span className="font-medium">{formatPercent(rule.taxRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('column_version')}</span>
              <span className="font-medium">v{rule.version}</span>
            </div>
            {rule.effectiveFrom && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('effective_from')}</span>
                <span className="font-medium">{formatDate(rule.effectiveFrom)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('created_at')}</span>
              <span className="font-medium">{formatDate(rule.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('updated_at')}</span>
              <span className="font-medium">{formatDate(rule.updatedAt)}</span>
            </div>
            {rule.notes && (
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">{t('notes')}</p>
                <p className="mt-1">{rule.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tiers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {rule.tiers && rule.tiers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('min_km')}</TableHead>
                    <TableHead>{t('max_km')}</TableHead>
                    <TableHead>{t('flat_fee')}</TableHead>
                    <TableHead>{t('per_km_rate')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rule.tiers.map((tier, index) => (
                    <TableRow key={tier.id || index}>
                      <TableCell>{tier.minKm} km</TableCell>
                      <TableCell>{tier.maxKm ? `${tier.maxKm} km` : t('no_max')}</TableCell>
                      <TableCell>
                        {tier.flatFee ? formatCurrency(tier.flatFee, rule.currencyCode) : '-'}
                      </TableCell>
                      <TableCell>
                        {tier.perKmRate
                          ? formatCurrency(tier.perKmRate, rule.currencyCode) + '/km'
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                {t('common:no_items', { defaultValue: 'No tiers configured' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activate Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('activate')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_activate')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel', { defaultValue: 'Cancel' })}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>{t('activate')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel', { defaultValue: 'Cancel' })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
