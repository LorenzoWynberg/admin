'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHeadingId from 'remark-heading-id';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { extractToc } from './extractToc';
import { GuideToc } from './GuideToc';

import './guide.css';

/**
 * The admin layout puts its scroll on the inner <main>, not window — so the
 * browser's default "jump to #hash on load" doesn't fire. Forward any hash on
 * mount (and on subsequent hash changes) to a manual scroll inside <main>.
 */
function useHashScrollInMain() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = document.getElementById(decodeURIComponent(hash));
      const main = document.querySelector('main');
      if (!el || !main) return;
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 16;
      main.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    };

    // Two RAFs so the markdown body is fully painted before we measure.
    requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);
}

export function GuideRenderer({ content }: { content: string }) {
  const toc = extractToc(content);
  useHashScrollInMain();

  return (
    <div className="guide-layout">
      <article className="guide-root">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkHeadingId]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          ]}
        >
          {content}
        </ReactMarkdown>
      </article>
      <aside className="guide-toc-rail">
        <GuideToc items={toc} />
      </aside>
    </div>
  );
}
