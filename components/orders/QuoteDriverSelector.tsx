'use client';

import { useMemo, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RouteStatusBadge } from '@/components/routes/RouteStatusBadge';
import { useDriverList } from '@/hooks/drivers';
import { useDriverSchedules } from '@/hooks/drivers/useDriverSchedules';
import { useRouteList } from '@/hooks/routes';
import { statusLabel, vehicleTypeLabel, dispatchPolicyLabel, actionLabel } from '@/utils/lang';
import {
  formatDateTime,
  formatDateOnly,
  getTodayAppTz,
  toDateString,
  addDays,
} from '@/utils/format';
import { CalendarClock, ChevronLeft, ChevronRight, Route as RouteIcon, UserCog } from 'lucide-react';

type DriverCandidate = App.Data.Feasibility.DriverCandidate;

interface QuoteDriverSelectorProps {
  candidates: DriverCandidate[];
  /** Top-ranked candidate id — the system suggestion. */
  suggestedDriverId: number | null;
  /**
   * Current selection: `undefined` = untouched (accept the suggestion),
   * a driver id = explicit override, `null` = explicit "none".
   */
  value: number | null | undefined;
  onChange: (driverId: number | null) => void;
  /** Date the schedule/routes tabs open on (YYYY-MM-DD). Defaults to today. */
  initialDate?: string | null;
}


