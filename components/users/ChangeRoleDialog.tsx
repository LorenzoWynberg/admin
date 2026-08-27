'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUpdateUser } from '@/hooks/users';
import { actionLabel, capitalize } from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import { UserCog } from 'lucide-react';

type Role = App.Enums.Role;

/**
 * The only roles an admin may assign through the user-update endpoint.
 * Driver and business.* roles are structural requirements the API rejects
 * outright, so they're never offered here.
 */
export const ASSIGNABLE_ROLES: Role[] = [
  Enums.Role.CLIENT,
  Enums.Role.DISPATCH,
  Enums.Role.ADMIN,
] as Role[];

interface ChangeRoleDialogProps {
  userId: string;
  currentRole: Role;
}

/**
 * Admin-only dialog that promotes or demotes a user between the three
 * assignable roles (client, dispatch, admin). This is how dispatch agents
 * get created — by promoting an existing account. Mirrors the API's
 * restrictions: driver/business.* users and the caller's own account are
 * never editable here (callers gate rendering on that). Calls PATCH
 * /users/{user} through the existing update mutation.
 */
export function ChangeRoleDialog({ userId, currentRole }: ChangeRoleDialogProps) {
  const { t } = useTranslation('users');
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const updateUser = useUpdateUser();

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setSelectedRole(currentRole);
    }
    setOpen(val);
  };

  const handleSubmit = () => {
    updateUser.mutate(
      { id: userId, data: { role: selectedRole } },
      { onSuccess: () => handleOpenChange(false) }
    );
  };

  const roleLabel = (role: Role) => t(`role.${role}`, { defaultValue: capitalize(role) });

  const isDispatchDemotion =
    currentRole === Enums.Role.DISPATCH && selectedRole !== Enums.Role.DISPATCH;
  const isUnchanged = selectedRole === currentRole;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog className="mr-1 h-4 w-4" />
          {t('role_change.button', { defaultValue: 'Change Role' })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('role_change.title', { defaultValue: 'Change Role' })}</DialogTitle>
          <DialogDescription>
            {t('role_change.description', {
              defaultValue: "Update this user's role. This takes effect immediately.",
            })}
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedRole} onValueChange={(next) => setSelectedRole(next as Role)}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t('role_change.placeholder', { defaultValue: 'Select role' })}
            />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isDispatchDemotion && (
          <p className="text-muted-foreground text-sm">
            {t('role_change.dispatch_demote_warning', {
              defaultValue:
                'Their assigned orders and customers remain in their book until an admin reassigns them.',
            })}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button
            type="button"
            disabled={updateUser.isPending || isUnchanged}
            onClick={handleSubmit}
          >
            {updateUser.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : actionLabel('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
