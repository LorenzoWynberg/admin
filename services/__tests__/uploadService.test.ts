import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UploadService } from '../uploadService';
import { api } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  api: {
    postMultipart: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UploadService.upload', () => {
  // Bearer-token attachment (when one exists) and the multipart headers live
  // once in `api.postMultipart()` — see `lib/api/__tests__/client.test.ts` —
  // so this only pins that `upload` is a pass-through to it with the file
  // under the `image` field and the route the api registers.
  it('sends the file under the image field to the shared client', async () => {
    vi.mocked(api.postMultipart).mockResolvedValue({ url: '/uploads/photo.png' });
    const file = new File(['bytes'], 'photo.png', { type: 'image/png' });

    const url = await UploadService.upload(file);

    expect(api.postMultipart).toHaveBeenCalledWith('/upload/image', expect.any(FormData));
    const formData = vi.mocked(api.postMultipart).mock.calls[0][1] as FormData;
    expect(formData.get('image')).toBe(file);
    expect(url).toBe('/uploads/photo.png');
  });
});
