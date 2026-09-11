import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { PeriodBillService } from '@/services/periodBillService';

export interface BillProof {
  /** An object URL for the fetched bytes — safe to hand to `<img>` or `<object>`. */
  url: string | null;
  /** So a PDF comprobante can be embedded rather than shown as a broken image. */
  contentType: string | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Load a bill's comprobante for display.
 *
 * `PeriodBillData.proofUrl` is an **authenticated stream route**, not a
 * storage URL: pointed at directly by `<img src>` or `<a href>` the browser
 * sends no Authorization header and the api answers 401. So the bytes are
 * fetched with the token attached and wrapped in an object URL here.
 *
 * The URL is *derived* from the blob during render rather than pushed into
 * state from an effect — an effect that calls `setState` synchronously
 * cascades a second render, and there is nothing here to synchronize *into*
 * React. The one thing that genuinely belongs in an effect is releasing the
 * URL, which is an external resource with a lifetime.
 *
 * @param publicId the bill's public id
 * @param enabled  false while the viewer is closed, so nothing is fetched
 *                 until an operator asks to see it
 */
export function useBillProof(publicId: string, enabled: boolean): BillProof {
  const query = useQuery({
    // Deliberately OUTSIDE the ['period-bills'] prefix. The bytes are
    // immutable content addressed by bill id, not part of the bill's mutable
    // state, and under that prefix every settle/approve/reject invalidation
    // matched it — re-fetching the whole comprobante, and churning its object
    // URL, whenever an act landed while the viewer was open.
    queryKey: ['period-bill-proof', publicId],
    queryFn: () => PeriodBillService.fetchProof(publicId),
    enabled: enabled && publicId !== '',
    staleTime: Infinity,
  });

  const blob = query.data;
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    if (!url) return;

    return () => URL.revokeObjectURL(url);
  }, [url]);

  return {
    url,
    contentType: blob?.type ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
