# Changelog

All notable changes to the Mandados project are documented here.

Format: Each entry includes the date, affected component(s), and a brief description.

---

## 2026-01-19

### Admin + API

- **feat: real-time catalog broadcasts**
  - WebSocket broadcasting for catalog updates using Laravel Reverb
  - Echo provider with `useSyncExternalStore` for React Strict Mode compatibility
  - Catalog store with reactive hooks for real-time updates

- **feat: notification system**
  - Database-persisted notifications (Laravel's built-in)
  - Real-time toast notifications via WebSocket
  - Bell icon with unread badge in header
  - Dropdown showing unread notifications
  - Click to mark as read and navigate to resource
  - `/notifications` page with full history and filters:
    - Text search (title, message, model_name)
    - Type filter (Catalog, Catalog Element)
    - Action filter (Created, Updated, Deleted, Restored)
    - Date range filter with validation
  - Dismissible toasts with close button

### Files Created (Admin)

- `lib/echo.ts` - Echo configuration
- `providers/EchoProvider.tsx` - WebSocket provider
- `stores/useCatalogStore.ts` - Catalog state management
- `hooks/catalogs/useCatalogBroadcast.ts` - Catalog broadcast listener
- `services/notificationService.ts` - Notification API calls
- `hooks/notifications/*` - Notification hooks
- `components/notifications/*` - Bell, dropdown, item components
- `app/[lang]/(dashboard)/notifications/page.tsx` - Notifications page

### Files Created (API)

- `app/Events/CatalogsUpdated.php` - Broadcast event
- `app/Notifications/CatalogUpdatedNotification.php` - Notification class
- `app/Http/Controllers/NotificationController.php` - API endpoints
- `app/Data/NotificationData.php` - DTO
- `routes/channels.php` - Channel authorization
- `config/reverb.php`, `config/broadcasting.php` - Broadcasting config

---

## 2026-01-14

### Admin

- **feat: pricing rules admin UI**
  - List page with status/currency filters
  - Create/edit pages with distance tier management
  - Detail page with tier visualization
  - Activate/deactivate/duplicate actions

- **chore: code quality tooling**
  - Added Prettier config (.prettierrc, .prettierignore)
  - Added format/lint/typecheck npm scripts
  - Runtime enum generation from TypeScript types
  - Import sorting convention (ASC for single-line imports)

---

## 2026-01-13

### Admin

- **fix: switch from resourcesToBackend to http-backend for i18n**
  - `i18next-resources-to-backend` was corrupting translation data when storing (converting objects to arrays)
  - Switched to `i18next-http-backend` which correctly loads and stores translations
  - Added `languages` namespace to i18next config
  - All translations now load correctly (Filters → Filtros, Settings → Configuración, etc.)

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
