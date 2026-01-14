/**
 * API Error class for handling API responses
 * Replicates the pattern from the mobile app
 */
export class ApiError extends Error {
  status: number;
  details?: string;
  errors?: Record<string, string[]>;
  extra?: Record<string, unknown>;
  raw?: unknown;

  constructor(
    message: string,
    status: number,
    options?: {
      details?: string;
      errors?: Record<string, string[]>;
      extra?: Record<string, unknown>;
      raw?: unknown;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = options?.details;
    this.errors = options?.errors;
    this.extra = options?.extra;
    this.raw = options?.raw;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Parse error response from API
 */
export function parseErrorResponse(response: unknown): {
  message: string;
  details?: string;
  errors?: Record<string, string[]>;
  extra?: Record<string, unknown>;
} {
  if (typeof response === 'object' && response !== null) {
    const res = response as Record<string, unknown>;
    return {
      message: typeof res.message === 'string' ? res.message : 'An error occurred',
      details: typeof res.details === 'string' ? res.details : undefined,
      errors: res.errors as Record<string, string[]> | undefined,
      extra: res.extra as Record<string, unknown> | undefined,
    };
  }
  return { message: 'An error occurred' };
}
