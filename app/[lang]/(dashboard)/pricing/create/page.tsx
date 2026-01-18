'use client';

import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useCreatePricingRule } from '@/hooks/pricing';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { applyApiErrorsToForm } from '@/utils/form';
import { validationAttribute } from '@/utils/lang';
import { Enums } from '@/data/app-enums';

const tierSchema = z.object({
  minKm: z.number().min(0),
  maxKm: z.number().min(0).nullable(),
  flatFee: z.number().min(0).nullable(),
  perKmRate: z.number().min(0).nullable(),
  order: z.number().min(0),
});

const formSchema = z.object({
  name: z.string().min(1).max(255),
  serviceFee: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  calculationMode: z.enum([
    Enums.PricingCalculationMode.DISCRETE,
    Enums.PricingCalculationMode.CUMULATIVE,
  ]),
  notes: z.string().nullable(),
  activate: z.boolean(),
  tiers: z.array(tierSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePricingRulePage() {
  const { t, ready } = useTranslation('pricing');
  const router = useLocalizedRouter();
  const createMutation = useCreatePricingRule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      serviceFee: 0,
      taxRate: 0,
      calculationMode: Enums.PricingCalculationMode.DISCRETE,
      notes: null,
      activate: false,
      tiers: [{ minKm: 0, maxKm: null, flatFee: null, perKmRate: null, order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tiers',
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        serviceFee: values.serviceFee,
        taxRate: values.taxRate,
        calculationMode: values.calculationMode as App.Enums.PricingCalculationMode,
        notes: values.notes,
        activate: values.activate,
        tiers: values.tiers.map((tier, index) => ({
          minKm: tier.minKm,
          maxKm: tier.maxKm,
          flatFee: tier.flatFee,
          perKmRate: tier.perKmRate,
          order: tier.order || index,
        })),
      });
      router.push('/pricing');
    } catch (error) {
      applyApiErrorsToForm(error, form.setError, {
        service_fee: 'serviceFee',
        tax_rate: 'taxRate',
        calculation_mode: 'calculationMode',
      });
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('create_title')}</h1>
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
                    <FormLabel>{validationAttribute('name', true)}</FormLabel>
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
                  name="serviceFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('serviceFee', true)}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>{t('service_fee_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{validationAttribute('taxRate', true)} (%)</FormLabel>
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
                name="calculationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('calculation_mode', { defaultValue: 'Calculation Mode' })}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Enums.PricingCalculationMode.DISCRETE}>
                          {t('calculation_mode_discrete', { defaultValue: 'Discrete' })}
                        </SelectItem>
                        <SelectItem value={Enums.PricingCalculationMode.CUMULATIVE}>
                          {t('calculation_mode_cumulative', { defaultValue: 'Cumulative' })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('calculation_mode_help', {
                        defaultValue:
                          'Discrete: one tier applies. Cumulative: fees stack through tiers.',
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{validationAttribute('notes', true)}</FormLabel>
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

              <FormField
                control={form.control}
                name="activate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('activate_on_create')}</FormLabel>
                      <FormDescription>{t('activate_on_create_help')}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tiers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{validationAttribute('tiers', true)}</CardTitle>
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
                        <FormLabel>{validationAttribute('minKm', true)}</FormLabel>
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
                        <FormLabel>{validationAttribute('maxKm', true)}</FormLabel>
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
                        <FormLabel>{validationAttribute('flatFee', true)}</FormLabel>
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
                        <FormLabel>{validationAttribute('perKmRate', true)}</FormLabel>
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
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('common:cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? t('common:saving', { defaultValue: 'Saving...' })
                : t('common:save', { defaultValue: 'Save' })}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
