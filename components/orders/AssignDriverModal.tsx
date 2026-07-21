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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeasibilityCheck } from '@/hooks/feasibility';
import { useDriverList } from '@/hooks/drivers';
import { useAssignOrder } from '@/hooks/orders';
import { actionLabel, vehicleTypeLabel, dispatchPolicyLabel } from '@/utils/lang';
import { formatDateTime } from '@/utils/format';
import { ChevronDown, UserPlus, Users } from 'lucide-react';

type DriverCandidate = App.Data.Feasibility.DriverCandidate;

interface AssignDriverModalOrder {
  publicId: string;
  /** DTO enum value — kept as string per project convention for enum-from-DTO props */
  finalVehicleType?: string | null;
}

interface AssignDriverModalProps {
  order: AssignDriverModalOrder;
}

export function AssignDriverModal({ order }: AssignDriverModalProps) {
  const { t } = useTranslation('orders');
  const [open, setOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideDriverId, setOverrideDriverId] = useState<string>('');

  const { data: feasibility, isLoading } = useFeasibilityCheck({
    orderPublicId: order.publicId,
    enabled: open,
  });
  const { data: driversData } = useDriverList({ perPage: 200, enabled: open });
  const assignOrder = useAssignOrder();

  const candidates = feasibility?.candidates ?? [];
  const drivers = driversData?.items ?? [];

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSelectedCandidateId(null);
      setOverrideDriverId('');
      setOverrideOpen(false);
    }
    setOpen(val);
  };

  const handleAssign = (driverId: number) => {
    assignOrder.mutate(
      { orderPublicId: order.publicId, driverId },
      { onSuccess: () => handleOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-1 h-4 w-4" />
          {t('assign_driver.button', { defaultValue: 'Assign Driver' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('assign_driver.title', { defaultValue: 'Assign Driver' })}</DialogTitle>
          <DialogDescription>
            {t('assign_driver.description', {
              defaultValue: 'Pick a ranked candidate below, or override with any active driver.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {order.finalVehicleType && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>{t('assign_driver.requires_vehicle', { defaultValue: 'Requires:' })}</span>
              <Badge variant="secondary">{vehicleTypeLabel(order.finalVehicleType)}</Badge>
            </div>
          )}

          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-muted-foreground rounded-md border border-dashed py-8 text-center text-sm">
              {t('assign_driver.no_candidates', {
                defaultValue:
                  'No internal candidates found. Pick a driver below, or outsource this order elsewhere.',
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <CandidateRow
                  key={candidate.driverId}
                  candidate={candidate}
                  selected={selectedCandidateId === candidate.driverId}
                  onSelect={() => setSelectedCandidateId(candidate.driverId)}
                />
              ))}
            </div>
          )}

          <Collapsible open={overrideOpen} onOpenChange={setOverrideOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                {t('assign_driver.override_toggle', { defaultValue: 'Assign a different driver' })}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${overrideOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <Select value={overrideDriverId} onValueChange={setOverrideDriverId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('assign_driver.override_placeholder', {
                      defaultValue: 'Select any active driver',
                    })}
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!overrideDriverId || assignOrder.isPending}
                onClick={() => handleAssign(Number(overrideDriverId))}
              >
                {assignOrder.isPending
                  ? t('common:loading', { defaultValue: 'Loading...' })
                  : t('assign_driver.assign_override', { defaultValue: 'Assign This Driver' })}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {actionLabel('cancel')}
          </Button>
          <Button
            type="button"
            disabled={selectedCandidateId == null || assignOrder.isPending}
            onClick={() => selectedCandidateId != null && handleAssign(selectedCandidateId)}
          >
            {assignOrder.isPending
              ? t('common:loading', { defaultValue: 'Loading...' })
              : t('assign_driver.assign_selected', { defaultValue: 'Assign Selected Driver' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CandidateRow({
  candidate,
  selected,
  onSelect,
}: {
  candidate: DriverCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation('orders');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{candidate.driverName}</span>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{vehicleTypeLabel(candidate.vehicleType)}</Badge>
          <Badge variant="outline">{dispatchPolicyLabel(candidate.dispatchPolicy)}</Badge>
        </div>
      </div>
      <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          {t('assign_driver.onboard_load', {
            count: candidate.onboardLoad,
            defaultValue: `Carrying ${candidate.onboardLoad}`,
          })}
        </span>
        <span>
          {t('assign_driver.extra_distance', {
            km: candidate.extraDistanceKm.toFixed(1),
            defaultValue: `+${candidate.extraDistanceKm.toFixed(1)} km`,
          })}
        </span>
        {candidate.suggestedPickup && (
          <span>
            {t('assign_driver.suggested_pickup', {
              time: formatDateTime(candidate.suggestedPickup),
              defaultValue: `Pickup: ${formatDateTime(candidate.suggestedPickup)}`,
            })}
          </span>
        )}
      </div>
    </button>
  );
}
