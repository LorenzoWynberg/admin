'use client';

import i18next from '@/config/i18next';
import { useEffect, useRef } from 'react';
import { useLang } from '@/hooks/useLang';

export const useFetchVersions = () => {
  const Lang = useLang();
  const hydrated = Lang.hydrated;
  const setVersions = Lang.setVersions;

  const prevVersionsRef = useRef<unknown>(null);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!i18next.isInitialized) {
      return;
    }

    let cancelled = false;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const refreshBundlesManually = async () => {
      const lng = i18next.language || 'en';
      const ns = Array.isArray(i18next.options?.ns)
        ? (i18next.options!.ns as string[])
        : [(i18next.options?.defaultNS as string) || 'translation'];

      await Promise.all(
        ns.map(async (n) => {
          const resp = await fetch(`${backendUrl}/locales/${lng}/${n}.json?ts=${Date.now()}`);
          if (!resp.ok) {
            throw new Error(`Failed ${n} ${resp.status}`);
          }
          const json = await resp.json();
          i18next.addResourceBundle(lng, n, json, true, true);
        })
      );

      await i18next.changeLanguage(lng);
    };

    const run = async () => {
      const url = `${backendUrl}/locales/versions.json?ts=${Date.now()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch versions (${res.status})`);
      }

      const data = await res.json();

      const prev = prevVersionsRef.current;
      const changed = JSON.stringify(prev) !== JSON.stringify(data);

      if (!changed) {
        return;
      }

      prevVersionsRef.current = data;
      setVersions(data);

      const lng = i18next.language || 'en';
      const ns = Array.isArray(i18next.options?.ns)
        ? (i18next.options!.ns as string[])
        : [(i18next.options?.defaultNS as string) || 'translation'];

      if (i18next.services?.backendConnector) {
        await i18next.reloadResources([lng], ns);
        await i18next.changeLanguage(lng);
      } else {
        await refreshBundlesManually();
      }
    };

    run().catch((e) => {
      console.error('[i18n] versions refresh failed:', e);
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated, setVersions]);
};
