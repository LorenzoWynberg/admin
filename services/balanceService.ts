import { api } from '@/lib/api/client';

type CreditData = App.Data.Credit.CreditData;
type Multiple<T> = Api.Response.Multiple<T>;
type Single<T> = Api.Response.Single<T>;

export interface BalanceLedger {
  entries: CreditData[];
  /** Balance in base currency. */
  balance: number;
  baseCurrency: string | null;
}

export interface AdjustBalanceParams {
  ownerPublicId: string;
  amount: number;
  /** `admin_grant` to add balance, `admin_void` to remove it. */
  type: string;
  /** Required — a by-hand movement always records why. */
  notes: string;
}

export const BalanceService = {
  /**
   * An account's ledger. Omit `ownerPublicId` for the caller's own; staff may
   * pass one to read any account's.
   */
  async list(ownerPublicId?: string): Promise<BalanceLedger> {
    const query = ownerPublicId ? `?owner=${encodeURIComponent(ownerPublicId)}` : '';
    const response = await api.get<Multiple<CreditData>>(`/balance${query}`);

    const extra = (response.extra ?? {}) as { balance?: number; baseCurrency?: string | null };

    return {
      entries: response.items,
      balance: extra.balance ?? 0,
      baseCurrency: extra.baseCurrency ?? null,
    };
  },

  /** Add or remove balance by hand (admin only). */
  async grant(data: AdjustBalanceParams): Promise<CreditData> {
    const response = await api.post<Single<CreditData>>('/balance', {
      ownerPublicId: data.ownerPublicId,
      amount: data.amount,
      type: data.type,
      notes: data.notes,
    });
    return response.item;
  },
};
