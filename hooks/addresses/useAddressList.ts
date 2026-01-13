import { useQuery } from '@tanstack/react-query';
import { AddressService } from '@/services/addressService';

interface UseAddressListParams {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

export function useAddressList(params: UseAddressListParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['addresses', 'list', queryParams],
    queryFn: () => AddressService.list(queryParams),
    enabled,
  });
}
