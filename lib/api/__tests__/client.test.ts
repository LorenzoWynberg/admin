import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ApiError } from '../error';
import { api } from '../client';

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ logout }) },
}));

vi.mock('@/stores/useLangStore', () => ({
  useLangStore: { getState: () => ({ lang: 'es' }) },
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mandados.cr';

const fetchMock = vi.fn();

function ok(blob = new Blob(['bytes'], { type: 'image/png' })) {
  return { ok: true, status: 200, headers: new Headers(), blob: async () => blob };
}

function failure(status: number, body: unknown) {
  return {
    ok: false,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
  };
}

function headersOf(call: number): Record<string, string> {
  return fetchMock.mock.calls[call][1].headers as Record<string, string>;
}

beforeEach(() => {
  logout.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  window.localStorage.setItem(
    'admin-auth-storage',
    JSON.stringify({ state: { token: 'tok-123' } })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('api.getBlob — reading a file off an authorized route', () => {
  // The reason this exists at all: `get()` runs every body through
  // `handleResponse`, which returns `{}` for anything that is not JSON, so a
  // byte stream reaches the caller as an empty object.
  it('returns the bytes, which get() cannot carry at all', async () => {
    const bytes = new Blob(['%PDF'], { type: 'application/pdf' });
    fetchMock.mockResolvedValue(ok(bytes));

    await expect(api.getBlob('/invoices/inv-1/pdf')).resolves.toBe(bytes);
  });

  it('attaches the bearer token, which is the whole point', async () => {
    fetchMock.mockResolvedValue(ok());

    await api.getBlob('/invoices/inv-1/pdf');

    expect(headersOf(0).Authorization).toBe('Bearer tok-123');
  });

  it('resolves a bare path against the api root', async () => {
    fetchMock.mockResolvedValue(ok());

    await api.getBlob('/invoices/inv-1/pdf');

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/invoices/inv-1/pdf`);
  });

  // The api's stored-file accessors are built with Laravel's `route()`, which
  // is absolute. Prefixing the api root to one of those produces a doubled
  // address — `https://api.mandados.crhttps://…` — that resolves to nothing,
  // and it fails as a broken image rather than as an error anybody sees.
  it('leaves an absolute url from the api alone rather than prefixing it again', async () => {
    fetchMock.mockResolvedValue(ok());
    const route = 'http://api.mandados.test:60/payments/pay-1/proof';

    await api.getBlob(route);

    expect(fetchMock.mock.calls[0][0]).toBe(route);
  });

  // Laravel decides whether a failure renders as JSON or as an HTML error page
  // by reading the leading Accept type, so `application/json` has to come
  // first even though it is not what a successful response carries.
  it('asks for json first so that a failure is parseable', async () => {
    fetchMock.mockResolvedValue(ok());

    await api.getBlob('/invoices/inv-1/pdf');

    expect(headersOf(0).Accept).toBe('application/json, */*');
  });

  // A file that 403s because the policy refused is a different problem from one
  // that 404s because it was deleted, and an operator can only be told which if
  // the api's own message survives the trip.
  it('raises the api message as an ApiError rather than a bare status code', async () => {
    fetchMock.mockResolvedValue(failure(403, { message: 'This action is unauthorized.' }));

    await expect(api.getBlob('/payments/pay-1/proof')).rejects.toThrowError(
      expect.objectContaining({
        name: 'ApiError',
        status: 403,
        message: 'This action is unauthorized.',
      })
    );
  });

  it('clears the session on a 401, the same as any other request', async () => {
    fetchMock.mockResolvedValue(failure(401, { message: 'Unauthenticated.' }));

    await expect(api.getBlob('/payments/pay-1/proof')).rejects.toBeInstanceOf(ApiError);
    expect(logout).toHaveBeenCalled();
  });
});

// `uploadService.ts` and `chatService.ts` used to read the bearer token
// themselves for a raw multipart `fetch` — the only reason being that a
// binary/multipart request could not go through the shared client. Both now
// call `postMultipart()` directly instead of keeping their own copy, which
// makes token attachment here the one place a regression in either surfaces.
describe('api.postMultipart — the multipart call every FormData upload now goes through', () => {
  function okJson(body: unknown = { item: {} }) {
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => body,
    };
  }

  it('attaches the bearer token, the same as a JSON request', async () => {
    fetchMock.mockResolvedValue(okJson());

    await api.postMultipart('/upload/image', new FormData());

    expect(headersOf(0).Authorization).toBe('Bearer tok-123');
  });

  it('omits Content-Type so the browser sets the multipart boundary', async () => {
    fetchMock.mockResolvedValue(okJson());

    await api.postMultipart('/upload/image', new FormData());

    expect(headersOf(0)['Content-Type']).toBeUndefined();
  });

  it('sends no token when there is none, rather than a bare "Bearer"', async () => {
    window.localStorage.clear();
    fetchMock.mockResolvedValue(okJson());

    await api.postMultipart('/upload/image', new FormData());

    expect(headersOf(0).Authorization).toBeUndefined();
  });
});
