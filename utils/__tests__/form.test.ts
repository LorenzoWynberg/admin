import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyApiErrorsToForm, getFieldError, hasValidationErrors } from '../form';
import { ApiError } from '@/lib/api/error';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('form utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyApiErrorsToForm', () => {
    it('applies field errors from ApiError to form', () => {
      const setError = vi.fn();
      const error = new ApiError('Validation failed', 422, {
        errors: {
          email: ['Email is required', 'Email must be valid'],
          name: ['Name is required'],
        },
      });

      const result = applyApiErrorsToForm(error, setError);

      expect(setError).toHaveBeenCalledTimes(2);
      expect(setError).toHaveBeenCalledWith('email', {
        type: 'server',
        message: 'Email is required\nEmail must be valid',
      });
      expect(setError).toHaveBeenCalledWith('name', {
        type: 'server',
        message: 'Name is required',
      });
      expect(result.appliedFieldErrors).toBe(true);
    });

    it('maps API field names to form field names', () => {
      const setError = vi.fn();
      const error = new ApiError('Validation failed', 422, {
        errors: {
          from_name: ['From name is required'],
          to_name: ['To name is required'],
        },
      });

      applyApiErrorsToForm(error, setError, {
        from_name: 'fromName',
        to_name: 'toName',
      });

      expect(setError).toHaveBeenCalledWith('fromName', expect.any(Object));
      expect(setError).toHaveBeenCalledWith('toName', expect.any(Object));
    });

    it('shows toast for non-ApiError', async () => {
      const { toast } = await import('sonner');
      const setError = vi.fn();
      const error = new Error('Network error');

      const result = applyApiErrorsToForm(error, setError);

      expect(toast.error).toHaveBeenCalledWith('An error occurred');
      expect(result.appliedFieldErrors).toBe(false);
      expect(result.showedToast).toBe(true);
    });

    it('shows toast for server errors (500)', async () => {
      const { toast } = await import('sonner');
      const setError = vi.fn();
      const error = new ApiError('Internal server error', 500);

      applyApiErrorsToForm(error, setError);

      expect(toast.error).toHaveBeenCalledWith('Internal server error', { description: undefined });
    });

    it('includes details in toast when available', async () => {
      const { toast } = await import('sonner');
      const setError = vi.fn();
      const error = new ApiError('Error', 500, { details: 'Something went wrong' });

      applyApiErrorsToForm(error, setError);

      expect(toast.error).toHaveBeenCalledWith('Error', { description: 'Something went wrong' });
    });
  });

  describe('getFieldError', () => {
    it('returns first error message for a field', () => {
      const error = new ApiError('Validation failed', 422, {
        errors: {
          email: ['Email is required', 'Email must be valid'],
        },
      });

      expect(getFieldError(error, 'email')).toBe('Email is required');
    });

    it('returns undefined for non-existent field', () => {
      const error = new ApiError('Validation failed', 422, {
        errors: {
          email: ['Email is required'],
        },
      });

      expect(getFieldError(error, 'name')).toBeUndefined();
    });

    it('returns undefined for non-ApiError', () => {
      const error = new Error('Network error');
      expect(getFieldError(error, 'email')).toBeUndefined();
    });
  });

  describe('hasValidationErrors', () => {
    it('returns true when ApiError has field errors', () => {
      const error = new ApiError('Validation failed', 422, {
        errors: { email: ['Required'] },
      });
      expect(hasValidationErrors(error)).toBe(true);
    });

    it('returns false when ApiError has no errors', () => {
      const error = new ApiError('Server error', 500);
      expect(hasValidationErrors(error)).toBe(false);
    });

    it('returns false when errors object is empty', () => {
      const error = new ApiError('Error', 422, { errors: {} });
      expect(hasValidationErrors(error)).toBe(false);
    });

    it('returns false for non-ApiError', () => {
      const error = new Error('Network error');
      expect(hasValidationErrors(error)).toBe(false);
    });
  });
});
