'use client';

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

import { useState, useCallback, Fragment } from 'react';
import { actionLabel, capitalize, modelLabel } from '@/utils/lang';
import { formatDateTime } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuditLogList } from '@/hooks/audit-logs';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, ScrollText, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

type AuditLogData = App.Data.AuditLog.AuditLogData;

const MODEL_KEY_OPTIONS = ['all', 'order', 'payment', 'refund', 'pricing_rule', 'setting'] as const;

const ACTION_OPTIONS = ['all', 'created', 'updated', 'deleted'] as const;

function actionVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (action) {
    case 'created':
      return 'default';
    case 'updated':
      return 'secondary';
    case 'deleted':
      return 'destructive';
    default:
      return 'outline';
  }
}

function summarizeChanges(log: AuditLogData): string {
  if (!log.data || typeof log.data !== 'object') return '-';
  const keys = Object.keys(log.data).filter((k) => k !== 'id' && k !== 'updated_at');
  if (keys.length === 0) return '-';
  if (keys.length <= 3) return keys.join(', ');
  return `${keys.slice(0, 3).join(', ')} +${keys.length - 3}`;
}

function shortModelType(fullType: string): string {
  const parts = fullType.split('\\');
  return parts[parts.length - 1] || fullType;
}

export default function AuditLogsPage() {
  const { t, ready } = useTranslation();
  const [page, setPage] = useState(1);
  const [modelKey, setModelKey] = useState<string>('all');
  const [action, setAction] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const resetPage = useCallback(() => setPage(1), []);

  const { data, isLoading, error } = useAuditLogList({
    page,
    perPage: 25,
    modelKey: modelKey === 'all' ? undefined : modelKey,
    action: action === 'all' ? undefined : action,
    search: search || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const logs = data?.items || [];
  const meta = data?.meta;

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{capitalize(modelLabel('audit_log', 2))}</h1>
        <p className="text-muted-foreground">
          {t('audit_logs:description', {
            defaultValue: 'Track all changes to orders, payments, settings, and more',
          })}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('common:filters', { defaultValue: 'Filters' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('audit_logs:search_placeholder', {
                  defaultValue: 'Search by user name...',
                })}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={modelKey}
              onValueChange={(value) => {
                setModelKey(value);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('audit_logs:filter_model', { defaultValue: 'Model type' })}
                />
              </SelectTrigger>
              <SelectContent>
                {MODEL_KEY_OPTIONS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key === 'all'
                      ? t('statuses:all', { defaultValue: 'All' })
                      : capitalize(modelLabel(key))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={action}
              onValueChange={(value) => {
                setAction(value);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue
                  placeholder={t('audit_logs:filter_action', { defaultValue: 'Action' })}
                />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a === 'all' ? t('statuses:all', { defaultValue: 'All' }) : actionLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="grid gap-1">
              <Label className="text-muted-foreground text-xs">
                {t('common:date_range', { defaultValue: 'Date Range' })}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    resetPage();
                  }}
                  className="w-[150px]"
                />
                {(fromDate || toDate) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                      resetPage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {t('audit_logs:error_loading', { defaultValue: 'Failed to load audit logs' })}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <ScrollText className="mb-4 h-12 w-12" />
              <p>{t('audit_logs:no_logs', { defaultValue: 'No audit logs found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common:date', { defaultValue: 'Date' })}</TableHead>
                  <TableHead>{capitalize(modelLabel('user'))}</TableHead>
                  <TableHead>{t('common:action', { defaultValue: 'Action' })}</TableHead>
                  <TableHead>{t('common:model', { defaultValue: 'Model' })}</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('common:changes', { defaultValue: 'Changes' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <TableRow
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>{log.userName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={actionVariant(log.action)}>{actionLabel(log.action)}</Badge>
                      </TableCell>
                      <TableCell>{shortModelType(log.modelType)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.modelId ?? '-'}</TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm">
                        {summarizeChanges(log)}
                      </TableCell>
                    </TableRow>
                    {expandedId === log.id && (
                      <TableRow key={`${log.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-sm font-semibold">
                                {t('audit_logs:data', { defaultValue: 'Data' })}
                              </p>
                              <pre className="bg-background max-h-64 overflow-auto rounded-md border p-3 text-xs">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                            {log.previousData && (
                              <div>
                                <p className="mb-1 text-sm font-semibold">
                                  {t('audit_logs:previous_data', {
                                    defaultValue: 'Previous Data',
                                  })}
                                </p>
                                <pre className="bg-background max-h-64 overflow-auto rounded-md border p-3 text-xs">
                                  {JSON.stringify(log.previousData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          {log.ipAddress && (
                            <p className="text-muted-foreground mt-2 text-xs">
                              IP: {log.ipAddress}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} entries)`,
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
    </div>
  );
}
