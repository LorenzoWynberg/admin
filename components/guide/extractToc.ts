import GithubSlugger from 'github-slugger';

export interface TocItem {
  level: 2 | 3;
  text: string;
  id: string;
}

/**
 * Parse markdown source and return the H2/H3 heading tree.
 *
 * Honors explicit anchors like `## Title {#custom-id}`; otherwise generates
 * a slug matching what `rehype-slug` produces so the link targets stay aligned.
 */
export function extractToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  const slugger = new GithubSlugger();
  const lines = md.split('\n');
  let inFence = false;

  for (const raw of lines) {
    if (/^```/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = raw.match(/^(#{2,3})\s+(.*?)\s*$/);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    let rest = m[2];

    let explicitId: string | undefined;
    const idMatch = rest.match(/\{#([^}]+)\}\s*$/);
    if (idMatch) {
      explicitId = idMatch[1];
      rest = rest.slice(0, idMatch.index).trim();
    }

    const text = rest
      .replace(/<[^>]+>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();

    const id = explicitId ?? slugger.slug(text);
    items.push({ level, text, id });
  }

  return items;
}
