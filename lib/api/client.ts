import { useAuthStore } from '@/stores/useAuthStore';
import { useLangStore } from '@/stores/useLangStore';

import { ApiError, parseErrorResponse } from './error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mandados.cr';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Absolute urls pass through untouched; anything else resolves against the api
 * root.
 *
 * The api's stored-file accessors — `proofUrl`, `podPhotoUrl`,
 * `podSignatureUrl`, `fileUrl` — are built with Laravel's `route()` helper and
 * therefore already carry a scheme and a host. Prefixing `API_URL` to one of
 * those would produce a doubled address that resolves to nothing.
 */
function resolveUrl(endpoint: string): string {
  return /^https?:\/\//i.test(endpoint) ? endpoint : `${API_URL}${endpoint}`;
}

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('admin-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Get current language from store
 */
function getLang(): string {
  return useLangStore.getState().lang ?? 'en';
}

/**
 * Build request options with auth headers
 */
function buildRequestOptions(
  method: RequestMethod,
  body?: unknown,
  options: FetchOptions = {}
): RequestInit {
  const token = getToken();
  const lang = getLang();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': lang,
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestInit: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (options.signal) {
    requestInit.signal = options.signal;
  }

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  return requestInit;
}

/**
 * Build request options for a multipart/form-data body. Omits Content-Type
 * so the browser sets the correct `multipart/form-data; boundary=...` value.
 */
function buildMultipartRequestOptions(formData: FormData, options: FetchOptions = {}): RequestInit {
  const token = getToken();
  const lang = getLang();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': lang,
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestInit: RequestInit = {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  };

  if (options.signal) {
    requestInit.signal = options.signal;
  }

  return requestInit;
}

function isJsonResponse(response: Response): boolean {
  return response.headers.get('content-type')?.includes('application/json') ?? false;
}

/**
 * Raise a failed response as an `ApiError`, clearing auth state on a 401.
 *
 * Shared by every reader of a response, JSON and binary alike, so that a file
 * request which 401s logs the operator out and surfaces the api's own message
 * exactly as a JSON one does — rather than a bare status code with no account
 * of whether the session died or the policy said no.
 */
async function throwApiError(response: Response): Promise<never> {
  // Clear auth state on 401 Unauthorized
  if (response.status === 401) {
    useAuthStore.getState().logout();
    // Clear auth cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; max-age=0';
      // Redirect to login
      window.location.href = '/login';
    }
  }

  let errorData: unknown = null;
  if (isJsonResponse(response)) {
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse error
    }
  }

  const parsed = parseErrorResponse(errorData);
  throw new ApiError(parsed.message, response.status, {
    details: parsed.details,
    errors: parsed.errors,
    extra: parsed.extra,
    raw: errorData,
  });
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await throwApiError(response);
  }

  if (!isJsonResponse(response)) {
    return {} as T;
  }

  return response.json();
}

/**
 * API client with typed methods
 */
export const api = {
  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('GET', undefined, options));
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('POST', body, options));
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('PUT', body, options));
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('PATCH', body, options));
    return handleResponse<T>(response);
  },

  async destroy<T>(endpoint: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('DELETE', body, options));
    return handleResponse<T>(response);
  },

  /**
   * POST a multipart/form-data body (e.g. file uploads). Bypasses the JSON
   * `post()` above, which always JSON.stringifies and sets Content-Type.
   */
  async postMultipart<T>(
    endpoint: string,
    formData: FormData,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildMultipartRequestOptions(formData, options));
    return handleResponse<T>(response);
  },

  /**
   * GET a file as raw bytes.
   *
   * `get()` cannot carry one: `handleResponse` returns `{}` for any non-JSON
   * body, so a byte stream reaches the caller as an empty object. And the
   * files this exists for — payment proofs, POD photos and signatures, receipt
   * files, invoice PDFs — are served by authorized routes off a private disk,
   * so they cannot be pointed at from an `<img src>` or an `<a href>` either:
   * the browser sends no Authorization header there and the api answers 401.
   *
   * So the bytes are pulled here with the token attached. Wrap them in an
   * object URL to render them — `useAuthorizedFile` does exactly that, and
   * revokes it, which is what callers should reach for rather than this.
   */
  async getBlob(endpoint: string, options: FetchOptions = {}): Promise<Blob> {
    const response = await fetch(
      resolveUrl(endpoint),
      // `application/json` is not what comes back on success, but it has to
      // stay first in the list: Laravel reads the leading type to decide
      // whether a *failure* is rendered as JSON, and that is what lets
      // `throwApiError` report the api's message instead of an HTML page.
      buildRequestOptions('GET', undefined, {
        ...options,
        headers: { Accept: 'application/json, */*', ...options.headers },
      })
    );

    if (!response.ok) {
      await throwApiError(response);
    }

    return response.blob();
  },
};

export type { FetchOptions };
