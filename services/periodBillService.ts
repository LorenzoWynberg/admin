import { api } from '@/lib/api/client';

type PeriodBillData = App.Data.PeriodBill.PeriodBillData;
type BillNeedsAttentionData = App.Data.PeriodBill.BillNeedsAttentionData;
type AttentionUrgency = App.Enums.AttentionUrgency;
type SettlementMethod = App.Enums.SettlementMethod;
type Multiple<T> = Api.Response.Multiple<T>;
type Single<T> = Api.Response.Single<T>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mandados.cr';

/** How many bills sit at each urgency, counted by the API across all reasons. */
export type BillAttentionSummary = Partial<Record<AttentionUrgency, number>>;

export interface BillsNeedingAttention {
  /**
   * One row per bill, at the most urgent reason it matches, **already ordered
   * by the API**: `BillAttentionReason` declares its cases in precedence order
   * (unresolved charge, overdue, declaration to verify, quiet) and the endpoint
   * sorts by it. Render this array as it arrives — re-sorting client-side
   * silently discards the ranking, and an unresolved charge outranks an overdue
   * bill because the customer's money may already be gone.
   */
  items: BillNeedsAttentionData[];
  summary: BillAttentionSummary;
}

export interface SettlePeriodBillParams {
  method: SettlementMethod;
  currencyCode: string;
  reference?: string | null;
  destinationId?: number | null;
  notes?: string | null;
  proof?: File | null;
}

/**
 * Read the bearer token the way `lib/api/client.ts` and `services/uploadService.ts`
 * both do. Needed here because the comprobante is a byte stream: `api.get()`
 * parses JSON and returns `{}` for anything else, so it cannot carry the file.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('admin-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

export const PeriodBillService = {
  /**
   * Every bill that needs a person, across all accounts (staff only). The API
   * takes no page and no filter, and its ordering is the contract — see
   * {@link BillsNeedingAttention.items}.
   */
  async needsAttention(): Promise<BillsNeedingAttention> {
    const response = await api.get<Multiple<BillNeedsAttentionData>>(
      '/period-bills/needs-attention'
    );
    const extra = (response.extra ?? {}) as { summary?: BillAttentionSummary };

    return {
      items: response.items,
      summary: extra.summary ?? {},
    };
  },

  /** One bill with its lines and per-currency totals. Bound on `publicId`. */
  async getById(publicId: string): Promise<PeriodBillData> {
    const response = await api.get<Single<PeriodBillData>>(`/period-bills/${publicId}`);
    return response.item;
  },

  /**
   * Record a payment received elsewhere (admin only). Cash is admin-only by
   * the API's own allowlist — a customer cannot prove it.
   */
  async settle(publicId: string, data: SettlePeriodBillParams): Promise<PeriodBillData> {
    // Keys are camelCase: the api's request DTOs declare no input mapper, so
    // `SettlePeriodBillData::rules()` validates `currencyCode`/`destinationId`
    // verbatim. A snake_case key is silently dropped, not rejected.
    const formData = new FormData();
    formData.append('method', data.method);
    formData.append('currencyCode', data.currencyCode);
    if (data.reference) formData.append('reference', data.reference);
    if (data.destinationId != null) formData.append('destinationId', String(data.destinationId));
    if (data.notes) formData.append('notes', data.notes);
    if (data.proof) formData.append('proof', data.proof);

    const response = await api.postMultipart<Single<PeriodBillData>>(
      `/period-bills/${publicId}/settle`,
      formData
    );
    return response.item;
  },

  /** Confirm a declared transfer was found in the bank (admin only). */
  async approveDeclaration(publicId: string, notes: string | null): Promise<PeriodBillData> {
    const response = await api.post<Single<PeriodBillData>>(`/period-bills/${publicId}/approve`, {
      notes,
    });
    return response.item;
  },

  /**
   * Refuse a declared transfer (admin only). The reason is mandatory — it
   * reaches the customer in the declaration-resolved notification.
   */
  async rejectDeclaration(publicId: string, notes: string): Promise<PeriodBillData> {
    const response = await api.post<Single<PeriodBillData>>(`/period-bills/${publicId}/reject`, {
      notes,
    });
    return response.item;
  },

  /**
   * Fetch the comprobante as a blob.
   *
   * `PeriodBillData.proofUrl` names an **authenticated stream route**, not a
   * storage URL — handed to an `<img src>` or an `<a href>` the browser sends
   * no Authorization header and the API answers 401. So the bytes are pulled
   * here with the token attached and handed to the caller as an object URL.
   */
  async fetchProof(publicId: string): Promise<Blob> {
    const token = getToken();
    const response = await fetch(`${API_URL}/period-bills/${publicId}/proof`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to load proof (${response.status})`);
    }

    return response.blob();
  },
};
