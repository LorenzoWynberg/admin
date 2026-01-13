import { Lang } from '@/services/langService';
import { useLangStore } from '@/stores/useLangStore';

/**
 * useLang Hook
 *
 * A reactive hook for accessing language state from the global store
 * within React components. Components automatically re-render when language
 * or versions change.
 */
export const useLang = () => {
  const lang = useLangStore((s) => s.lang);
  const versions = useLangStore((s) => s.versions);
  const hydrated = useLangStore((s) => s.hydrated);
  const loading = useLangStore((s) => s.loading);

  return {
    active: lang ?? 'en',
    isActive: Lang.isActive,
    set: Lang.setActive,
    versions,
    getVersion: Lang.getVersion,
    setVersions: Lang.setVersions,
    loading,
    setLoading: Lang.setLoading,
    hydrated,
  };
};

export default useLang;
