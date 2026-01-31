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

import { useState } from 'react';
import { capitalize, resourceMessage, validationAttribute } from '@/utils/lang';
import { useUserList } from '@/hooks/users';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { RoleBadge } from '@/components/users/RoleBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';

type Role = App.Enums.Role;

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useUserList({
    page,
    perPage: 15,
    role: role === 'all' ? undefined : role,
    search: search || undefined,
  });

  const users = data?.items || [];
  const meta = data?.meta;

  if (!ready) {
    return null;
  }

  const roleOptions = [
    { value: 'all', label: t('users:role.all', { defaultValue: 'All Roles' }) },
    { value: 'admin', label: t('users:role.admin', { defaultValue: 'Admin' }) },
    {
      value: 'business.owner',
      label: t('users:role.business_owner', { defaultValue: 'Business Owner' }),
    },
    {
      value: 'business.user',
      label: t('users:role.business_user', { defaultValue: 'Business User' }),
    },
    { value: 'client', label: t('users:role.client', { defaultValue: 'Client' }) },
    { value: 'driver', label: t('users:role.driver', { defaultValue: 'Driver' }) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {capitalize(t('models:user_other', { defaultValue: 'Users' }))}
          </h1>
          <p className="text-muted-foreground">
            {t('users:manage_description', { defaultValue: 'Manage user accounts' })}
          </p>
        </div>
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
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t('users:search_placeholder', { defaultValue: 'Search users...' })}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('users:filter_by_role', { defaultValue: 'Filter by role' })}
                />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-destructive py-12 text-center">
              {resourceMessage('failed_to_load', 'user', 2)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12" />
              <p>{t('users:no_users', { defaultValue: 'No users found' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {capitalize(t('models:user_one', { defaultValue: 'User' }))}
                  </TableHead>
                  <TableHead>{validationAttribute('email', true)}</TableHead>
                  <TableHead>{validationAttribute('role', true)}</TableHead>
                  <TableHead>{validationAttribute('phone', true)}</TableHead>
                  <TableHead>
                    {capitalize(t('common:created', { defaultValue: 'Created' }))}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/users/${user.publicId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role as Role} />
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                defaultValue: `Page ${meta.currentPage} of ${meta.lastPage} (${meta.total} users)`,
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
