import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useNeedsAttentionBroadcast } from '../useNeedsAttentionBroadcast';

// A minimal stand-in for the laravel-echo private channel this hook talks to:
// `.private('admin')` always returns the same channel object, `.listen`
// captures the handler so a test can fire it directly, and `.stopListening`
// is a spy the unmount assertion reads.
function makeChannel() {
  return {
    listen: vi.fn((_event: string, handler: () => void) => {
      capturedHandler = handler;
    }),
    stopListening: vi.fn(),
  };
}

let channel: ReturnType<typeof makeChannel>;
let capturedHandler: (() => void) | undefined;
let echoInstance: { private: ReturnType<typeof vi.fn> } | null;

vi.mock('@/providers/EchoProvider', () => ({
  useEcho: () => echoInstance,
}));

// The wrapper reads the client from this module-scope binding rather than a
// closed-over constant, so a test can swap which QueryClient is in context
// between renders without unmounting the tree — the only way to exercise the
// hook's `queryClientRef` guard against re-subscribing on that change.
let currentClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={currentClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  channel = makeChannel();
  capturedHandler = undefined;
  echoInstance = { private: vi.fn(() => channel) };
  currentClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe('useNeedsAttentionBroadcast', () => {
  it('invalidates the bills queue key alongside both existing orders keys', () => {
    const invalidateSpy = vi.spyOn(currentClient, 'invalidateQueries');

    renderHook(() => useNeedsAttentionBroadcast(), { wrapper });

    expect(capturedHandler).toBeInstanceOf(Function);
    capturedHandler!();

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        ['orders', 'needs-attention'],
        ['orders', 'pending-reconciliation'],
        ['period-bills', 'needs-attention'],
      ])
    );
    expect(invalidatedKeys).toHaveLength(3);
  });

  it('unsubscribes from the admin channel on unmount', () => {
    const { unmount } = renderHook(() => useNeedsAttentionBroadcast(), { wrapper });

    expect(channel.stopListening).not.toHaveBeenCalled();

    unmount();

    expect(channel.stopListening).toHaveBeenCalledWith('.needs-attention.changed');
  });

  it('does not resubscribe when the queryClient reference changes', () => {
    const { rerender } = renderHook(() => useNeedsAttentionBroadcast(), { wrapper });

    expect(echoInstance!.private).toHaveBeenCalledTimes(1);

    // Swap the client in context without changing `echo` — the effect that
    // subscribes depends only on `[echo]`, so this must not re-subscribe.
    currentClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const newInvalidateSpy = vi.spyOn(currentClient, 'invalidateQueries');
    rerender();

    expect(echoInstance!.private).toHaveBeenCalledTimes(1);

    // The ref still forwards the latest client to the handler captured on the
    // original subscription.
    capturedHandler!();
    expect(newInvalidateSpy).toHaveBeenCalled();
  });

  it('does nothing when no echo instance is available yet', () => {
    echoInstance = null;

    expect(() => renderHook(() => useNeedsAttentionBroadcast(), { wrapper })).not.toThrow();
    expect(capturedHandler).toBeUndefined();
  });
});
