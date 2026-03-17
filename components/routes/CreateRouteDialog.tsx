'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useDriverList } from '@/hooks/drivers/useDriverList';
import { useCreateRoute } from '@/hooks/routes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { actionLabel } from '@/utils/lang';

interface CreateRouteDialogProps {
  date: string;
}

interface FormValues {
  driverId: string;
  notes: string;
}

export function CreateRouteDialog({ date }: CreateRouteDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const createRoute = useCreateRoute();
  const { data: driversData } = useDriverList({ perPage: 100 });

  const drivers = driversData?.items ?? [];

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: { driverId: '', notes: '' },
  });

  const onSubmit = (values: FormValues) => {
    createRoute.mutate(
      {
        date,
        driverId: values.driverId ? Number(values.driverId) : null,
        notes: values.notes || null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          {t('routes:create_route', { defaultValue: 'New Route' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('routes:create_route', { defaultValue: 'New Route' })}</DialogTitle>
            <DialogDescription>{date}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>{t('routes:fields.driver', { defaultValue: 'Driver' })}</Label>
              <Select onValueChange={(v) => setValue('driverId', v)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('routes:fields.driver', { defaultValue: 'Driver' })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={String(driver.id)}>
                      {driver.user?.name ?? `Driver #${driver.publicId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('routes:fields.notes', { defaultValue: 'Notes' })}</Label>
              <Textarea {...register('notes')} rows={2} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {actionLabel('cancel')}
            </Button>
            <Button type="submit" disabled={createRoute.isPending}>
              {actionLabel('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
