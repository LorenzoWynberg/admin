'use client';

import {
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialog,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenu,
} from '@/components/ui/dropdown-menu';
import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from '@/components/ui/table';
import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Trash2,
  Pencil,
  Power,
  Copy,
  Plus,
} from 'lucide-react';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Enums } from '@/data/app-enums';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import {
  usePricingRuleList,
  useActivatePricingRule,
  useDeletePricingRule,
  useClonePricingRule,
} from '@/hooks/pricing';

type PricingRuleData = App.Data.Pricing.PricingRuleData;

function formatCurrency(amount?: number): string {
  if (amount === undefined) return '-';
  return amount.toFixed(2);
}

function formatPercent(rate?: number): string {
  if (rate === undefined) return '-';
  return `${(rate * 100).toFixed(1)}%`;
}

export default function PricingPage() {
  const { t, ready } = useTranslation('pricing');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRuleData | null>(null);

  const { data, isLoading, error } = usePricingRuleList({
    page,
    perPage: 15,
    status: statusFilter === 'all' ? undefined : (statusFilter as App.Enums.PricingRuleStatus),
  });

  const activateMutation = useActivatePricingRule();
  const deleteMutation = useDeletePricingRule();
  const cloneMutation = useClonePricingRule();

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
          <CardTitle className="text-lg">
            {t('common:filters', { defaultValue: 'Filters' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('common:filter_by_status', { defaultValue: 'Filter by status' })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('statuses:all', { defaultValue: 'All statuses' })}
                </SelectItem>
                <SelectItem value={Enums.PricingRuleStatus.DRAFT}>
                  {t('statuses:draft', { defaultValue: 'Draft' })}
                </SelectItem>
                <SelectItem value={Enums.PricingRuleStatus.ACTIVE}>
                  {t('statuses:active', { defaultValue: 'Active' })}
                </SelectItem>
                <SelectItem value={Enums.PricingRuleStatus.ARCHIVED}>
                  {t('statuses:archived', { defaultValue: 'Archived' })}
                </SelectItem>
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
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {resourceMessage('failed_to_load', 'pricing_rule', 2)}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <DollarSign className="mb-4 h-12 w-12" />
              <p>{t('no_rules')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{validationAttribute('name', true)}</TableHead>
                  <TableHead>{validationAttribute('serviceFee', true)}</TableHead>
                  <TableHead>{validationAttribute('taxRate', true)}</TableHead>
                  <TableHead>{validationAttribute('version', true)}</TableHead>
                  <TableHead>{validationAttribute('tiers', true)}</TableHead>
                  <TableHead>{validationAttribute('status', true)}</TableHead>
                  <TableHead className="w-[50px]">{t('common:actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow
                    key={rule.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/pricing/${rule.id}`)}
                  >
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{formatCurrency(rule.serviceFee)}</TableCell>
                    <TableCell>{formatPercent(rule.taxRate)}</TableCell>
                    <TableCell>v{rule.version}</TableCell>
                    <TableCell>{rule.tiers?.length || 0}</TableCell>
                    <TableCell>
                      {rule.status === Enums.PricingRuleStatus.ACTIVE ? (
                        <Badge variant="default" className="bg-green-600">
                          {t('statuses:active', { defaultValue: 'Active' })}
                        </Badge>
                      ) : rule.status === Enums.PricingRuleStatus.DRAFT ? (
                        <Badge variant="outline">
                          {t('statuses:draft', { defaultValue: 'Draft' })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('statuses:archived', { defaultValue: 'Archived' })}
                        </Badge>
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
                          {rule.status === Enums.PricingRuleStatus.DRAFT && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/pricing/${rule.id}/edit`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {capitalize(t('common:edit'))}
                            </DropdownMenuItem>
                          )}
                          {rule.status !== Enums.PricingRuleStatus.DRAFT && (
                            <DropdownMenuItem
                              onClick={() => cloneMutation.mutate({ id: rule.id! })}
                              disabled={cloneMutation.isPending}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {capitalize(t('common:clone'))}
                            </DropdownMenuItem>
                          )}
                          {rule.status === Enums.PricingRuleStatus.DRAFT && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRule(rule);
                                setActivateDialogOpen(true);
                              }}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {capitalize(t('common:activate'))}
                            </DropdownMenuItem>
                          )}
                          {rule.status === Enums.PricingRuleStatus.DRAFT && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedRule(rule);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {capitalize(t('common:delete'))}
                              </DropdownMenuItem>
                            </>
                          )}
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
            <p className="text-muted-foreground text-sm">
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
            <AlertDialogTitle>{t('common:activate')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_activate')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel', { defaultValue: 'Cancel' })}</AlertDialogCancel>
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
            <AlertDialogCancel>{t('common:cancel', { defaultValue: 'Cancel' })}</AlertDialogCancel>
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
