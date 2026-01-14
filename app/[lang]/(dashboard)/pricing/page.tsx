'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usePricingRuleList, useActivatePricingRule, useDeletePricingRule } from '@/hooks/pricing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Power,
} from 'lucide-react';

type PricingRuleData = App.Data.Pricing.PricingRuleData;

function formatCurrency(amount?: number, currencyCode?: string): string {
  if (amount === undefined) return '-';
  return `${currencyCode || ''} ${amount.toFixed(2)}`.trim();
}

function formatPercent(rate?: number): string {
  if (rate === undefined) return '-';
  return `${(rate * 100).toFixed(1)}%`;
}

export default function PricingPage() {
  const { t, ready } = useTranslation('pricing');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRuleData | null>(null);

  const { data, isLoading, error } = usePricingRuleList({
    page,
    perPage: 15,
    currency: currency === 'all' ? undefined : currency,
  });

  const activateMutation = useActivatePricingRule();
  const deleteMutation = useDeletePricingRule();

  const rules = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  const handleActivate = () => {
    if (selectedRule?.id) {
      activateMutation.mutate(selectedRule.id);
    }
    setActivateDialogOpen(false);
    setSelectedRule(null);
  };

  const handleDelete = () => {
    if (selectedRule?.id) {
      deleteMutation.mutate(selectedRule.id);
    }
    setDeleteDialogOpen(false);
    setSelectedRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('manage_description')}</p>
        </div>
        <Button onClick={() => router.push('/pricing/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create_rule')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common:filters', { defaultValue: 'Filters' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={currency}
              onValueChange={(value) => {
                setCurrency(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filter_by_currency')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_currencies')}</SelectItem>
                <SelectItem value="CRC">CRC - Colon</SelectItem>
                <SelectItem value="USD">USD - Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">{t('failed_to_load')}</div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <DollarSign className="mb-4 h-12 w-12" />
              <p>{t('no_rules')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('column_name')}</TableHead>
                  <TableHead>{t('column_currency')}</TableHead>
                  <TableHead>{t('column_base_fare')}</TableHead>
                  <TableHead>{t('column_tax_rate')}</TableHead>
                  <TableHead>{t('column_version')}</TableHead>
                  <TableHead>{t('column_tiers')}</TableHead>
                  <TableHead>{t('column_status')}</TableHead>
                  <TableHead className="w-[50px]">{t('column_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow
                    key={rule.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/pricing/${rule.id}`)}
                  >
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.currencyCode}</TableCell>
                    <TableCell>{formatCurrency(rule.baseFare, rule.currencyCode)}</TableCell>
                    <TableCell>{formatPercent(rule.taxRate)}</TableCell>
                    <TableCell>v{rule.version}</TableCell>
                    <TableCell>{rule.tiers?.length || 0}</TableCell>
                    <TableCell>
                      {rule.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          {t('status_active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{t('status_inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/pricing/${rule.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/pricing/${rule.id}/duplicate`)}>
                            <Copy className="mr-2 h-4 w-4" />
                            {t('duplicate')}
                          </DropdownMenuItem>
                          {!rule.isActive && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRule(rule);
                                setActivateDialogOpen(true);
                              }}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {t('activate')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRule(rule);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t('pagination:page_info', {
                current: meta.currentPage,
                last: meta.lastPage,
                total: meta.total,
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} rules)`,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('pagination:previous', { defaultValue: 'Previous' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.lastPage}
              >
                {t('pagination:next', { defaultValue: 'Next' })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
