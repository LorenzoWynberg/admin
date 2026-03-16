'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useCreateDriver } from '@/hooks/drivers';
import { CatalogService } from '@/services/catalogService';
import { UploadService } from '@/services/uploadService';
import { applyApiErrorsToForm } from '@/utils/form';
import { actionLabel, validationAttribute, capitalize, modelLabel } from '@/utils/lang';
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

const formSchema = z.object({
  user: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().regex(/^\+[\d\s\-]{7,20}$/),
    password: z.string().min(8),
    dateOfBirth: z.string().refine(
      (val) => {
        const date = new Date(val);
        return date <= eighteenYearsAgo;
      },
      { message: 'Must be at least 18 years old' }
    ),
    avatar: z.string().min(1),
    sexId: z.number().min(1),
    langCode: z.string().min(1),
  }),
  licenseNumber: z.string().regex(/^\d-?\d{4}-?\d{4}|\d{12}$/),
  licensePlateNumber: z.string().regex(/^[A-Z0-9]{3}-\d{3}$/),
  licenseExpirationDate: z
    .string()
    .refine((val) => new Date(val) > today, { message: 'Must be a future date' }),
  licensePhotoFront: z.string().min(1),
  licensePhotoBack: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateDriverPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const createMutation = useCreateDriver();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const { data: sexOptions } = useQuery({
    queryKey: ['catalogs', 'SEX', 'elements'],
    queryFn: () => CatalogService.getElementsByCode('SEX'),
  });

  const { data: langOptions } = useQuery({
    queryKey: ['catalogs', 'LANGUAGE', 'elements'],
    queryFn: () => CatalogService.getElementsByCode('LANGUAGE'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: {
        name: '',
        email: '',
        phone: '',
        password: '',
        dateOfBirth: '',
        avatar: '',
        sexId: 0,
        langCode: '',
      },
      licenseNumber: '',
      licensePlateNumber: '',
      licenseExpirationDate: '',
      licensePhotoFront: '',
      licensePhotoBack: '',
    },
  });

  const handleFileUpload = async (
    file: File,
    fieldName: 'user.avatar' | 'licensePhotoFront' | 'licensePhotoBack',
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const url = await UploadService.upload(file);
      form.setValue(fieldName, url, { shouldValidate: true });
    } catch {
      form.setError(fieldName, { message: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        user: {
          ...values.user,
          isDriver: true,
        },
        licenseNumber: values.licenseNumber,
        licensePlateNumber: values.licensePlateNumber,
        licenseExpirationDate: values.licenseExpirationDate,
        licensePhotoFront: values.licensePhotoFront,
        licensePhotoBack: values.licensePhotoBack,
      });
      router.push('/drivers');
    } catch (error) {
      applyApiErrorsToForm(error, form.setError, {
        'user.name': 'user.name',
        'user.email': 'user.email',
        'user.phone': 'user.phone',
        'user.password': 'user.password',
        'user.date_of_birth': 'user.dateOfBirth',
        'user.avatar': 'user.avatar',
        'user.sex_id': 'user.sexId',
        'user.lang_code': 'user.langCode',
        license_number: 'licenseNumber',
        license_plate_number: 'licensePlateNumber',
        license_expiration_date: 'licenseExpirationDate',
        license_photo_front: 'licensePhotoFront',
        license_photo_back: 'licensePhotoBack',
      });
    }
  };

  if (!ready) return null;

  const isUploading = uploadingAvatar || uploadingFront || uploadingBack;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {t('resource:create_one', { resource: capitalize(modelLabel('driver')) })}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('drivers:personal_info', { defaultValue: 'Personal Information' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user.name"
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
                  name="user.email"
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
                  name="user.phone"
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
                  name="user.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('password', true)}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user.dateOfBirth"
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

                <FormField
                  control={form.control}
                  name="user.sexId"
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
              </div>

              <FormField
                control={form.control}
                name="user.langCode"
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
                name="user.avatar"
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
                            if (file) handleFileUpload(file, 'user.avatar', setUploadingAvatar);
                          }}
                        />
                        {uploadingAvatar && (
                          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                        )}
                        {form.watch('user.avatar') && (
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

          {/* License Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('drivers:license_info', { defaultValue: 'License Information' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('licenseNumber', true)}</FormLabel>
                      <FormControl>
                        <Input placeholder="0-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licensePlateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('licensePlate', true)}</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="licenseExpirationDate"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>{validationAttribute('licenseExpires', true)}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="licensePhotoFront"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        {t('drivers:license_photo_front', {
                          defaultValue: 'License Photo (Front)',
                        })}
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingFront}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                handleFileUpload(file, 'licensePhotoFront', setUploadingFront);
                            }}
                          />
                          {uploadingFront && (
                            <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                          )}
                          {form.watch('licensePhotoFront') && (
                            <Upload className="text-muted-foreground h-5 w-5" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licensePhotoBack"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        {t('drivers:license_photo_back', { defaultValue: 'License Photo (Back)' })}
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingBack}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                handleFileUpload(file, 'licensePhotoBack', setUploadingBack);
                            }}
                          />
                          {uploadingBack && (
                            <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                          )}
                          {form.watch('licensePhotoBack') && (
                            <Upload className="text-muted-foreground h-5 w-5" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {actionLabel('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || isUploading}>
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
