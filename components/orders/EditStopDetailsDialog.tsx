'use client';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateStop } from '@/hooks/orders';
import { actionLabel, validationAttribute } from '@/utils/lang';

type OrderStopData = App.Data.Order.OrderStopData;

const formSchema = z.object({
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditStopDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stop: OrderStopData;
  orderPublicId: string;
}

export function EditStopDetailsDialog({
  open,
  onOpenChange,
  stop,
  orderPublicId,
}: EditStopDetailsDialogProps) {
  const { t } = useTranslation();
  const updateStop = useUpdateStop();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: stop.contactName ?? '',
      contactPhone: stop.contactPhone ?? '',
      instructions: stop.instructions ?? '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!stop.id) return;

    try {
      await updateStop.mutateAsync({
        orderPublicId,
        stopId: stop.id,
        data: {
          contactName: values.contactName || null,
          contactPhone: values.contactPhone || null,
          instructions: values.instructions || null,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation hook
    }
  };

  const isPending = updateStop.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('orders:detail.edit_stop_details', { defaultValue: 'Edit Stop Details' })}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{validationAttribute('contactName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{validationAttribute('contactPhone')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{validationAttribute('instructions')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {actionLabel('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('common:saving', { defaultValue: 'Saving...' })
                  : actionLabel('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
