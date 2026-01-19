import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../notificationService';
import { api } from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    destroy: vi.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('fetches notifications without params', async () => {
      const mockResponse = {
        items: [],
        meta: { total: 0, currentPage: 1 },
        extra: { unread_count: 0 },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await NotificationService.list();

      expect(api.get).toHaveBeenCalledWith('/notifications');
      expect(result).toEqual(mockResponse);
    });

    it('builds query params for unreadOnly', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ unreadOnly: true });

      expect(api.get).toHaveBeenCalledWith('/notifications?unread_only=true');
    });

    it('builds query params for pagination', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ page: 2, perPage: 10 });

      expect(api.get).toHaveBeenCalledWith('/notifications?per_page=10&page=2');
    });

    it('builds query params for search', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ search: 'catalog' });

      expect(api.get).toHaveBeenCalledWith('/notifications?search=catalog');
    });

    it('builds query params for model filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ model: 'Catalog' });

      expect(api.get).toHaveBeenCalledWith('/notifications?model=Catalog');
    });

    it('builds query params for action filter', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ action: 'created' });

      expect(api.get).toHaveBeenCalledWith('/notifications?action=created');
    });

    it('builds query params for status filter (unread)', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ status: 'unread' });

      expect(api.get).toHaveBeenCalledWith('/notifications?status=unread');
    });

    it('builds query params for status filter (read)', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ status: 'read' });

      expect(api.get).toHaveBeenCalledWith('/notifications?status=read');
    });

    it('builds query params for date range', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({ fromDate: '2026-01-01', toDate: '2026-01-19' });

      expect(api.get).toHaveBeenCalledWith(
        '/notifications?from_date=2026-01-01&to_date=2026-01-19'
      );
    });

    it('builds query params with multiple filters', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [], meta: {}, extra: { unread_count: 0 } });

      await NotificationService.list({
        unreadOnly: true,
        search: 'test',
        model: 'Catalog',
        action: 'updated',
        page: 1,
        perPage: 20,
      });

      const calledUrl = vi.mocked(api.get).mock.calls[0][0];
      expect(calledUrl).toContain('unread_only=true');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('model=Catalog');
      expect(calledUrl).toContain('action=updated');
      expect(calledUrl).toContain('per_page=20');
      expect(calledUrl).toContain('page=1');
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      vi.mocked(api.post).mockResolvedValue(undefined);

      await NotificationService.markAsRead('notification-123');

      expect(api.post).toHaveBeenCalledWith('/notifications/notification-123/read');
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      vi.mocked(api.post).mockResolvedValue(undefined);

      await NotificationService.markAllAsRead();

      expect(api.post).toHaveBeenCalledWith('/notifications/read-all');
    });
  });

  describe('delete', () => {
    it('deletes a notification', async () => {
      vi.mocked(api.destroy).mockResolvedValue(undefined);

      await NotificationService.delete('notification-456');

      expect(api.destroy).toHaveBeenCalledWith('/notifications/notification-456');
    });
  });
});
