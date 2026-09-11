import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { FileService } from '@/services/fileService';

export interface AuthorizedFile {
  /** An object URL for the fetched bytes — safe to hand to `<img>`, `<object>` or `<a download>`. */
  url: string | null;
  /** So a PDF is embedded rather than shown as a broken image. */
  contentType: string | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Load a file the api serves from an **authorized route** for display.
 *
 * Every stored-file url the api hands out — `proofUrl`, `podPhotoUrl`,
 * `podSignatureUrl`, `fileUrl`, and the invoice PDF route — names an endpoint
 * behind `auth:sanctum` on a disk with no public url, not a storage url.
 * Pointed at directly by `<img src>` or `<a href>` the browser sends no
 * Authorization header and the api answers 401, so nothing may put one of
 * these in the DOM. The bytes are fetched with the token attached here and
 * wrapped in an object URL instead.
 *
 * Keyed on the url itself and cached forever, so the same file rendered twice
 * on a page — a receipt thumbnail and then the same receipt opened full size —
 * is fetched once.
 *
 * @param url the authorized route, or null/undefined when there is no file to
 *            show yet. Nothing is fetched until it is a url, which is also how
 *            a caller defers the fetch until an operator asks to see the file.
 */
export function useAuthorizedFile(url: string | null | undefined): AuthorizedFile {
  const query = useQuery({
    queryKey: ['authorized-file', url ?? null],
    queryFn: () => FileService.fetchFile(url as string),
    enabled: Boolean(url),
    staleTime: Infinity,
  });

  // The whole query cache is persisted to localStorage app-wide (see
  // `providers/QueryProvider.tsx`), and `JSON.stringify` flattens a Blob to
  // `{}` because it has no enumerable own properties. A rehydrated entry
  // therefore reports success while holding nothing, and `staleTime: Infinity`
  // means nothing would ever refetch it. So the payload is checked rather than
  // trusted: handing `{}` to `createObjectURL` throws, and with no error
  // boundary anywhere under `app/` that takes down the whole order page.
  const blob = query.data instanceof Blob ? query.data : undefined;
  const restoredEmpty = query.data !== undefined && blob === undefined;
  const { refetch } = query;

  useEffect(() => {
    if (restoredEmpty) void refetch();
  }, [restoredEmpty, refetch]);

  // The URL is *derived* from the blob during render rather than pushed into
  // state from an effect: `react-hooks/set-state-in-effect` rejects the effect
  // form outright, and this matches `useBillProof`, which arrived first. The one
  // thing that genuinely belongs in an effect is releasing the URL, which is an
  // external resource with a lifetime — an object URL pins its blob for the life
  // of the tab until it is revoked.
  //
  // Known cost of that shape, measured rather than assumed: React does not
  // promise a `useMemo` factory runs once per committed render, and under Strict
  // Mode it deliberately runs it twice and keeps the first value — so a dev
  // render mints two URLs here and revokes one. A WeakMap keyed on the blob
  // would make the factory idempotent, but the same blob is shared by two
  // components (a thumbnail and the same receipt opened full size), so a shared
  // URL would need refcounting before either could revoke it.
  const objectUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    if (!objectUrl) return;

    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return {
    url: objectUrl,
    contentType: blob?.type ?? null,
    // `restoredEmpty` keeps the spinner up while a flattened cache entry is
    // refetched, instead of a frame reporting neither loading, nor an error, nor
    // a url — which every consumer renders as an empty box where the file goes.
    isLoading: query.isLoading || restoredEmpty,
    isError: query.isError,
  };
}
