'use client';

import { useTranslation } from 'react-i18next';
import { Mail, Phone, User } from 'lucide-react';

import { useAuth } from '@/stores/useAuthStore';
import { RoleBadge } from '@/components/users/RoleBadge';
import { ChangePasswordCard } from '@/components/profile/ChangePasswordCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInitials, validationAttribute } from '@/utils/lang';

type Role = App.Enums.Role;

/**
 * Every authenticated panel role (admin, dispatch) lands here — unlike
 * `/settings`, this page has no `RequireAdmin` gate, since it only ever
 * shows and edits the caller's own account.
 */
export default function ProfilePage() {
  const { t, ready } = useTranslation();
  const { user, hydrated } = useAuth();

  if (!ready || !hydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {t('common:my_profile', { defaultValue: 'My profile' })}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('users:detail.contact_info', { defaultValue: 'Contact Information' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{user.name}</p>
                <RoleBadge role={user.role as Role} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">
                  {user.email || t('users:detail.not_provided', { defaultValue: 'Not provided' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {validationAttribute('email', true)}
                </p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">{user.phone}</p>
                  <p className="text-muted-foreground text-sm">
                    {validationAttribute('phone', true)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ChangePasswordCard />
      </div>
    </div>
  );
}
