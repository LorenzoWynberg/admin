'use client';

import { useState } from 'react';
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
import { useCreateCatalogElement } from '@/hooks/catalogs';
import { applyApiErrorsToForm } from '@/utils/form';
import { actionLabel, validationAttribute } from '@/utils/lang';

type FullLangData = App.Data.Shared.FullLangData;

const LANGUAGES = ['en', 'es', 'fr'] as const;
type Language = (typeof LANGUAGES)[number];

const emptyLang: FullLangData = { en: '', es: '', fr: '' };

interface ElementCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogId: number;
  catalogCode: string;
}

interface FormValues {
  code: string;
  name: FullLangData;
  description: FullLangData;
  order: string;
}

export function ElementCreateDialog({
  open,
  onOpenChange,
  catalogId,
  catalogCode,
}: ElementCreateDialogProps) {
  const { t, i18n } = useTranslation();
  const createElement = useCreateCatalogElement();
  const [selectedLang, setSelectedLang] = useState<Language>((i18n.language as Language) || 'en');

  const form = useForm<FormValues>({
    defaultValues: {
      code: '',
      name: { ...emptyLang },
      description: { ...emptyLang },
      order: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const description: FullLangData = { en: '', es: '', fr: '' };
    const hasDescription = values.description.en || values.description.es || values.description.fr;
    if (hasDescription) {
      description.en = values.description.en;
      description.es = values.description.es;
      description.fr = values.description.fr;
    }

    try {
      await createElement.mutateAsync({
        catalogId,
        catalogCode,
        data: {
          code: values.code,
          name: values.name,
          ...(hasDescription ? { description } : {}),
          order: values.order ? parseInt(values.order, 10) : null,
        },
      });
      form.reset();
      onOpenChange(false);
    } catch (err) {
      applyApiErrorsToForm(err, form.setError);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset();
    }
    onOpenChange(value);
  };

  const languageLabels: Record<Language, string> = {
    en: t('languages:en', { defaultValue: 'English' }),
    es: t('languages:es', { defaultValue: 'Spanish' }),
    fr: t('languages:fr', { defaultValue: 'French' }),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('catalogs:create_element', { defaultValue: 'Add Element' })}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              rules={{ required: true, minLength: 2, maxLength: 255 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{validationAttribute('code', true)}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={validationAttribute('code', true)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {t('common:language', { count: 1, defaultValue: 'Language' })}:
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
                  <FormLabel>{validationAttribute('name', true)}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`${validationAttribute('name', true)} (${languageLabels[selectedLang]})`}
                    />
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {actionLabel('cancel')}
              </Button>
              <Button type="submit" disabled={createElement.isPending}>
                {createElement.isPending
                  ? t('common:saving', { defaultValue: 'Saving...' })
                  : actionLabel('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
