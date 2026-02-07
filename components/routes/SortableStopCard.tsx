'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { GripVertical, Package, MapPin, X } from 'lucide-react';
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
    ? 'border-l-emerald-500 bg-emerald-50/50'
    : 'border-l-red-500 bg-red-50/50';
  const iconColor = isPickup ? 'text-emerald-600' : 'text-red-600';

  const order = stop.order;
  const address = isPickup ? order?.fromAddress : order?.toAddress;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border border-l-4 p-2 ${colorClass} ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'ring-primary ring-2' : ''}`}
      onClick={onClick}
    >
      <button
        className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isPickup ? (
          <Package className={`h-4 w-4 shrink-0 ${iconColor}`} />
        ) : (
          <MapPin className={`h-4 w-4 shrink-0 ${iconColor}`} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-xs font-medium">
            <span className={iconColor}>
              {t(`routes:stop_types.${stop.type}`, { defaultValue: stop.type })}
            </span>
            {order?.publicId && <span className="text-muted-foreground">#{order.publicId}</span>}
          </div>
          {address?.streetAddress && (
            <p className="text-muted-foreground truncate text-xs">{address.streetAddress}</p>
          )}
        </div>
      </div>

      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
