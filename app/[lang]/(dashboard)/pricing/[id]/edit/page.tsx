'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { usePricingRule, useUpdatePricingRule } from '@/hooks/pricing';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { applyApiErrorsToForm } from '@/utils/form';

const tierSchema = z.object({
  minKm: z.number().min(0),
  maxKm: z.number().min(0).nullable(),
  flatFee: z.number().min(0).nullable(),
  perKmRate: z.number().min(0).nullable(),
  order: z.number().min(0),
});

const formSchema = z.object({
  name: z.string().min(1).max(255),
  baseFare: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  notes: z.string().nullable(),
  tiers: z.array(tierSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPricingRulePage() {
  const params = useParams();
  const { t, ready } = useTranslation('pricing');
  const router = useLocalizedRouter();
  const ruleId = Number(params.id);

  const { data: rule, isLoading, error } = usePricingRule({ id: ruleId });
  const updateMutation = useUpdatePricingRule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      baseFare: 0,
      taxRate: 0,
      notes: null,
      tiers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tiers',
  });

  // Populate form when rule data is loaded
  useEffect(() => {
    if (rule) {
      form.reset({
        name: rule.name || '',
        baseFare: rule.baseFare || 0,
        taxRate: rule.taxRate || 0,
        notes: rule.notes || null,
        tiers:
          rule.tiers?.map((tier, index) => ({
            minKm: tier.minKm || 0,
            maxKm: tier.maxKm ?? null,
            flatFee: tier.flatFee ?? null,
            perKmRate: tier.perKmRate ?? null,
            order: tier.order || index,
          })) || [],
      });
    }
  }, [rule, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: ruleId,
        data: {
          name: values.name,
          baseFare: values.baseFare,
          taxRate: values.taxRate,
          notes: values.notes,
          tiers: values.tiers.map((tier, index) => ({
            minKm: tier.minKm,
            maxKm: tier.maxKm,
            flatFee: tier.flatFee,
            perKmRate: tier.perKmRate,
            order: tier.order || index,
          })),
        },
      });
      router.push(`/pricing/${ruleId}`);
    } catch (error) {
      applyApiErrorsToForm(error, form.setError, {
        base_fare: 'baseFare',
        tax_rate: 'taxRate',
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

  if (error || !rule) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{t('failed_to_load')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common:go_back', { defaultValue: 'Go Back' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('edit_title')}</h1>
          <p className="text-muted-foreground">
            {rule.name} - {rule.currencyCode}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common:basic_info', { defaultValue: 'Basic Information' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="baseFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('base_fare')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>{t('base_fare_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tax_rate')} (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) / 100)}
                          value={field.value * 100}
                        />
                      </FormControl>
                      <FormDescription>{t('tax_rate_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('notes_placeholder')}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tiers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('tiers')}</CardTitle>
                <p className="text-muted-foreground text-sm">{t('tiers_help')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    minKm: 0,
                    maxKm: null,
                    flatFee: null,
                    perKmRate: null,
                    order: fields.length,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('add_tier')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4 rounded-lg border p-4">
                  <FormField
                    control={form.control}
                    name={`tiers.${index}.minKm`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('min_km')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tiers.${index}.maxKm`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('max_km')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder={t('no_max')}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tiers.${index}.flatFee`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('flat_fee')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tiers.${index}.perKmRate`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('per_km_rate')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {fields.length === 0 && (
                <p className="text-muted-foreground py-4 text-center">
                  {t('common:no_items', { defaultValue: 'No tiers. Click "Add Tier" to add one.' })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('common:cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? t('common:saving', { defaultValue: 'Saving...' })
                : t('common:save', { defaultValue: 'Save' })}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
