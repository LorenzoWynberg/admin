import { api } from '@/lib/api/client';
import { Enums } from '@/data/app-enums';

type PaymentDestinationData = App.Data.PaymentDestination.PaymentDestinationData;
type StorePaymentDestinationData = App.Data.PaymentDestination.StorePaymentDestinationData;
type UpdatePaymentDestinationData = App.Data.PaymentDestination.UpdatePaymentDestinationData;
type Paginated<T> = Api.Response.Paginated<T>;
type Single<T> = Api.Response.Single<T>;

/**
 * The only two settlement methods a destination can exist for.
 *
 * Card and cash never carry one and credit never leaves the system, which is
 * why `StorePaymentDestinationData`'s `Rule::in()` admits exactly these two and
 * why every other field on a destination is `prohibited` under any other
 * method. Stated once here because two surfaces need it: the form that creates
 * a destination, and the settle dialog that decides whether to offer one at all.
 */
export const DESTINATION_METHODS: string[] = [
  Enums.SettlementMethod.SinpeMobile,
  Enums.SettlementMethod.Transferencia,
];

/**
 * Where a customer is told to send money — several SINPE Móvil numbers,
 * several bank accounts. Read by staff, written by admins.
 *
 * `method` is absent from the update payload on purpose: it decides which
 * other fields a row may carry, so swapping it in place would leave a
 * destination holding the wrong method's fields. Changing a method means
 * deactivating the row and creating a new one.
 */
export const PaymentDestinationService = {
  /**
   * Every destination, active and deactivated alike.
   *
   * The api paginates this at a **fixed 15** and reads no `per_page`, so the
   * pages are walked here rather than truncated: deactivated rows are kept
   * forever (a bill's history must stay readable) and would eventually push
   * live destinations off page one.
   */
  async list(): Promise<PaymentDestinationData[]> {
    const items: PaymentDestinationData[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = await api.get<Paginated<PaymentDestinationData>>(
        `/payment-destinations?page=${page}`
      );
      items.push(...response.items);
      lastPage = response.meta?.lastPage ?? 1;
      page += 1;
    } while (page <= lastPage);

    return items;
  },

  async create(data: StorePaymentDestinationData): Promise<PaymentDestinationData> {
    const response = await api.post<Single<PaymentDestinationData>>('/payment-destinations', data);
    return response.item;
  },

  async update(id: number, data: UpdatePaymentDestinationData): Promise<PaymentDestinationData> {
    const response = await api.patch<Single<PaymentDestinationData>>(
      `/payment-destinations/${id}`,
      data
    );
    return response.item;
  },

  /**
   * Soft-delete a destination. A bill records the destination it showed as a
   * snapshot rather than a foreign key, so removing a row never rewrites a
   * bill's history — but deactivating is still the ordinary move, because a
   * deactivated row stays visible to whoever is reading old bills.
   */
  async destroy(id: number): Promise<void> {
    await api.destroy<Api.Response.SuccessBasic>(`/payment-destinations/${id}`);
  },
};
