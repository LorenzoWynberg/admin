'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileText, Plus, X } from 'lucide-react';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/format';
import { capitalize } from '@/utils/lang';

export interface QuoteLineItem {
  stopPublicId?: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteLineItemsEditorProps {
  stops: App.Data.Order.OrderStopData[];
  items: QuoteLineItem[];
  onItemsChange: (items: QuoteLineItem[]) => void;
  currencySymbol: string;
}

export function QuoteLineItemsEditor({
  stops,
  items,
  onItemsChange,
  currencySymbol,
}: QuoteLineItemsEditorProps) {
  const { t } = useTranslation();

  // Group items by stop
  const stopGroups = stops.map((stop) => ({
    stop,
    items: items.filter((item) => item.stopPublicId === stop.publicId),
  }));

  const addItem = (stopPublicId: string | null) => {
    onItemsChange([...items, { stopPublicId, label: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onItemsChange(updated);
  };

  const getGlobalIndex = (stopPublicId: string | null, localIndex: number): number => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      const itemStopId = items[i].stopPublicId || null;
      if (itemStopId === stopPublicId) {
        if (count === localIndex) return i;
        count++;
      }
    }
    return -1;
  };

  const stopLabel = (stop: App.Data.Order.OrderStopData): string => {
    const type = stop.type
      ? t(`routes:stop_types.${stop.type}`, { defaultValue: capitalize(stop.type) })
      : '';
    const addr = stop.address?.humanReadableAddress || stop.address?.streetAddress || '';
    return addr ? `${type} — ${addr}` : type;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {t('quotes:items.title', { defaultValue: 'Line Items' })}
      </Label>

      {stopGroups.map(({ stop, items: sectionItems }) => (
        <ItemSection
          key={stop.publicId}
          title={stopLabel(stop)}
          instructions={stop.instructions}
          sectionItems={sectionItems}
          currencySymbol={currencySymbol}
          onAdd={() => addItem(stop.publicId || null)}
          onRemove={(localIdx) => removeItem(getGlobalIndex(stop.publicId || null, localIdx))}
          onUpdate={(localIdx, field, value) =>
            updateItem(getGlobalIndex(stop.publicId || null, localIdx), field, value)
          }
          t={t}
        />
      ))}
    </div>
  );
}

interface ItemSectionProps {
  title: string;
  instructions?: string | null;
  sectionItems: QuoteLineItem[];
  currencySymbol: string;
  onAdd: () => void;
  onRemove: (localIndex: number) => void;
  onUpdate: (localIndex: number, field: keyof QuoteLineItem, value: string | number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function ItemSection({
  title,
  instructions,
  sectionItems,
  currencySymbol,
  onAdd,
  onRemove,
  onUpdate,
  t,
}: ItemSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
          >
            <span className="truncate">
              {title}
              {sectionItems.length > 0 && (
                <span className="text-muted-foreground ml-2 text-xs">({sectionItems.length})</span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 px-3 pb-3">
            {instructions && (
              <div className="bg-muted/50 flex items-start gap-2 rounded-md px-2.5 py-2 text-sm">
                <FileText className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-muted-foreground italic">{instructions}</span>
              </div>
            )}
            {sectionItems.length > 0 && (
              <div className="text-muted-foreground grid grid-cols-[1fr_60px_80px_70px_28px] items-center gap-2 text-xs">
                <span>{t('quotes:items.label', { defaultValue: 'Label' })}</span>
                <span>{t('quotes:items.quantity', { defaultValue: 'Quantity' })}</span>
                <span>{t('quotes:items.unit_price', { defaultValue: 'Unit Price' })}</span>
                <span>{t('quotes:items.total', { defaultValue: 'Total' })}</span>
                <span />
              </div>
            )}
            {sectionItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_60px_80px_70px_28px] items-center gap-2"
              >
                <Input
                  value={item.label}
                  onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                  placeholder={t('quotes:items.label', { defaultValue: 'Label' })}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => onUpdate(idx, 'quantity', parseInt(e.target.value) || 1)}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => onUpdate(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
                <span className="text-right text-sm">
                  {formatCurrency(item.quantity * item.unitPrice, currencySymbol)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRemove(idx)}
                  title={t('quotes:items.remove', { defaultValue: 'Remove' })}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAdd}>
              <Plus className="mr-1 h-3 w-3" />
              {t('quotes:items.add_item', { defaultValue: 'Add Item' })}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
