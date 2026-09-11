import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PeriodBillService } from '../periodBillService';
import { api } from '@/lib/api/client';
import { Enums } from '@/data/app-enums';

type BillNeedsAttentionData = App.Data.PeriodBill.BillNeedsAttentionData;

vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    postMultipart: vi.fn(),
    getBlob: vi.fn(),
  },
}));

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, and the two are deliberately not
// assignable to each other. Production code never needs the bridge — it reads
// these values off DTOs, where they already carry the nominal type — so
// fixtures cross that boundary once, here.
function row(
  publicId: string,
  reason: string,
  urgency: string,
  dueAt: string
): BillNeedsAttentionData {
  return {
    bill: { publicId, dueAt },
    urgency,
    reason,
    ownerType: 'business',
    ownerPublicId: `owner-${publicId}`,
    ownerName: `Owner ${publicId}`,
  } as BillNeedsAttentionData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PeriodBillService.needsAttention', () => {
  it('hits the exact route literal the api registers', async () => {
    vi.mocked(api.get).mockResolvedValue({ items: [], extra: { summary: {} } });

    await PeriodBillService.needsAttention();

    expect(api.get).toHaveBeenCalledWith('/period-bills/needs-attention');
  });

  // The ordering is the API's: `BillAttentionReason` declares its cases in
  // precedence order and the endpoint emits one row per bill at its most urgent
  // reason, already sorted. This pins that the service is a pass-through — the
  // fixture is deliberately in an order that every plausible client-side sort
  // (by dueAt, by publicId) would change.
  it('returns the rows in the order the api sent them, unsorted', async () => {
    const unresolved = row(
      'pb-zz',
      Enums.BillAttentionReason.UnresolvedCharge,
      Enums.AttentionUrgency.Critical,
      '2030-01-01T00:00:00Z'
    );
    const overdue = row(
      'pb-aa',
      Enums.BillAttentionReason.Overdue,
      Enums.AttentionUrgency.High,
      '2020-01-01T00:00:00Z'
    );

    vi.mocked(api.get).mockResolvedValue({
      items: [unresolved, overdue],
      extra: { summary: { critical: 1, high: 1, medium: 0, low: 0 } },
    });

    const result = await PeriodBillService.needsAttention();

    expect(result.items.map((item) => item.bill.publicId)).toEqual(['pb-zz', 'pb-aa']);
    expect(result.summary).toEqual({ critical: 1, high: 1, medium: 0, low: 0 });
  });

  it('survives a response carrying no summary', async () => {
    vi.mocked(api.get).mockResolvedValue({ items: [] });

    const result = await PeriodBillService.needsAttention();

    expect(result.summary).toEqual({});
  });
});

describe('PeriodBillService.settle', () => {
  // The api's request DTOs declare no input mapper, so `SettlePeriodBillData`
  // validates `currencyCode`/`destinationId` verbatim. A snake_case key is
  // silently dropped rather than rejected, which is why this is pinned.
  it('sends the method-specific fields under their camelCase names', async () => {
    vi.mocked(api.postMultipart).mockResolvedValue({ item: {} });

    await PeriodBillService.settle('pb-1', {
      method: Enums.SettlementMethod.Transferencia as App.Enums.SettlementMethod,
      currencyCode: 'CRC',
      reference: 'REF-9',
      destinationId: 7,
      notes: 'seen in the bank',
    });

    const [url, formData] = vi.mocked(api.postMultipart).mock.calls[0];
    expect(url).toBe('/period-bills/pb-1/settle');
    expect((formData as FormData).get('currencyCode')).toBe('CRC');
    expect((formData as FormData).get('destinationId')).toBe('7');
    expect((formData as FormData).get('method')).toBe(Enums.SettlementMethod.Transferencia);
    expect((formData as FormData).get('reference')).toBe('REF-9');
    expect((formData as FormData).get('currency_code')).toBeNull();
    expect((formData as FormData).get('destination_id')).toBeNull();
  });

  it('omits an absent destination rather than sending an empty one', async () => {
    vi.mocked(api.postMultipart).mockResolvedValue({ item: {} });

    await PeriodBillService.settle('pb-1', {
      method: Enums.SettlementMethod.Cash as App.Enums.SettlementMethod,
      currencyCode: 'CRC',
      destinationId: null,
    });

    const formData = vi.mocked(api.postMultipart).mock.calls[0][1] as FormData;
    expect(formData.get('destinationId')).toBeNull();
  });
});

describe('PeriodBillService verification acts', () => {
  it('approves with an optional note', async () => {
    vi.mocked(api.post).mockResolvedValue({ item: {} });

    await PeriodBillService.approveDeclaration('pb-1', null);

    expect(api.post).toHaveBeenCalledWith('/period-bills/pb-1/approve', { notes: null });
  });

  it('rejects with the reason that reaches the customer', async () => {
    vi.mocked(api.post).mockResolvedValue({ item: {} });

    await PeriodBillService.rejectDeclaration('pb-1', 'not in the account');

    expect(api.post).toHaveBeenCalledWith('/period-bills/pb-1/reject', {
      notes: 'not in the account',
    });
  });
});

describe('PeriodBillService.fetchProof', () => {
  // The bearer token and the authenticated-fetch handling (401 clears the
  // session, a failure raises the api's message) live once in
  // `api.getBlob()` — see `lib/api/__tests__/client.test.ts` — so this only
  // pins that `fetchProof` is a pass-through to it with the right route.
  it('delegates to the shared client, which carries a byte stream that api.get() cannot', async () => {
    const bytes = new Blob(['x']);
    vi.mocked(api.getBlob).mockResolvedValue(bytes);

    const result = await PeriodBillService.fetchProof('pb-1');

    expect(api.getBlob).toHaveBeenCalledWith('/period-bills/pb-1/proof');
    expect(result).toBe(bytes);
  });
});
