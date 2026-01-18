'use client';

import { capitalize, validationAttribute } from '@/utils/lang';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useUser, useDeleteUser } from '@/hooks/users';
import { RoleBadge } from '@/components/users/RoleBadge';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Phone, Calendar, Globe, Building2, Trash2 } from 'lucide-react';

type Role = App.Enums.Role;

function formatDate(dateString?: string | null): string {
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

export default function UserDetailPage() {
  const params = useParams();
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const userId = Number(params.id);

  const { data: user, isLoading, error } = useUser(userId);
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (
      confirm(
        t('users:detail.confirm_delete', {
          defaultValue: 'Are you sure you want to delete this user? This cannot be undone.',
        })
      )
    ) {
      deleteUser.mutate(userId, {
        onSuccess: () => router.push('/users'),
      });
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">
          {t('users:failed_to_load', { defaultValue: 'Failed to load user' })}
        </p>
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
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <RoleBadge role={user.role as Role} />
            </div>
            <p className="text-muted-foreground">
              {capitalize(t('models:user_one', { defaultValue: 'User' }))} #{user.id}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteUser.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common:delete', { defaultValue: 'Delete' })}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('users:detail.contact_info', { defaultValue: 'Contact Information' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {user.email || t('users:detail.not_provided', { defaultValue: 'Not provided' })}
                </p>
                <p className="text-muted-foreground text-sm">{validationAttribute('email')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {user.phone || t('users:detail.not_provided', { defaultValue: 'Not provided' })}
                </p>
                <p className="text-muted-foreground text-sm">{validationAttribute('phone')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">{user.langCode?.toUpperCase() || 'EN'}</p>
                <p className="text-muted-foreground text-sm">
                  {t('common:language_one', { defaultValue: 'Language' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('users:detail.account_details', { defaultValue: 'Account Details' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('users:detail.sex', { defaultValue: 'Sex' })}
              </span>
              <span className="font-medium">{user.sexName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('users:detail.date_of_birth', { defaultValue: 'Date of Birth' })}
              </span>
              <span className="font-medium">{formatDate(user.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('users:detail.email_verified', { defaultValue: 'Email Verified' })}
              </span>
              <Badge variant={user.emailVerifiedAt ? 'default' : 'secondary'}>
                {user.emailVerifiedAt
                  ? t('users:detail.verified', { defaultValue: 'Verified' })
                  : t('users:detail.not_verified', { defaultValue: 'Not Verified' })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Role Flags */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('users:detail.account_type', { defaultValue: 'Account Type' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.isAdmin && (
                <Badge variant="destructive">
                  {t('users:role.admin', { defaultValue: 'Admin' })}
                </Badge>
              )}
              {user.isDriver && <Badge>{t('users:role.driver', { defaultValue: 'Driver' })}</Badge>}
              {user.isClient && (
                <Badge variant="outline">
                  {t('users:role.client', { defaultValue: 'Client' })}
                </Badge>
              )}
              {user.isBusinessOwner && (
                <Badge>{t('users:role.business_owner', { defaultValue: 'Business Owner' })}</Badge>
              )}
              {user.isBusinessUser && (
                <Badge variant="secondary">
                  {t('users:role.business_user', { defaultValue: 'Business User' })}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business */}
        {user.business && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('models:business_one', { defaultValue: 'Business' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => router.push(`/businesses/${user.business?.id}`)}
              >
                {user.business.name}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {validationAttribute('timestamps', true)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:created', { defaultValue: 'Created' })}
              </span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common:updated', { defaultValue: 'Updated' })}
              </span>
              <span className="font-medium">{formatDate(user.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
