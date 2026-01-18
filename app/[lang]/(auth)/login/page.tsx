'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/api/error';
import { useLoginMutation } from '@/hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const loginMutation = useLoginMutation();

  const loginSchema = z.object({
    email: z
      .string()
      .email(t('auth:invalid_email', { defaultValue: 'Please enter a valid email address' })),
    password: z
      .string()
      .min(1, t('auth:password_required', { defaultValue: 'Password is required' })),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (!ready) {
    return null;
  }

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('auth:welcome_back', { defaultValue: 'Welcome back!' }));
        router.push(callbackUrl);
        router.refresh();
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.errors) {
            Object.entries(error.errors).forEach(([field, messages]) => {
              const formField = field as keyof LoginFormData;
              if (formField === 'email' || formField === 'password') {
                setError(formField, {
                  type: 'server',
                  message: Array.isArray(messages) ? messages[0] : messages,
                });
              }
            });
          }
          toast.error(error.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(
            t('common:unexpected_error', { defaultValue: 'An unexpected error occurred' })
          );
        }
      },
    });
  };

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t('common:app_name', { defaultValue: 'Mandados Admin' })}
          </CardTitle>
          <CardDescription>
            {t('auth:login_description', {
              defaultValue: 'Enter your credentials to access the admin dashboard',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common:email', { defaultValue: 'Email' })}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loginMutation.isPending}
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('common:password', { defaultValue: 'Password' })}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth:enter_password', { defaultValue: 'Enter your password' })}
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending
                ? t('auth:signing_in', { defaultValue: 'Signing in...' })
                : t('auth:sign_in', { defaultValue: 'Sign in' })}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
