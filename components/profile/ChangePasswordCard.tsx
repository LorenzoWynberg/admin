'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { KeyRound } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { applyApiErrorsToForm } from '@/utils/form';
import { validationMessage } from '@/utils/lang';
import { useUpdatePasswordMutation } from '@/hooks/auth';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, validationMessage('required', 'currentPassword')),
    password: z
      .string()
      .min(8, validationMessage('min.string', 'password', { min: 8 }))
      .regex(/[a-zA-Z]/, validationMessage('password.letters', 'password'))
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, validationMessage('password.mixed', 'password'))
      .regex(/\d/, validationMessage('password.numbers', 'password'))
      .regex(/[^A-Za-z0-9]/, validationMessage('password.symbols', 'password')),
    passwordConfirmation: z.string().min(1, validationMessage('required', 'passwordConfirmation')),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: validationMessage('confirmed', 'password'),
    path: ['passwordConfirmation'],
  });

type FormValues = z.infer<typeof passwordSchema>;

/**
 * Self-service password change card for the profile page. Submits to the
 * authenticated `PATCH /auth/password` endpoint, which enforces the current
 * password check, confirmation match, and complexity rules server-side —
 * the client schema mirrors those rules so most mistakes are caught before
 * the request goes out, while server errors (e.g. wrong current password)
 * still map back onto the matching field.
 */
export function ChangePasswordCard() {
  const { t } = useTranslation();
  const updatePassword = useUpdatePasswordMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    updatePassword.mutate(values, {
      onSuccess: () => {
        toast.success(
          t('auth:update_password.success', {
            defaultValue: 'Your password has been updated.',
          })
        );
        form.reset();
      },
      onError: (error) => {
        applyApiErrorsToForm(error, form.setError);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {t('auth:update_password.title', { defaultValue: 'Change Password' })}
        </CardTitle>
        <CardDescription>
          {t('auth:update_password.subtitle', {
            defaultValue: 'Enter your current password and choose a new one.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth:update_password.current_password', {
                      defaultValue: 'Current password',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      disabled={updatePassword.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth:update_password.new_password', { defaultValue: 'New password' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      disabled={updatePassword.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth:update_password.confirm_password', {
                      defaultValue: 'Confirm new password',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      disabled={updatePassword.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updatePassword.isPending}>
                {updatePassword.isPending
                  ? t('common:loading', { defaultValue: 'Loading...' })
                  : t('auth:update_password.button', { defaultValue: 'Update Password' })}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
