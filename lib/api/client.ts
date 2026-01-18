import { useAuthStore } from '@/stores/useAuthStore';

import { ApiError, parseErrorResponse } from './error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.mandados.test:60';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
 * Build request options with auth headers
 */
function buildRequestOptions(
  method: RequestMethod,
  body?: unknown,
  options: FetchOptions = {}
): RequestInit {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    // Clear auth state on 401 Unauthorized
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }

    let errorData: unknown = null;
    if (isJson) {
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

  if (!isJson) {
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

  async destroy<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, buildRequestOptions('DELETE', undefined, options));
    return handleResponse<T>(response);
  },
};

export type { FetchOptions };
