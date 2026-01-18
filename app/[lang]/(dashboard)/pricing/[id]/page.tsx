'use client';

import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import {
  usePricingRule,
  useActivatePricingRule,
  useDeletePricingRule,
  useClonePricingRule,
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
import { ArrowLeft, Pencil, Trash2, Copy, Power, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Enums } from '@/data/app-enums';
import { resourceMessage, validationAttribute } from '@/utils/lang';

function formatCurrency(amount?: number): string {
  if (amount === undefined) return '-';
  return amount.toFixed(2);
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
  const deleteMutation = useDeletePricingRule();
  const cloneMutation = useClonePricingRule();

  const handleActivate = () => {
    activateMutation.mutate(ruleId);
    setActivateDialogOpen(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(ruleId, {
      onSuccess: () => router.push('/pricing'),
    });
    setDeleteDialogOpen(false);
  };

  const handleClone = () => {
    cloneMutation.mutate(
      { id: ruleId },
      {
        onSuccess: (newRule) => {
          router.replace(`/pricing/${newRule.id}`);
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
        <p className="text-destructive">{resourceMessage('failed_to_load', 'pricing_rule')}</p>
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
              <span>v{rule.version}</span>
              {rule.status === Enums.PricingRuleStatus.ACTIVE ? (
                <Badge variant="default" className="bg-green-600">
                  {t('statuses:active', { defaultValue: 'Active' })}
                </Badge>
              ) : rule.status === Enums.PricingRuleStatus.DRAFT ? (
                <Badge variant="outline">{t('statuses:draft', { defaultValue: 'Draft' })}</Badge>
              ) : (
                <Badge variant="secondary">
                  {t('statuses:archived', { defaultValue: 'Archived' })}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {rule.status !== Enums.PricingRuleStatus.DRAFT && (
            <Button variant="outline" onClick={handleClone} disabled={cloneMutation.isPending}>
              <Copy className="mr-2 h-4 w-4" />
              {t('common:clone')}
            </Button>
          )}
          {rule.status === Enums.PricingRuleStatus.DRAFT && (
            <>
              <Button
                variant="outline"
                onClick={() => setActivateDialogOpen(true)}
                disabled={activateMutation.isPending}
              >
                <Power className="mr-2 h-4 w-4" />
                {t('common:activate')}
              </Button>
              <Button onClick={() => router.push(`/pricing/${ruleId}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('common:edit')}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common:delete')}
              </Button>
            </>
          )}
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
              <span className="text-muted-foreground">
                {validationAttribute('serviceFee', true)}
              </span>
              <span className="font-medium">{formatCurrency(rule.serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{validationAttribute('taxRate', true)}</span>
              <span className="font-medium">{formatPercent(rule.taxRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{validationAttribute('version', true)}</span>
              <span className="font-medium">v{rule.version}</span>
            </div>
            {rule.effectiveFrom && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('effective_from')}</span>
                <span className="font-medium">{formatDate(rule.effectiveFrom)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {validationAttribute('createdAt', true)}
              </span>
              <span className="font-medium">{formatDate(rule.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {validationAttribute('updatedAt', true)}
              </span>
              <span className="font-medium">{formatDate(rule.updatedAt)}</span>
            </div>
            {rule.notes && (
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('notes', true)}
                </p>
                <p className="mt-1">{rule.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>{validationAttribute('tiers', true)}</CardTitle>
          </CardHeader>
          <CardContent>
            {rule.tiers && rule.tiers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{validationAttribute('minKm', true)}</TableHead>
                    <TableHead>{validationAttribute('maxKm', true)}</TableHead>
                    <TableHead>{validationAttribute('flatFee', true)}</TableHead>
                    <TableHead>{validationAttribute('perKmRate', true)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rule.tiers.map((tier, index) => (
                    <TableRow key={tier.id || index}>
                      <TableCell>{tier.minKm} km</TableCell>
                      <TableCell>{tier.maxKm ? `${tier.maxKm} km` : t('no_max')}</TableCell>
                      <TableCell>{tier.flatFee ? formatCurrency(tier.flatFee) : '-'}</TableCell>
                      <TableCell>
                        {tier.perKmRate ? formatCurrency(tier.perKmRate) + '/km' : '-'}
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
            <AlertDialogTitle>{t('common:activate')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_activate')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>{t('common:activate')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common:delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t('common:delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
