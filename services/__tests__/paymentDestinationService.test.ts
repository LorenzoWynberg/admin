import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PaymentDestinationService } from '../paymentDestinationService';
import { api } from '@/lib/api/client';
import { Enums } from '@/data/app-enums';

type PaymentDestinationData = App.Data.PaymentDestination.PaymentDestinationData;

vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    destroy: vi.fn(),
  },
}));

function page(items: PaymentDestinationData[], currentPage: number, lastPage: number) {
  return { items, meta: { currentPage, lastPage } };
}

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, and the two are deliberately not
// assignable to each other. Production code never needs the bridge — it reads
// these values off DTOs, where they already carry the nominal type — so
// fixtures cross that boundary once, here.
function destination(id: number): PaymentDestinationData {
  return {
    id,
    method: Enums.SettlementMethod.Transferencia,
    active: true,
  } as PaymentDestinationData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PaymentDestinationService.list', () => {
  // The api paginates this at a fixed 15 and reads no `per_page`. Deactivated
  // rows are kept forever, so truncating at page one would eventually hide live
  // destinations behind retired ones.
  it('walks every page rather than returning the first', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(page([destination(1), destination(2)], 1, 3))
      .mockResolvedValueOnce(page([destination(3)], 2, 3))
      .mockResolvedValueOnce(page([destination(4)], 3, 3));

    const result = await PaymentDestinationService.list();

    expect(result.map((row) => row.id)).toEqual([1, 2, 3, 4]);
    expect(api.get).toHaveBeenCalledTimes(3);
    expect(api.get).toHaveBeenNthCalledWith(1, '/payment-destinations?page=1');
    expect(api.get).toHaveBeenNthCalledWith(3, '/payment-destinations?page=3');
  });

  it('stops after one request when there is only one page', async () => {
    vi.mocked(api.get).mockResolvedValue(page([destination(1)], 1, 1));

    await PaymentDestinationService.list();

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('does not loop forever when the response carries no meta', async () => {
    vi.mocked(api.get).mockResolvedValue({ items: [destination(1)] });

    const result = await PaymentDestinationService.list();

    expect(result).toHaveLength(1);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});

describe('PaymentDestinationService writes', () => {
  it('creates against the collection route', async () => {
    vi.mocked(api.post).mockResolvedValue({ item: destination(1) });

    await PaymentDestinationService.create({
      method: Enums.SettlementMethod.SinpeMobile as App.Enums.SettlementMethod,
      phoneNumber: '8888-8888',
      holderName: 'Mandados SA',
      legalId: '3-101-999',
    });

    expect(api.post).toHaveBeenCalledWith('/payment-destinations', {
      method: Enums.SettlementMethod.SinpeMobile,
      phoneNumber: '8888-8888',
      holderName: 'Mandados SA',
      legalId: '3-101-999',
    });
  });

  it('updates by numeric id — a destination has no public id', async () => {
    vi.mocked(api.patch).mockResolvedValue({ item: destination(7) });

    await PaymentDestinationService.update(7, { active: false });

    expect(api.patch).toHaveBeenCalledWith('/payment-destinations/7', { active: false });
  });

  it('deletes by numeric id', async () => {
    vi.mocked(api.destroy).mockResolvedValue({ message: '', status: 204, extra: {} });

    await PaymentDestinationService.destroy(7);

    expect(api.destroy).toHaveBeenCalledWith('/payment-destinations/7');
  });
});
