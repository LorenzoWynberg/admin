import { describe, it, expect } from 'vitest';
import { hasItem, hasItems, hasPagination, successBasic, toBasicSuccess } from '../http';

describe('http utils', () => {
  describe('hasItem', () => {
    it('returns true when response has a non-null item', () => {
      const response = { item: { id: 1 }, message: 'ok', status: 200, extra: {} };
      expect(hasItem(response)).toBe(true);
    });

    it('returns false when item is null', () => {
      const response = { item: null, message: 'ok', status: 200, extra: {} };
      expect(hasItem(response)).toBe(false);
    });

    it('returns false when item is undefined', () => {
      const response = { message: 'ok', status: 200, extra: {} };
      expect(hasItem(response)).toBe(false);
    });

    it('returns false for basic success response', () => {
      const response = { message: 'ok', status: 200, extra: {} };
      expect(hasItem(response)).toBe(false);
    });
  });

  describe('hasItems', () => {
    it('returns true when response has non-empty items array', () => {
      const response = {
        items: [{ id: 1 }, { id: 2 }],
        message: 'ok',
        status: 200,
        extra: {},
      };
      expect(hasItems(response)).toBe(true);
    });

    it('returns false when items array is empty', () => {
      const response = { items: [], message: 'ok', status: 200, extra: {} };
      expect(hasItems(response)).toBe(false);
    });

    it('returns false when items is undefined', () => {
      const response = { message: 'ok', status: 200, extra: {} };
      expect(hasItems(response)).toBe(false);
    });

    it('returns false when items is not an array', () => {
      const response = { items: 'not-array', message: 'ok', status: 200, extra: {} };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(hasItems(response as any)).toBe(false);
    });
  });

  describe('hasPagination', () => {
    it('returns true for paginated response with meta', () => {
      const response = {
        items: [],
        meta: { total: 10, currentPage: 1, lastPage: 2, perPage: 5 },
        message: 'ok',
        status: 200,
        extra: {},
      };
      expect(hasPagination(response)).toBe(true);
    });

    it('returns false when meta is missing', () => {
      const response = { items: [], message: 'ok', status: 200, extra: {} };
      expect(hasPagination(response)).toBe(false);
    });

    it('returns false when meta is incomplete', () => {
      const response = {
        items: [],
        meta: { total: 10 },
        message: 'ok',
        status: 200,
        extra: {},
      };
      expect(hasPagination(response)).toBe(false);
    });
  });

  describe('successBasic', () => {
    it('creates a basic success response with defaults', () => {
      const result = successBasic();
      expect(result).toEqual({ message: '', status: 200, extra: {} });
    });

    it('creates a basic success response with custom values', () => {
      const result = successBasic('Created', { id: 1 }, 201);
      expect(result).toEqual({ message: 'Created', status: 201, extra: { id: 1 } });
    });
  });

  describe('toBasicSuccess', () => {
    it('converts single item response to basic success', () => {
      const response = {
        item: { id: 1 },
        message: 'Found',
        status: 200,
        extra: { cached: true },
      };
      const result = toBasicSuccess(response);
      expect(result).toEqual({ message: 'Found', status: 200, extra: { cached: true } });
      expect(result).not.toHaveProperty('item');
    });

    it('converts paginated response to basic success', () => {
      const response = {
        items: [{ id: 1 }],
        meta: { total: 1, currentPage: 1, lastPage: 1, perPage: 10 },
        message: 'Listed',
        status: 200,
        extra: {},
      };
      const result = toBasicSuccess(response);
      expect(result).toEqual({ message: 'Listed', status: 200, extra: {} });
      expect(result).not.toHaveProperty('items');
      expect(result).not.toHaveProperty('meta');
    });
  });
});