export function QuoteDriverSelector({
  candidates,
  suggestedDriverId,
  value,
  onChange,
  initialDate,
}: QuoteDriverSelectorProps) {
  const { t, i18n } = useTranslation('quotes');
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => initialDate || toDateString(getTodayAppTz()));

  const { data: driversData } = useDriverList({ perPage: 200, enabled: open });
  const drivers = useMemo(() => driversData?.items ?? [], [driversData]);

  // Untouched (undefined) falls back to the suggestion; an explicit choice
  // (a driver id, or null for "none") is honored as-is.
  const effectiveId = value === undefined ? suggestedDriverId : value;

  // Ranked candidate ids first, then any other active driver as override options.
  // Inactive drivers are off the roster and can never be assigned, so they are
  // excluded from the override options (ranked candidates are already active).
  const otherDrivers = useMemo(
    () => drivers.filter((d) => d.active && !candidates.some((c) => c.driverId === d.id)),
    [drivers, candidates]
  );

  const effectiveCandidate = useMemo(
    () => candidates.find((c) => c.driverId === effectiveId) ?? null,
    [candidates, effectiveId]
  );

  // Resolve the selected driver once; name and (public_id-bound) schedules key derive from it.
  const effectiveDriver = useMemo(
    () => drivers.find((d) => d.id === effectiveId) ?? null,
    [drivers, effectiveId]
  );
  const effectiveName = effectiveCandidate?.driverName ?? effectiveDriver?.user?.name ?? null;
  // The schedules endpoint binds Driver by public_id, but candidates only carry the numeric id.
  const effectiveDriverPublicId = effectiveDriver?.publicId ?? null;

  const isSuggested = value === undefined && suggestedDriverId != null;
  const today = toDateString(getTodayAppTz());

  return (
    <div className="bg-muted/50 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {t('driver_select.label', { defaultValue: 'Assigned Driver' })}
          </p>
          <p className="text-muted-foreground text-xs">
            {effectiveId == null
              ? t('driver_select.none', {
                  defaultValue: 'None — will surface for manual assignment',
                })
              : `${effectiveName ?? `#${effectiveId}`}${
                  isSuggested
                    ? ` · ${t('driver_select.suggested', { defaultValue: 'suggested' })}`
                    : ''
                }`}
          </p>
          {effectiveCandidate?.suggestedPickup && (
            <p className="text-muted-foreground mt-1 text-xs">
              {t('driver_select.eta', {
                pickup: formatDateTime(effectiveCandidate.suggestedPickup),
                delivery: effectiveCandidate.suggestedDelivery
                  ? formatDateTime(effectiveCandidate.suggestedDelivery)
                  : '—',
                defaultValue: `Pickup ${formatDateTime(effectiveCandidate.suggestedPickup)} · Delivery ${
                  effectiveCandidate.suggestedDelivery
                    ? formatDateTime(effectiveCandidate.suggestedDelivery)
                    : '—'
                }`,
              })}
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <UserCog className="mr-1 h-4 w-4" />
              {t('driver_select.button', { defaultValue: 'Select Driver' })}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {t('driver_select.title', { defaultValue: 'Select Driver' })}
              </DialogTitle>
              <DialogDescription>
                {t('driver_select.description', {
                  defaultValue:
                    'The system suggests the best-ranked driver. Pick another to override — they are assigned when the customer accepts and pays.',
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Driver selector */}
              <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('driver_select.field_label', { defaultValue: 'Driver' })}
                  </span>
                  {isSuggested && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    >
                      {t('driver_select.suggested', { defaultValue: 'suggested' })}
                    </Badge>
                  )}
                </div>
                <Select
                  value={effectiveId != null ? String(effectiveId) : ''}
                  onValueChange={(val) => onChange(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('driver_select.override_placeholder', {
                        defaultValue: 'Select any active driver',
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c, i) => (
                      <SelectItem key={`c-${c.driverId}`} value={String(c.driverId)}>
                        {c.driverName}
                        {i === 0
                          ? ` · ${t('driver_select.suggested', { defaultValue: 'suggested' })}`
                          : ''}
                      </SelectItem>
                    ))}
                    {otherDrivers.map((d) => (
                      <SelectItem key={`d-${d.id}`} value={String(d.id)}>
                        {d.user?.name ?? `Driver #${d.publicId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {effectiveCandidate && (
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveCandidate.vehicleType && (
                      <Badge variant="outline">
                        {vehicleTypeLabel(effectiveCandidate.vehicleType)}
                      </Badge>
                    )}
                    {effectiveCandidate.dispatchPolicy && (
                      <Badge variant="outline">
                        {dispatchPolicyLabel(effectiveCandidate.dispatchPolicy)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {t('feasibility.onboard_load', {
                        count: effectiveCandidate.onboardLoad,
                        defaultValue: `Carrying ${effectiveCandidate.onboardLoad}`,
                      })}
                    </Badge>
                    <Badge variant="outline">
                      {t('feasibility.extra_distance', {
                        km: effectiveCandidate.extraDistanceKm.toFixed(1),
                        defaultValue: `+${effectiveCandidate.extraDistanceKm.toFixed(1)} km`,
                      })}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Shared date navigator */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDate((d) => addDays(d, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium">
                  <CalendarClock className="text-muted-foreground h-4 w-4" />
                  {formatDateOnly(date, i18n.language)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDate((d) => addDays(d, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={date === today ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDate(today)}
                >
                  {t('driver_select.today', { defaultValue: 'Today' })}
                </Button>
              </div>

              {/* Horario / Rutas tabs — both scoped to the date above */}
              {effectiveId == null ? (
                <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
                  {t('driver_select.pick_to_view', {
                    defaultValue: 'Select a driver to view their schedule and routes.',
                  })}
                </p>
              ) : (
                <Tabs defaultValue="schedule">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schedule">
                      <CalendarClock className="mr-1 h-4 w-4" />
                      {t('driver_select.tab_schedule', { defaultValue: 'Schedule' })}
                    </TabsTrigger>
                    <TabsTrigger value="routes">
                      <RouteIcon className="mr-1 h-4 w-4" />
                      {t('driver_select.tab_routes', { defaultValue: 'Routes' })}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="schedule" className="pt-3">
                    <ScheduleList
                      driverPublicId={effectiveDriverPublicId}
                      date={date}
                      enabled={open}
                    />
                  </TabsContent>
                  <TabsContent value="routes" className="pt-3">
                    <RoutesList driverId={effectiveId} date={date} enabled={open} />
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                disabled={effectiveId == null}
              >
                {t('driver_select.clear', { defaultValue: 'Clear override' })}
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                {actionLabel('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ScheduleList({
  driverPublicId,
  date,
  enabled,
}: {
  driverPublicId: string | null;
  date: string;
  enabled: boolean;
}) {
  const { t } = useTranslation('quotes');
  // One day at a time — the modal only ever shows the selected date.
  const { data, isLoading } = useDriverSchedules(driverPublicId ?? '', {
    from: date,
    to: date,
    enabled: enabled && !!driverPublicId,
  });

  const blocks = useMemo(
    () => [...(data?.schedules ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data]
  );

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {t('common:loading', { defaultValue: 'Loading...' })}
      </p>
    );
  }
  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
        {t('driver_select.no_schedule', { defaultValue: 'No schedule blocks on this day.' })}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {blocks.map((b) => (
        <div
          key={b.id ?? `${b.date}-${b.startTime}`}
          className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
        >
          <span className="font-medium">
            {b.startTime} – {b.endTime}
          </span>
          {b.vehicleType && <Badge variant="outline">{vehicleTypeLabel(b.vehicleType)}</Badge>}
        </div>
      ))}
    </div>
  );
}

function RoutesList({
  driverId,
  date,
  enabled,
}: {
  driverId: number;
  date: string;
  enabled: boolean;
}) {
  const { t } = useTranslation('quotes');
  const { data, isLoading } = useRouteList({ driverId, date, perPage: 50, enabled });

  // Sort each route's stops once here rather than on every render row.
  const routes = useMemo(
    () =>
      ((data?.items ?? []) as App.Data.Route.RouteData[]).map((r) => ({
        ...r,
        stops: [...(r.stops ?? [])].sort((a, b) => a.sequence - b.sequence),
      })),
    [data]
  );

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {t('common:loading', { defaultValue: 'Loading...' })}
      </p>
    );
  }
  if (routes.length === 0) {
    return (
      <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
        {t('driver_select.no_routes', { defaultValue: 'No routes on this day.' })}
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {routes.map((route) => {
        const stops = route.stops;
        return (
          <div key={route.id ?? route.publicId} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {t('driver_select.route_label', {
                  id: route.publicId ?? route.id,
                  defaultValue: `Route ${route.publicId ?? route.id}`,
                })}
              </span>
              <div className="flex items-center gap-2">
                {route.status && <RouteStatusBadge status={route.status} />}
                <span className="text-muted-foreground text-xs">
                  {t('driver_select.stop_count', {
                    count: stops.length,
                    defaultValue: `${stops.length} stops`,
                  })}
                </span>
              </div>
            </div>
            {stops.length > 0 && (
              <ol className="mt-2 space-y-1">
                {stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="text-muted-foreground flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate">
                      {stop.sequence}. {statusLabel(stop.type)}
                      {stop.order?.publicId ? ` · ${stop.order.publicId}` : ''}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {stop.scheduledFor && <span>{formatDateTime(stop.scheduledFor)}</span>}
                      <Badge variant="outline" className="text-[10px]">
                        {statusLabel(stop.status)}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}
