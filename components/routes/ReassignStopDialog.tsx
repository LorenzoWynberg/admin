'use client';

import {
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useReassignStop } from '@/hooks/route-stops';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { actionLabel } from '@/utils/lang';

interface ReassignStopDialogProps {
  stopId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routes: App.Data.Route.RouteData[];
  drivers: { id: number; name: string }[];
}

export function ReassignStopDialog({
  stopId,
  open,
  onOpenChange,
  routes,
  drivers,
}: ReassignStopDialogProps) {
  const { t } = useTranslation();
  const reassign = useReassignStop();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [targetRouteId, setTargetRouteId] = useState<string>('');
  const [newDriverId, setNewDriverId] = useState<string>('');
  const [date, setDate] = useState('');
  const [optimize, setOptimize] = useState(false);

  const handleSubmit = () => {
    const data =
      mode === 'existing'
        ? { targetRouteId: parseInt(targetRouteId), optimize }
        : { newDriverId: parseInt(newDriverId), date: date || null, optimize };

    reassign.mutate(
      { stopId, data },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  const canSubmit = mode === 'existing' ? !!targetRouteId : !!newDriverId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('routes:reassign.title', { defaultValue: 'Reassign Stop' })}</DialogTitle>
          <DialogDescription>
            {t('routes:reassign.description', {
              defaultValue: 'Move this stop to another route or create a new one',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'existing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('existing')}
            >
              {t('routes:reassign.to_existing', { defaultValue: 'To Existing Route' })}
            </Button>
            <Button
              variant={mode === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('new')}
            >
              {t('routes:reassign.to_new', { defaultValue: 'Create New Route' })}
            </Button>
          </div>

          {mode === 'existing' ? (
            <div className="grid gap-2">
              <Label>
                {t('routes:reassign.select_route', { defaultValue: 'Select Target Route' })}
              </Label>
              <Select value={targetRouteId} onValueChange={setTargetRouteId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('routes:select_route', { defaultValue: 'Select Route' })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={String(route.id)}>
                      {route.driver?.user?.name || `Route #${route.id}`} — {route.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>
                  {t('routes:reassign.select_driver', { defaultValue: 'Select Driver' })}
                </Label>
                <Select value={newDriverId} onValueChange={setNewDriverId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('routes:fields.driver', { defaultValue: 'Driver' })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('routes:fields.date', { defaultValue: 'Date' })}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </>
          )}

          {/* Optimize toggle */}
          <div className="flex items-center gap-2">
            <Switch checked={optimize} onCheckedChange={setOptimize} />
            <Label>
              {t('routes:optimize_after_adding', { defaultValue: 'Optimize after adding' })}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || reassign.isPending}>
            {t('routes:reassign.title', { defaultValue: 'Reassign Stop' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
