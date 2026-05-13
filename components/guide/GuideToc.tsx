'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import type { TocItem } from './extractToc';

export function GuideToc({ items }: { items: TocItem[] }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // The admin layout scrolls the `<main>` element, not the window — feed that
    // to the observer so it fires as the user scrolls inside the dashboard.
    const root = document.querySelector('main');
    const visible = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const firstVisible = items.find((it) => visible.has(it.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { root, rootMargin: '-72px 0px -65% 0px', threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const main = document.querySelector('main');
    if (main) {
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 16;
      main.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label={t('common:guide', { defaultValue: 'Guide' })} className="guide-toc">
      <p className="guide-toc-label">
        {t('common:on_this_page', { defaultValue: 'On this page' })}
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={cn('guide-toc-item', `level-${item.level}`)}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(activeId === item.id && 'is-active')}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
