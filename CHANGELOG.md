# Changelog

All notable changes to the Mandados project are documented here.

Format: Each entry includes the date, affected component(s), and a brief description.

---

## 2026-01-13

### Admin + API
- **feat: i18n translations across admin dashboard**
  - Added `useTranslation` hook to all dashboard pages (list and detail views)
  - Implemented `capitalize()` utility for model names in navigation, titles, and subtitles
  - Updated Settings page to use translated language names from `languages:` namespace
  - Fixed Dashboard to properly translate model names and descriptions
  - Updated Sidebar and Header components with translations
  - Added translations for OrderStatusBadge and QuoteStatusBadge components
  - Created new translation files: `businesses.php`, `catalogs.php`, `drivers.php`, `quotes.php`, `users.php`
  - Added Spanish translations for all new keys
  - Added common translations: `filters`, `timestamps`, `go_back`, `failed_to_load`, etc.

### Files Modified (Admin)
- `app/[lang]/(dashboard)/**/page.tsx` - All list and detail pages
- `components/layout/Sidebar.tsx` - Navigation translations
- `components/layout/Header.tsx` - Header translations
- `components/orders/OrderStatusBadge.tsx` - Status translations
- `components/quotes/QuoteStatusBadge.tsx` - Status translations
- `app/[lang]/(dashboard)/settings/page.tsx` - Language selector translations
- `config/i18next.ts`, `providers/I18nProvider.tsx`, `hooks/useLang.ts`, `stores/useLangStore.ts`

### Files Modified (API)
- `lang/en/*.php` - English translation files
- `lang/es/*.php` - Spanish translation files
- New files: `businesses.php`, `catalogs.php`, `drivers.php`, `quotes.php`, `users.php` (EN + ES)
