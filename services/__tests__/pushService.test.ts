import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PushService } from '../pushService';
import { api } from '@/lib/api/client';
import { getMessagingIfConfigured } from '@/lib/firebase';
import { getToken, deleteToken } from 'firebase/messaging';

vi.mock('@/lib/api/client', () => ({
  api: { post: vi.fn(), destroy: vi.fn() },
}));

vi.mock('@/lib/firebase', () => ({
  getMessagingIfConfigured: vi.fn(),
  FIREBASE_VAPID_KEY: 'test-vapid-key',
}));

vi.mock('firebase/messaging', () => ({
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  onMessage: vi.fn(),
}));

const messagingStub = {} as never;

function stubNotification(permission: 'granted' | 'denied' | 'default') {
  vi.stubGlobal('Notification', {
    permission,
    requestPermission: vi.fn().mockResolvedValue(permission === 'default' ? 'granted' : permission),
  });
}

function stubServiceWorker() {
  vi.stubGlobal('navigator', {
    serviceWorker: { register: vi.fn().mockResolvedValue({ scope: '/' }) },
  });
}

describe('PushService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubServiceWorker();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('registerToken', () => {
    it('registers the FCM token with platform "web" when configured and permitted', async () => {
      vi.mocked(getMessagingIfConfigured).mockResolvedValue(messagingStub);
      vi.mocked(getToken).mockResolvedValue('fcm-abc');
      stubNotification('granted');

      await PushService.registerToken();

      expect(api.post).toHaveBeenCalledWith('/device-tokens', {
        token: 'fcm-abc',
        platform: 'web',
      });
    });

    it('no-ops when Firebase is not configured', async () => {
      vi.mocked(getMessagingIfConfigured).mockResolvedValue(null);
      stubNotification('granted');

      await PushService.registerToken();

      expect(api.post).not.toHaveBeenCalled();
    });

    it('no-ops when notification permission is denied', async () => {
      vi.mocked(getMessagingIfConfigured).mockResolvedValue(messagingStub);
      stubNotification('denied');

      await PushService.registerToken();

      expect(getToken).not.toHaveBeenCalled();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe('unregisterToken', () => {
    it('deletes the FCM token and removes it from the backend', async () => {
      vi.mocked(getMessagingIfConfigured).mockResolvedValue(messagingStub);
      vi.mocked(getToken).mockResolvedValue('fcm-abc');
      vi.mocked(deleteToken).mockResolvedValue(true);
      stubNotification('granted');

      await PushService.registerToken();
      await PushService.unregisterToken();

      expect(deleteToken).toHaveBeenCalled();
      expect(api.destroy).toHaveBeenCalledWith('/device-tokens', { token: 'fcm-abc' });
    });

    it('no-ops when no token has been registered', async () => {
      vi.mocked(getMessagingIfConfigured).mockResolvedValue(messagingStub);

      await PushService.unregisterToken();

      expect(api.destroy).not.toHaveBeenCalled();
    });
  });
});
