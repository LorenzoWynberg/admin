'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type Echo from 'laravel-echo';
import { useAuthStore } from '@/stores/useAuthStore';
import { createEcho } from '@/lib/echo';
import { useCatalogBroadcast } from '@/hooks/catalogs';
import { useNotificationBroadcast } from '@/hooks/notifications';

const EchoContext = createContext<Echo<'reverb'> | null>(null);

export function useEcho() {
  return useContext(EchoContext);
}

interface EchoProviderProps {
  children: ReactNode;
}

/** Inner component that subscribes to broadcasts after context is available */
function EchoBroadcasts({ children }: { children: ReactNode }) {
  useCatalogBroadcast();
  useNotificationBroadcast();
  return <>{children}</>;
}

// Store for managing echo instance outside React's render cycle
type EchoStore = {
  instance: Echo<'reverb'> | null;
  token: string | null;
  listeners: Set<() => void>;
};

const echoStore: EchoStore = {
  instance: null,
  token: null,
  listeners: new Set(),
};

function getEchoSnapshot() {
  return echoStore.instance;
}

function subscribeToEcho(callback: () => void) {
  echoStore.listeners.add(callback);
  return () => echoStore.listeners.delete(callback);
}

function updateEchoInstance(token: string | null) {
  if (echoStore.token === token && echoStore.instance) {
    return; // No change needed
  }

  // Disconnect old instance
  echoStore.instance?.disconnect();

  // Create new instance
  echoStore.instance = createEcho(token);
  echoStore.token = token;

  // Notify listeners
  echoStore.listeners.forEach((listener) => listener());
}

export function EchoProvider({ children }: EchoProviderProps) {
  const token = useAuthStore((state) => state.token);
  const initializedRef = useRef<boolean | null>(null);

  // Initialize on first render (synchronously, before effects)
  // Using null check pattern as required by React rules
  if (initializedRef.current === null) {
    initializedRef.current = true;
    updateEchoInstance(token);
  }

  // Update when token changes
  useEffect(() => {
    updateEchoInstance(token);
  }, [token]);

  // Subscribe to store changes
  const echo = useSyncExternalStore(subscribeToEcho, getEchoSnapshot, getEchoSnapshot);

  return (
    <EchoContext.Provider value={echo}>
      <EchoBroadcasts>{children}</EchoBroadcasts>
    </EchoContext.Provider>
  );
}
