import fs from 'node:fs';
import path from 'node:path';

import { GuideRenderer } from '@/components/guide/GuideRenderer';

const SUPPORTED = ['en', 'es', 'fr'] as const;
type Lang = (typeof SUPPORTED)[number];

function readGuide(lang: string): string {
  const safeLang = (SUPPORTED as readonly string[]).includes(lang) ? (lang as Lang) : 'es';
  const file = path.join(process.cwd(), 'content/guide', `guide.${safeLang}.md`);
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  return fs.readFileSync(path.join(process.cwd(), 'content/guide/guide.es.md'), 'utf8');
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const content = readGuide(lang);
  return <GuideRenderer content={content} />;
}
