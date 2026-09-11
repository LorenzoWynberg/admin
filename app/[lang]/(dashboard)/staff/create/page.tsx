'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useCreateStaff } from '@/hooks/staff';
import { CatalogService } from '@/services/catalogService';
import { UploadService } from '@/services/uploadService';
import { applyApiErrorsToForm } from '@/utils/form';
import { actionLabel, validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';

const today = new Date();
const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

// Only `dispatch` and `admin` may be created here — the API's own
// `Role::staffRoles()` gate. There is no generated frontend equivalent of
// that method (only enum cases are TypeScript-transformed, not statics), so
// this names the two roles through the generated `Enums.Role` members rather
// than the raw strings 'dispatch'/'admin'. A third staff role added on the
// API still needs this array touched — see the hand-back for that gap.
const STAFF_ROLES = [Enums.Role.DISPATCH, Enums.Role.ADMIN] as const;

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().regex(/^\+[\d\s\-]{7,20}$/),
  dateOfBirth: z.string().refine(
    (val) => {
      const date = new Date(val);
      return date <= eighteenYearsAgo;
    },
    { message: 'Must be at least 18 years old' }
  ),
  avatar: z.string().optional(),
  sexId: z.number().min(1),
  langCode: z.string().min(1),
  role: z.enum(STAFF_ROLES),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateStaffPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const createMutation = useCreateStaff();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: sexOptions } = useQuery({
    queryKey: ['catalogs', 'sex', 'elements'],
    queryFn: () => CatalogService.getElementsByCode('sex'),
  });

  const { data: langOptions } = useQuery({
    queryKey: ['catalogs', 'language', 'elements'],
    queryFn: () => CatalogService.getElementsByCode('language'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      avatar: '',
      sexId: 0,
      langCode: '',
      role: Enums.Role.DISPATCH,
    },
  });

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const url = await UploadService.upload(file);
      form.setValue('avatar', url, { shouldValidate: true });
    } catch {
      form.setError('avatar', { message: 'Failed to upload image' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
        sexId: values.sexId,
        langCode: values.langCode,
        role: values.role as App.Enums.Role,
        ...(values.avatar ? { avatar: values.avatar } : {}),
      });
      router.push('/users');
    } catch (error) {
      applyApiErrorsToForm(error, form.setError, {
        name: 'name',
        email: 'email',
        phone: 'phone',
        dateOfBirth: 'dateOfBirth',
        sexId: 'sexId',
        langCode: 'langCode',
        role: 'role',
        avatar: 'avatar',
      });
    }
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {t('resource:create_one', {
            resource: t('common:staff', { defaultValue: 'Staff' }),
          })}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Staff Details — identity fields and the role select together;
              titled to cover both since role is an authorization decision,
              not a demographic field. */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('users:create_staff.details', { defaultValue: 'Staff Details' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('name', true)}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('email', true)}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('phone', true)}</FormLabel>
                      <FormControl>
                        <Input placeholder="+506 8888-8888" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('dateOfBirth', true)}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sexId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('sex', true)}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={actionLabel('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sexOptions?.items?.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('role', true)}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={actionLabel('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAFF_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {t(`users:role.${role}`, { defaultValue: role })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="langCode"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>{validationAttribute('langCode', true)}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={actionLabel('select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {langOptions?.items?.map((item) => (
                          <SelectItem key={item.code} value={item.code!}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>{validationAttribute('avatar', true)}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingAvatar}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                          }}
                        />
                        {uploadingAvatar && (
                          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                        )}
                        {form.watch('avatar') && (
                          <Upload className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {actionLabel('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || uploadingAvatar}>
              {createMutation.isPending
                ? t('common:saving', { defaultValue: 'Saving...' })
                : actionLabel('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
