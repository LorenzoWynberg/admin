# Mandados Admin

Next.js admin dashboard for the Mandados delivery platform.

## Tech Stack

- **Next.js**: 16 (App Router)
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + Immer + Persist
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod
- **i18n**: i18next with HTTP backend

## Getting Started

```bash
npm install
npm run dev    # Runs on http://localhost:3111
```

## Architecture

### Directory Structure

```
app/admin/
├── app/
│   ├── (auth)/           # Public auth routes (login)
│   └── (dashboard)/      # Protected dashboard routes
│       ├── orders/       # Order management
│       ├── quotes/       # Quote management
│       ├── users/        # User management
│       ├── drivers/      # Driver management
│       ├── businesses/   # Business management
│       ├── catalogs/     # Catalog management
│       ├── pricing/      # Pricing rules
│       ├── notifications/# Notification history
│       └── settings/     # Admin settings
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, Header
│   └── [resource]/       # Resource-specific components
├── hooks/                # React Query hooks per resource
├── services/             # API service layer
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
├── utils/                # Helper functions
└── validation/           # Zod schemas
```

### Key Patterns

- **Three-layer architecture**: API (`lib/api/`) → Services (`services/`) → Hooks (`hooks/`)
- **Store + Service dual layer**: Zustand for reactive state, Services for API calls
- **React Query** for server state with automatic cache invalidation
- **Hydration guards**: Wait for `hydrated: true` before rendering
- **Real-time updates**: WebSocket via Laravel Reverb + EchoProvider

### Real-time Features

- **Catalog broadcasts**: Live updates when catalogs/elements change
- **Notifications**: Toast alerts + bell icon with unread badge
- **Notification page**: Full history with filters (text, type, action, date range)

## Commands

```bash
npm run dev        # Start dev server (port 3111)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run format     # Format with Prettier
npm run gen:enums  # Regenerate runtime enums
npm run check      # Run format:check + lint + typecheck
```

## Documentation

- `CLAUDE.md` - Quick reference for AI assistants
- `docs/architecture.md` - Detailed architecture documentation
- `docs/pricing-rules-plan.md` - Pricing system implementation plan
