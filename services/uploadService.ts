import { api } from '@/lib/api/client';

export const UploadService = {
  /**
   * `upload/image` is a public route (needed during registration before an
   * auth token exists) that also accepts an authenticated call, so this goes
   * through the shared client's `postMultipart()` rather than a bespoke
   * fetch: it already attaches the bearer token when one is present and
   * omits it otherwise, which is exactly this endpoint's contract.
   */
  async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.postMultipart<{ url: string }>('/upload/image', formData);
    return response.url;
  },
};
