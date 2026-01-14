import { Lang } from '@/services/langService';
import { useLangStore } from '@/stores/useLangStore';

/**
 * useLang Hook - Reactive hook for language state
 */
export const useLang = () => {
  const lang = useLangStore((s) => s.lang);
  const hydrated = useLangStore((s) => s.hydrated);

  return {
    active: lang ?? 'en',
    isActive: Lang.isActive,
    set: Lang.setActive,
    hydrated,
  };
};

export default useLang;
