import { describe, it, expect } from 'vitest';
import { partitionQuoteItems } from '@/utils/quoteItems';
import type { QuoteLineItem } from '@/components/quotes/QuoteLineItemsEditor';

const item = (overrides: Partial<QuoteLineItem> = {}): QuoteLineItem => ({
  stopPublicId: 'STOP-1',
  label: '',
  quantity: 1,
  unitPrice: 0,
  ...overrides,
});

describe('partitionQuoteItems', () => {
  it('sends labelled items with a trimmed label', () => {
    const { payloadItems, incompleteIndexes } = partitionQuoteItems([
      item({ label: '  Samsung TV  ', quantity: 2, unitPrice: 300000 }),
    ]);

    expect(incompleteIndexes).toEqual([]);
    expect(payloadItems).toEqual([
      { stopPublicId: 'STOP-1', label: 'Samsung TV', quantity: 2, unitPrice: 300000 },
    ]);
  });

  it('drops rows the user never filled in', () => {
    const { payloadItems, incompleteIndexes } = partitionQuoteItems([item()]);

    expect(payloadItems).toEqual([]);
    expect(incompleteIndexes).toEqual([]);
  });

  it('flags a priced row that has no label instead of dropping it', () => {
    const { payloadItems, incompleteIndexes } = partitionQuoteItems([item({ unitPrice: 300000 })]);

    expect(payloadItems).toEqual([]);
    expect(incompleteIndexes).toEqual([0]);
  });

  it('flags an unlabelled row that carries a quantity', () => {
    const { incompleteIndexes } = partitionQuoteItems([item({ quantity: 3 })]);

    expect(incompleteIndexes).toEqual([0]);
  });

  it('reports indexes against the original list when rows are mixed', () => {
    const { payloadItems, incompleteIndexes } = partitionQuoteItems([
      item({ label: 'Milk', unitPrice: 1200 }),
      item(),
      item({ unitPrice: 300000 }),
      item({ label: 'Bread', unitPrice: 900 }),
    ]);

    expect(payloadItems.map((i) => i.label)).toEqual(['Milk', 'Bread']);
    expect(incompleteIndexes).toEqual([2]);
  });
});
