'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { GripVertical, Package, MapPin, X, Info, Phone, Building2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { capitalize } from '@/utils/lang';
import { Button } from '@/components/ui/button';

type RouteStopData = App.Data.Route.RouteStopData;

interface SortableStopCardProps {
  stop: RouteStopData;
  onRemove?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function SortableStopCard({ stop, onRemove, onClick, isSelected }: SortableStopCardProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPickup = stop.type === 'pickup';
  const colorClass = isPickup
    ? 'border-l-sky-500 bg-sky-50/50'
    : 'border-l-violet-500 bg-violet-50/50';
  const iconColor = isPickup ? 'text-sky-600' : 'text-violet-600';

  const order = stop.order;
  const address = isPickup ? order?.fromAddress : order?.toAddress;
  const contactName = isPickup ? order?.fromName : order?.toName;
  const contactPhone = isPickup ? order?.fromPhone : order?.toPhone;
  const businessName = order?.business?.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-l-4 px-2.5 py-2 ${colorClass} ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'ring-primary ring-2' : ''}`}
      onClick={onClick}
    >
      {/* Header row: grip + type badge + order ID + info + remove */}
      <div className="flex items-center gap-1.5">
        <button
          className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {isPickup ? (
          <Package className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        ) : (
          <MapPin className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        )}
        <span className={`text-xs font-semibold ${iconColor}`}>
          {capitalize(t(`routes:stop_types.${stop.type}`, { defaultValue: stop.type }))}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {(contactPhone || businessName) && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground p-0.5"
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
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Detail rows */}
      <div className="mt-0.5 pl-7 text-xs">
        {order?.publicId && <p className="text-muted-foreground text-[11px]">#{order.publicId}</p>}
        {contactName && <p className="truncate font-medium">{contactName}</p>}
        {address?.streetAddress && (
          <p className="text-muted-foreground truncate">{address.streetAddress}</p>
        )}
      </div>
    </div>
  );
}
