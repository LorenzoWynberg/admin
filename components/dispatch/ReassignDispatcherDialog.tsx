'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDispatchUsers } from '@/hooks/users';
import { useChangeDispatcher } from '@/hooks/orders';
import { actionLabel } from '@/utils/lang';
import { Headset } from 'lucide-react';

const UNASSIGNED_VALUE = 'none';

interface ReassignDispatcherDialogOrder {
  publicId: string;
  dispatcherId?: number | null;
}

interface ReassignDispatcherDialogProps {
  order: ReassignDispatcherDialogOrder;
}

/**
 * Admin-only dialog that reassigns an order to a different dispatcher's book,
 * or clears it back to unassigned. Calls PATCH /orders/{order}/dispatcher.
 */
export function ReassignDispatcherDialog({ order }: ReassignDispatcherDialogProps) {
  const { t } = useTranslation('orders');
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(UNASSIGNED_VALUE);

  const { data: dispatchersData } = useDispatchUsers({ enabled: open });
  const dispatchers = dispatchersData?.items ?? [];
  const changeDispatcher = useChangeDispatcher();

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setSelectedValue(order.dispatcherId != null ? String(order.dispatcherId) : UNASSIGNED_VALUE);
    }
    setOpen(val);
  };

  const handleSubmit = () => {
    const dispatcherId = selectedValue === UNASSIGNED_VALUE ? null : Number(selectedValue);
    changeDispatcher.mutate(
      { orderPublicId: order.publicId, dispatcherId },
      { onSuccess: () => handleOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Headset className="mr-1 h-4 w-4" />
          {t('reassign_dispatcher.button', { defaultValue: 'Reassign Dispatcher' })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('reassign_dispatcher.title', { defaultValue: 'Reassign Dispatcher' })}
          </DialogTitle>
          <DialogDescription>
            {t('reassign_dispatcher.description', {
              defaultValue: 'Move this order to a different dispatcher, or unassign it.',
            })}
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t('reassign_dispatcher.placeholder', {
                defaultValue: 'Select dispatcher',
              })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_VALUE}>
              {t('common:none', { defaultValue: 'None' })}
            </SelectItem>
            {dispatchers.map((dispatcher) => (
              <SelectItem key={dispatcher.id} value={String(dispatcher.id)}>
                {dispatcher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button type="button" disabled={changeDispatcher.isPending} onClick={handleSubmit}>
            {changeDispatcher.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : actionLabel('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
