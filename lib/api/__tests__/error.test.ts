import { describe, it, expect } from 'vitest';
import { ApiError, isApiError, parseErrorResponse } from '../error';

describe('ApiError', () => {
  describe('constructor', () => {
    it('creates an ApiError with message and status', () => {
      const error = new ApiError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
      expect(error.name).toBe('ApiError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });

    it('creates an ApiError with all options', () => {
      const error = new ApiError('Validation failed', 422, {
        details: 'Check your input',
        errors: { email: ['Email is required'] },
        extra: { requestId: '123' },
        raw: { original: 'response' },
      });

      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(422);
      expect(error.details).toBe('Check your input');
      expect(error.errors).toEqual({ email: ['Email is required'] });
      expect(error.extra).toEqual({ requestId: '123' });
      expect(error.raw).toEqual({ original: 'response' });
    });

    it('handles undefined options', () => {
      const error = new ApiError('Error', 500);

      expect(error.details).toBeUndefined();
      expect(error.errors).toBeUndefined();
      expect(error.extra).toBeUndefined();
      expect(error.raw).toBeUndefined();
    });
  });

  describe('isApiError', () => {
    it('returns true for ApiError instances', () => {
      const error = new ApiError('Error', 500);
      expect(isApiError(error)).toBe(true);
    });

    it('returns false for regular Error', () => {
      const error = new Error('Error');
      expect(isApiError(error)).toBe(false);
    });

    it('returns false for non-error objects', () => {
      expect(isApiError({ message: 'Error', status: 500 })).toBe(false);
      expect(isApiError('error')).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe('parseErrorResponse', () => {
    it('parses a valid error response object', () => {
      const response = {
        message: 'Validation failed',
        details: 'Check your input',
        errors: { email: ['Required'] },
        extra: { requestId: '123' },
      };

      const result = parseErrorResponse(response);

      expect(result.message).toBe('Validation failed');
      expect(result.details).toBe('Check your input');
      expect(result.errors).toEqual({ email: ['Required'] });
      expect(result.extra).toEqual({ requestId: '123' });
    });

    it('returns default message for empty object', () => {
      const result = parseErrorResponse({});
      expect(result.message).toBe('An error occurred');
    });

    it('returns default message for null', () => {
      const result = parseErrorResponse(null);
      expect(result.message).toBe('An error occurred');
    });

    it('returns default message for non-object', () => {
      expect(parseErrorResponse('error').message).toBe('An error occurred');
      expect(parseErrorResponse(123).message).toBe('An error occurred');
      expect(parseErrorResponse(undefined).message).toBe('An error occurred');
    });

    it('handles partial response objects', () => {
      const result = parseErrorResponse({ message: 'Error' });

      expect(result.message).toBe('Error');
      expect(result.details).toBeUndefined();
      expect(result.errors).toBeUndefined();
      expect(result.extra).toBeUndefined();
    });

    it('ignores non-string message', () => {
      const result = parseErrorResponse({ message: 123 });
      expect(result.message).toBe('An error occurred');
    });

    it('ignores non-string details', () => {
      const result = parseErrorResponse({ message: 'Error', details: 123 });
      expect(result.message).toBe('Error');
      expect(result.details).toBeUndefined();
    });
  });
});
