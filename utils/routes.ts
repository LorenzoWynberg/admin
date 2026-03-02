import { Enums } from '@/data/app-enums';

type OrderStopData = App.Data.Order.OrderStopData;
type AddressData = App.Data.Address.AddressData;

/**
 * Resolve the address for a route/unassigned stop by matching its type
 * against the order's stops. Falls back to `order.deliveryAddress` for dropoffs.
 */
export function resolveStopAddress(
  stopType: string,
  orderStops: OrderStopData[],
  deliveryAddress: AddressData | undefined | null
): AddressData | undefined {
  const match = orderStops.find((s) => (s.type as string) === stopType);
  return (
    match?.address ??
    (stopType === Enums.RouteStopType.DROPOFF ? (deliveryAddress ?? undefined) : undefined)
  );
}
