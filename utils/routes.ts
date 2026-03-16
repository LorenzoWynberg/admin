import { Enums } from '@/data/app-enums';

type OrderStopData = App.Data.Order.OrderStopData;
type AddressData = App.Data.Address.AddressData;

/**
 * Resolve the address for a route/unassigned stop.
 *
 * When `orderStopId` is provided, matches the exact order stop first.
 * Falls back to type-based matching, then `order.deliveryAddress` for dropoffs.
 */
export function resolveStopAddress(
  stopType: string,
  orderStops: OrderStopData[],
  deliveryAddress: AddressData | undefined | null,
  orderStopId?: number | null
): AddressData | undefined {
  const match = orderStopId
    ? orderStops.find((s) => s.id === orderStopId)
    : orderStops.find((s) => (s.type as string) === stopType);
  return (
    match?.address ??
    (stopType === Enums.RouteStopType.DROPOFF ? (deliveryAddress ?? undefined) : undefined)
  );
}
