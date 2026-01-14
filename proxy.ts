import { NextResponse } from 'next/server';

// Next.js v16 proxy for language routing

const PUBLIC_FILE = /\.(.*)$/;
const locales = ['en', 'es', 'fr'] as const;
const defaultLocale = 'en' as const;

type Locale = (typeof locales)[number];

function parseCookie(req: Request): Record<string, string> {
  const header = req.headers.get('cookie') ?? '';
  return header.split('; ').reduce<Record<string, string>>((acc, part) => {
    if (!part) return acc;
    const eq = part.indexOf('=');
    if (eq === -1) return acc;
    const k = part.slice(0, eq);
    acc[k] = part.slice(eq + 1);
    return acc;
  }, {});
}

function getCookieLang(req: Request): Locale | undefined {
  const cookies = parseCookie(req);
  const lang = cookies['lang'];
  if (lang && (locales as readonly string[]).includes(lang)) return lang as Locale;
  return undefined;
}

export default function proxy(req: Request) {
  const url = new URL(req.url);
  const { pathname } = url;

  // Ignore public files and specific paths that shouldn't be localized
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/locales/')
  ) {
    return NextResponse.next();
  }

  // Handle paths that incorrectly have locale prefix before _next
  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];
  if (
    (locales as readonly string[]).includes(maybeLocale) &&
    pathSegments[1] === '_next'
  ) {
    url.pathname = '/' + pathSegments.slice(1).join('/');
    return NextResponse.rewrite(url);
  }

  // If path already includes a locale, set cookie and continue
  if ((locales as readonly string[]).includes(maybeLocale)) {
    const res = NextResponse.next();
    const existing = getCookieLang(req);
    if (existing !== (maybeLocale as Locale)) {
      res.headers.append(
        'Set-Cookie',
        `lang=${maybeLocale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
      );
    }
    return res;
  }

  // Redirect non-localized paths to preferred or default locale
  const cookieLang = getCookieLang(req) || defaultLocale;
  url.pathname = `/${cookieLang}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/:path*'],
};
