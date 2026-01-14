# Activity Log - Admin

Append-only log of all changes. New entries are added at the top.

---

## 2026-01-14

### 00:30 - docs: add jj empty commit pitfall warning
- Documented the pitfall of using @ after push
- Added warning to use change ID instead

### 00:22 - docs: add changelog and activity logs
- Created ACTIVITY.md file
- Added documentation logs section to CLAUDE.md

### 00:15 - docs: add jj command reference to CLAUDE.md
- Added jj essential commands section
- Documented bookmark track workflow for pushing

---

## 2026-01-13

### 23:00 - feat: use admin-specific auth endpoint
- Updated authService to use `/auth/admin/token`
- Only admin role can now login to admin panel

### 22:30 - feat: catalog element editing
- Created ElementEditDialog component
- Language dropdown for editing translations
- Full-width inputs for name and textarea for description

### 21:00 - fix: i18n loading
- Switched from `i18next-resources-to-backend` to `i18next-http-backend`
- Fixed translation data corruption issue
- Added `languages` namespace to config

### 20:00 - feat: i18n translations across dashboard
- Added `useTranslation` to all dashboard pages
- Implemented `capitalize()` utility
- Updated Sidebar, Header, and status badge components
