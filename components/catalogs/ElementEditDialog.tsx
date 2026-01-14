'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateCatalogElement } from '@/hooks/catalogs';
import { applyApiErrorsToForm } from '@/utils/form';

type CatalogElementData = App.Data.CatalogElement.CatalogElementData;
type PartialLangData = App.Data.Shared.PartialLangData;
type FullLangData = App.Data.Shared.FullLangData;

const emptyLang: FullLangData = { en: '', es: '', fr: '' };

interface ElementEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: CatalogElementData | null;
  catalogId: number;
  catalogCode: string;
}

interface FormValues {
  nameEn: string;
  nameEs: string;
  nameFr: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionFr: string;
  order: string;
}

export function ElementEditDialog({
  open,
  onOpenChange,
  element,
  catalogId,
  catalogCode,
}: ElementEditDialogProps) {
  const { t } = useTranslation();
  const updateElement = useUpdateCatalogElement();

  const form = useForm<FormValues>({
    defaultValues: {
      nameEn: '',
      nameEs: '',
      nameFr: '',
      descriptionEn: '',
      descriptionEs: '',
      descriptionFr: '',
      order: '',
    },
  });

  useEffect(() => {
    if (element && open) {
      const nameTranslations = element.nameTranslations || emptyLang;
      const descTranslations = element.descriptionTranslations || emptyLang;
      form.reset({
        nameEn: nameTranslations.en || '',
        nameEs: nameTranslations.es || '',
        nameFr: nameTranslations.fr || '',
        descriptionEn: descTranslations.en || '',
        descriptionEs: descTranslations.es || '',
        descriptionFr: descTranslations.fr || '',
        order: element.order?.toString() || '',
      });
    }
  }, [element, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!element?.id) return;

    const name: PartialLangData = {};
    if (values.nameEn) name.en = values.nameEn;
    if (values.nameEs) name.es = values.nameEs;
    if (values.nameFr) name.fr = values.nameFr;

    const description: PartialLangData = {};
    if (values.descriptionEn) description.en = values.descriptionEn;
    if (values.descriptionEs) description.es = values.descriptionEs;
    if (values.descriptionFr) description.fr = values.descriptionFr;

    try {
      await updateElement.mutateAsync({
        catalogId,
        catalogCode,
        elementId: element.id,
        data: {
          name: Object.keys(name).length > 0 ? name : undefined,
          description: Object.keys(description).length > 0 ? description : undefined,
          order: values.order ? parseInt(values.order, 10) : null,
        },
      });
      onOpenChange(false);
    } catch (err) {
      applyApiErrorsToForm(err, form.setError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('catalogs:edit_element', { defaultValue: 'Edit Element' })}
            {element?.code && ` - ${element.code}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('common:name', { defaultValue: 'Name' })}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:en', { defaultValue: 'English' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:es', { defaultValue: 'Spanish' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:fr', { defaultValue: 'French' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('common:description', { defaultValue: 'Description' })}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:en', { defaultValue: 'English' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionEs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:es', { defaultValue: 'Spanish' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languages:fr', { defaultValue: 'French' })}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem className="max-w-32">
                  <FormLabel>{t('catalogs:detail.order', { defaultValue: 'Order' })}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common:cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button type="submit" disabled={updateElement.isPending}>
                {updateElement.isPending
                  ? t('common:saving', { defaultValue: 'Saving...' })
                  : t('common:save', { defaultValue: 'Save' })}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
