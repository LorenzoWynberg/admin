'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateCatalogElement } from '@/hooks/catalogs';
import { applyApiErrorsToForm } from '@/utils/form';

type CatalogElementData = App.Data.CatalogElement.CatalogElementData;
type PartialLangData = App.Data.Shared.PartialLangData;
type FullLangData = App.Data.Shared.FullLangData;

const LANGUAGES = ['en', 'es', 'fr'] as const;
type Language = (typeof LANGUAGES)[number];

const emptyLang: FullLangData = { en: '', es: '', fr: '' };

interface ElementEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: CatalogElementData | null;
  catalogId: number;
  catalogCode: string;
}

interface FormValues {
  name: FullLangData;
  description: FullLangData;
  order: string;
}

export function ElementEditDialog({
  open,
  onOpenChange,
  element,
  catalogId,
  catalogCode,
}: ElementEditDialogProps) {
  const { t, i18n } = useTranslation();
  const updateElement = useUpdateCatalogElement();
  const [selectedLang, setSelectedLang] = useState<Language>((i18n.language as Language) || 'en');

  const form = useForm<FormValues>({
    defaultValues: {
      name: { ...emptyLang },
      description: { ...emptyLang },
      order: '',
    },
  });

  useEffect(() => {
    if (element && open) {
      const nameTranslations = element.nameTranslations || emptyLang;
      const descTranslations = element.descriptionTranslations || emptyLang;
      form.reset({
        name: {
          en: nameTranslations.en || '',
          es: nameTranslations.es || '',
          fr: nameTranslations.fr || '',
        },
        description: {
          en: descTranslations.en || '',
          es: descTranslations.es || '',
          fr: descTranslations.fr || '',
        },
        order: element.order?.toString() || '',
      });
      // Reset to current language when opening
      setSelectedLang((i18n.language as Language) || 'en');
    }
  }, [element, open, form, i18n.language]);

  const onSubmit = async (values: FormValues) => {
    if (!element?.id) return;

    const name: PartialLangData = {};
    if (values.name.en) name.en = values.name.en;
    if (values.name.es) name.es = values.name.es;
    if (values.name.fr) name.fr = values.name.fr;

    const description: PartialLangData = {};
    if (values.description.en) description.en = values.description.en;
    if (values.description.es) description.es = values.description.es;
    if (values.description.fr) description.fr = values.description.fr;

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

  const languageLabels: Record<Language, string> = {
    en: t('languages:en', { defaultValue: 'English' }),
    es: t('languages:es', { defaultValue: 'Spanish' }),
    fr: t('languages:fr', { defaultValue: 'French' }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('catalogs:edit_element', { defaultValue: 'Edit Element' })}
            {element?.code && ` - ${element.code}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('common:language', { defaultValue: 'Language' })}:
              </span>
              <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as Language)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {languageLabels[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name={`name.${selectedLang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common:name', { defaultValue: 'Name' })}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`${t('common:name', { defaultValue: 'Name' })} (${languageLabels[selectedLang]})`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`description.${selectedLang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common:description', { defaultValue: 'Description' })}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`${t('common:description', { defaultValue: 'Description' })} (${languageLabels[selectedLang]})`}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
