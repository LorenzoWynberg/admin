import type { QuoteLineItem } from '@/components/quotes/QuoteLineItemsEditor';

/**
 * A row the editor added but the user never filled in. Dropping these is safe —
 * they carry no price and no name.
 */
const isUntouched = (item: QuoteLineItem): boolean =>
  !item.label.trim() && item.unitPrice === 0 && item.quantity <= 1;

/**
 * The API requires a label on every line item, so a priced row without one
 * cannot be sent. It must not be dropped silently either — the quote total the
 * admin sees includes it, so losing it would understate the quote.
 */
export interface PartitionedQuoteItems {
  /** Ready to send. */
  payloadItems: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
    stopPublicId?: string | null;
  }>;
  /** Indexes into the original array that carry a price but no label. */
  incompleteIndexes: number[];
}

export function partitionQuoteItems(items: QuoteLineItem[]): PartitionedQuoteItems {
  const payloadItems: PartitionedQuoteItems['payloadItems'] = [];
  const incompleteIndexes: number[] = [];

  items.forEach((item, index) => {
    if (item.label.trim()) {
      payloadItems.push({
        stopPublicId: item.stopPublicId,
        label: item.label.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
      return;
    }

    if (!isUntouched(item)) {
      incompleteIndexes.push(index);
    }
  });

  return { payloadItems, incompleteIndexes };
}
