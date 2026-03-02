'use client';

import { useDraggable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { Package, MapPin, Info, Phone, Building2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Enums } from '@/data/app-enums';
import { capitalize } from '@/utils/lang';
import { resolveStopAddress } from '@/utils/routes';
import { APP_TIMEZONE } from '@/utils/format';
import type { UnassignedStop } from '@/services/routeService';

interface DraggableUnassignedStopProps {
  stop: UnassignedStop;
  isSelected: boolean;
  onClick?: () => void;
}

/** Presentational card — used both in the list and in DragOverlay */
export function UnassignedStopContent({
  stop,
  isSelected = false,
  isDragging = false,
}: {
  stop: UnassignedStop;
  isSelected?: boolean;
  isDragging?: boolean;
}) {
  const { t } = useTranslation();

  const isPickup = stop.stopType === Enums.RouteStopType.PICKUP;
  const colorClass = isPickup
    ? 'border-l-sky-500 bg-sky-50/50'
    : 'border-l-violet-500 bg-violet-50/50';
  const iconColor = isPickup ? 'text-sky-600' : 'text-violet-600';
  const orderStops = (stop.order.stops ?? []) as App.Data.Order.OrderStopData[];
  const matchingStop = orderStops.find((s) => s.type === stop.stopType);
  const address = resolveStopAddress(stop.stopType, orderStops, stop.order.deliveryAddress);
  const contactName = matchingStop?.contactName ?? stop.order.contactName;
  const contactPhone = matchingStop?.contactPhone ?? stop.order.contactPhone;
  const businessName = stop.order.business?.name;

  return (
    <div
      className={`rounded-md border border-l-4 px-2.5 py-2 transition-colors hover:shadow-sm ${colorClass} ${
        isSelected ? 'ring-primary ring-2' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Header row: icon + type + order ID + info */}
      <div className="flex items-center gap-1.5">
        {isPickup ? (
          <Package className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        ) : (
          <MapPin className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        )}
        <span className={`text-xs font-semibold ${iconColor}`}>
          {capitalize(t(`routes:stop_types.${stop.stopType}`, { defaultValue: stop.stopType }))}
        </span>
        {(contactPhone || businessName) && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="text-muted-foreground hover:text-foreground ml-auto shrink-0 p-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2 p-3 text-xs" align="start">
              {businessName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <span>{businessName}</span>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <a href={`tel:${contactPhone}`} className="text-primary hover:underline">
                    {contactPhone}
                  </a>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Detail rows */}
      <div className="mt-0.5 pl-5 text-xs">
        <p className="text-muted-foreground text-[11px]">#{stop.order.publicId}</p>
        {contactName && <p className="truncate font-medium">{contactName}</p>}
        {address?.streetAddress && (
          <p className="text-muted-foreground truncate">{address.streetAddress}</p>
        )}
        {stop.scheduledFor && (
          <p className="text-muted-foreground">
            {new Date(stop.scheduledFor).toLocaleTimeString([], {
              timeZone: APP_TIMEZONE,
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export function DraggableUnassignedStop({
  stop,
  isSelected,
  onClick,
}: DraggableUnassignedStopProps) {
  const draggableId = `unassigned-${stop.order.id}-${stop.stopType}`;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
    data: { orderId: stop.order.id, stopType: stop.stopType },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab touch-none active:cursor-grabbing"
      onClick={onClick}
    >
      <UnassignedStopContent stop={stop} isSelected={isSelected} isDragging={isDragging} />
    </div>
  );
}
