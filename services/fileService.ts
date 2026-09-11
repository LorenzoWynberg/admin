import { api } from '@/lib/api/client';

export const FileService = {
  /**
   * Fetch a file the api serves from an **authorized route**.
   *
   * Every stored-file url the api hands out — `proofUrl`, `podPhotoUrl`,
   * `podSignatureUrl`, `fileUrl`, and the invoice PDF route — names an endpoint
   * behind `auth:sanctum` on a disk with no public url. Pointed at directly by
   * `<img src>` or `<a href>` the browser sends no Authorization header and the
   * api answers 401, so the bytes have to be pulled with the token attached.
   *
   * Deliberately takes the whole url rather than a domain id: the api already
   * named the address on the record, and there is nothing per-domain left to
   * shape. `useAuthorizedFile` wraps the result in an object URL.
   */
  async fetchFile(url: string): Promise<Blob> {
    return api.getBlob(url);
  },
};
