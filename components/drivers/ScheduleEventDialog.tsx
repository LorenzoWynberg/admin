'use client';

import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { actionLabel } from '@/utils/lang';

type ScheduleEntry = App.Data.Driver.DriverScheduleData;

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  date: string;
  startTime?: string;
  endTime?: string;
  isSaving?: boolean;
  onSave: (entry: ScheduleEntry) => void;
  onDelete?: () => void;
}

export function ScheduleEventDialog({
  open,
  onOpenChange,
  mode,
  date,
  startTime: initialStartTime,
  endTime: initialEndTime,
  isSaving,
  onSave,
  onDelete,
}: ScheduleEventDialogProps) {
  const { t } = useTranslation();
  const resetKey = `${date}-${initialStartTime}-${initialEndTime}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [startTime, setStartTime] = useState(initialStartTime ?? '08:00');
  const [endTime, setEndTime] = useState(initialEndTime ?? '17:00');

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setStartTime(initialStartTime ?? '08:00');
    setEndTime(initialEndTime ?? '17:00');
  }

  const isTimeValid = startTime < endTime;

  const handleSave = () => {
    if (!isTimeValid) return;

    const entry: ScheduleEntry = {
      date,
      startTime,
      endTime,
    };

    onSave(entry);
    onOpenChange(false);
  };

  const title =
    mode === 'create'
      ? t('drivers:schedule.create_availability', {
          defaultValue: 'Set Availability',
        })
      : t('drivers:schedule.edit_availability', {
          defaultValue: 'Edit Availability',
        });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium">
              {t('common:date', { defaultValue: 'Date' })}
            </Label>
            <p className="text-muted-foreground mt-1 text-sm">{date}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-sm">{t('common:start', { defaultValue: 'Start' })}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">{t('common:end', { defaultValue: 'End' })}</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {!isTimeValid && (
              <p className="text-destructive text-xs">
                {t('validation:after', {
                  attribute: t('common:end', { defaultValue: 'End' }),
                  date: t('common:start', { defaultValue: 'Start' }),
                  defaultValue: 'End time must be after start time',
                })}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {mode === 'edit' && onDelete && (
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
            >
              {actionLabel('delete')}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !isTimeValid}>
            {actionLabel('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
