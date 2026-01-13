# Mandados Admin - Project Reference

## Git Preferences

- **Commit frequently** - Make smaller, focused commits rather than large batches
- **No co-authored-by** - Do not add "Co-Authored-By: Claude" to commit messages
- **Conventional commits** - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + Immer + Persist
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure

```
app/admin/
├── app/
│   ├── (auth)/           # Public auth routes (login)
│   ├── (dashboard)/      # Protected dashboard routes
│   └── layout.tsx        # Root layout with providers
├── components/
│   └── ui/               # shadcn/ui components
├── hooks/                # React Query hooks per resource
├── lib/api/              # API client + error handling
├── providers/            # React context providers
├── services/             # Business logic layer (non-reactive)
├── stores/               # Zustand stores
├── types/                # Shared with mobile app
└── validation/           # Zod schemas
```

## Architecture Patterns

### Three-Layer Architecture
1. **API Layer** (`lib/api/client.ts`) - HTTP wrapper with auth
2. **Service Layer** (`services/`) - Business logic, can use outside React
3. **Hook Layer** (`hooks/`) - React Query hooks for components

### Auth Flow
1. Login via `Auth.login()` → stores token in Zustand + cookie
2. Middleware checks cookie for route protection
3. AuthProvider handles hydration and token refresh
4. Admin role verified on login

### State Management
- **Zustand + Immer**: For auth and UI state
- **React Query**: For server state (API data)
- **Persist**: Token/user persisted to localStorage

## API

Uses same Laravel backend as mobile app at `NEXT_PUBLIC_API_URL`.

### Key Endpoints
- `POST /auth/token` - Login
- `GET /auth/token/user` - Get current user
- `DELETE /auth/token` - Logout
- CRUD endpoints for: orders, quotes, users, drivers, businesses, addresses, catalogs

## Shared Types

Types are copied from `../front-end/types/`:
- `generated.d.ts` - Data models (UserData, OrderData, etc.)
- `response.d.ts` - API response types (Single, Paginated, Error)

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```
