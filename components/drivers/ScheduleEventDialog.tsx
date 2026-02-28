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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

type OverrideEntry = App.Data.Driver.DriverScheduleOverrideData;

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  date: string;
  startTime?: string;
  endTime?: string;
  isOverride?: boolean;
  available?: boolean;
  onSave: (override: OverrideEntry) => void;
  onDelete?: () => void;
  onMakeUnavailable?: () => void;
}

export function ScheduleEventDialog({
  open,
  onOpenChange,
  mode,
  date,
  startTime: initialStartTime,
  endTime: initialEndTime,
  isOverride,
  available: initialAvailable,
  onSave,
  onDelete,
  onMakeUnavailable,
}: ScheduleEventDialogProps) {
  const { t } = useTranslation();
  // Reset key — forces state reset when dialog props change
  const resetKey = `${date}-${initialAvailable}-${initialStartTime}-${initialEndTime}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [available, setAvailable] = useState(initialAvailable ?? true);
  const [startTime, setStartTime] = useState(initialStartTime ?? '08:00');
  const [endTime, setEndTime] = useState(initialEndTime ?? '17:00');

  // Derive state from props during render (no useEffect needed)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setAvailable(initialAvailable ?? true);
    setStartTime(initialStartTime ?? '08:00');
    setEndTime(initialEndTime ?? '17:00');
  }

  const handleSave = () => {
    const override: OverrideEntry = {
      date,
      available,
      ...(available ? { startTime, endTime } : {}),
    } as OverrideEntry;

    onSave(override);
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

          <div className="flex items-center gap-3">
            <Switch checked={available} onCheckedChange={setAvailable} />
            <Label>
              {available
                ? t('drivers:schedule.available', { defaultValue: 'Available' })
                : t('drivers:schedule.unavailable', { defaultValue: 'Unavailable' })}
            </Label>
          </div>

          {available && (
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
          )}
        </div>

        <DialogFooter className="gap-2">
          {mode === 'edit' && !isOverride && onMakeUnavailable && (
            <Button
              variant="destructive"
              onClick={() => {
                onMakeUnavailable();
                onOpenChange(false);
              }}
            >
              {t('drivers:schedule.make_unavailable', { defaultValue: 'Mark as unavailable' })}
            </Button>
          )}
          {mode === 'edit' && isOverride && onDelete && (
            <Button
              variant="outline"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
            >
              {t('drivers:schedule.revert_to_template', { defaultValue: 'Revert to default' })}
            </Button>
          )}
          <Button onClick={handleSave}>{t('common:save', { defaultValue: 'Save' })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
