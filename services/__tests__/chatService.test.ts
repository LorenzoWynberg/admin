import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ChatService } from '../chatService';
import { api } from '@/lib/api/client';
import { Enums } from '@/data/app-enums';

type OrderMessageData = App.Data.Chat.OrderMessageData;

vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    postMultipart: vi.fn(),
  },
}));

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, deliberately not assignable to each
// other — production code never needs the bridge, only this fixture does.
function message(overrides: Partial<OrderMessageData> = {}): OrderMessageData {
  return {
    id: 1,
    orderId: 10,
    businessId: null,
    userId: 5,
    channel: Enums.ChatChannel.Support as App.Enums.ChatChannel,
    body: 'hi',
    imageUrl: null,
    createdAt: '2026-09-10T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ChatService.sendMessage', () => {
  // Bearer-token attachment and the multipart headers live once in
  // `api.postMultipart()` — see `lib/api/__tests__/client.test.ts` — so this
  // only pins that `sendMessage` is a pass-through to it with the right
  // fields and route, and unwraps the `item` envelope.
  it('sends body and image under their form fields and returns the item', async () => {
    const item = message({ body: 'hello there' });
    vi.mocked(api.postMultipart).mockResolvedValue({ item });
    const image = new File(['bytes'], 'photo.png', { type: 'image/png' });

    const result = await ChatService.sendMessage('order-1', 'support', {
      body: 'hello there',
      image,
    });

    expect(api.postMultipart).toHaveBeenCalledWith(
      '/orders/order-1/chat/support',
      expect.any(FormData)
    );
    const formData = vi.mocked(api.postMultipart).mock.calls[0][1] as FormData;
    expect(formData.get('body')).toBe('hello there');
    expect(formData.get('image')).toBe(image);
    expect(result).toBe(item);
  });

  it('omits an absent body or image rather than sending an empty field', async () => {
    vi.mocked(api.postMultipart).mockResolvedValue({ item: message() });

    await ChatService.sendMessage('order-1', 'support', {});

    const formData = vi.mocked(api.postMultipart).mock.calls[0][1] as FormData;
    expect(formData.has('body')).toBe(false);
    expect(formData.has('image')).toBe(false);
  });
});
