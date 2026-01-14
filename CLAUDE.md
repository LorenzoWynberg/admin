# Mandados Admin - Project Reference

## Quick Reference

Next.js 16 admin dashboard with TypeScript, Zustand, React Query, React Hook Form, shadcn/ui.

---

## Version Control

- **Use jj (Jujutsu)** - Default version control tool instead of raw git ([docs](https://docs.jj-vcs.dev/latest/))
- **Atomic commits** - One logical change per commit, very small and focused
- **No co-authored-by** - Do not add "Co-Authored-By: Claude" to commit messages
- **Conventional commits** - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Protected branches** - NEVER push to `main`, `dev`, or `release/*`. Only push to `feature/*` or `hotfix/*` unless explicitly asked.
- **Branch strategy:** `feature/*` → `release/*` → `dev` → `main` (see main CLAUDE.md)

### jj Essential Commands

```bash
jj new                              # Create new commit
jj describe -m "message"            # Set commit message
jj status / jj diff / jj log        # View state
jj bookmark create NAME -r @        # Create bookmark
jj bookmark set NAME -r @           # Move bookmark (use --allow-backwards if needed)
jj bookmark track NAME --remote=origin  # Track before first push
jj git push --bookmark NAME         # Push bookmark
jj git fetch                        # Fetch from remote
jj squash                           # Squash into parent
jj undo                             # Undo last operation
```

**Note:** `--allow-new` is deprecated. Track bookmarks before pushing: `jj bookmark track NAME --remote=origin`

**⚠️ Pitfall:** After push, `@` points to a new empty commit. Use the change ID (e.g., `rpoznltr`) instead of `@` when moving bookmarks post-push.

### Documentation Logs

- **Changelog**: `logs/CHANGELOG.md` - High-level changes grouped by date/version
- **Activity Log**: `logs/activity/YYYY-MM-DD.md` - Detailed append-only log of every task, one file per day

See main `CLAUDE.md` for full details.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + Immer + Persist
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod
- **i18n**: i18next + react-i18next
- **Icons**: Lucide React
- **Toasts**: Sonner

---

## Project Structure

```
app/admin/
├── app/
│   ├── (auth)/           # Public auth routes (login)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── orders/       # Order management
│   │   ├── quotes/       # Quote management
│   │   ├── users/        # User management
│   │   ├── drivers/      # Driver management
│   │   ├── businesses/   # Business management
│   │   ├── catalogs/     # Catalog management
│   │   ├── pricing/      # Pricing rules (planned)
│   │   └── settings/     # Admin settings
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, Header
│   └── [resource]/       # Resource-specific components
├── config/
│   └── i18next.ts        # i18n configuration
├── hooks/                # React Query hooks per resource
│   ├── orders/
│   ├── quotes/
│   ├── users/
│   ├── drivers/
│   ├── businesses/
│   ├── addresses/
│   └── catalogs/
├── lib/api/              # API client + error handling
├── providers/            # React context providers
├── services/             # Business logic layer (non-reactive)
├── stores/               # Zustand stores
├── types/                # Shared with mobile app
├── utils/                # Utility functions
└── validation/           # Zod schemas
```

---

## Stores (Zustand)

```typescript
// Auth store - stores/useAuthStore.ts
useAuthStore(): {
  user: UserData | null
  token: string | null
  hydrated: boolean       // Wait for this before rendering
  loading: boolean
  setUser(), clearUser(), setToken(), clearToken()
  logout(), isAuthenticated(), isAdmin()
}

// Reactive hook
useAuth(): {
  user, token, hydrated, loading,
  isAuthenticated: boolean,
  isAdmin: boolean,
  logout: () => void
}

// Language store - stores/useLangStore.ts
useLangStore(): {
  lang: string            // Current language code
  versions: Record<string, { hash, lastUpdated }>
  hydrated: boolean
  setLang(), getVersion(), setVersions()
}
```

---

## Services (Non-reactive singletons)

### Auth Service
```typescript
import { Auth } from '@/services/authService'

Auth.login({ email, password })     // POST /auth/token → sets token + user
Auth.logout()                       // DELETE /auth/token → clears state
Auth.refresh()                      // GET /auth/token/user → refreshes user
Auth.check()                        // Returns boolean
Auth.user()                         // Returns UserData | null
Auth.token()                        // Returns string | null
```

### Order Service
```typescript
import { OrderService } from '@/services/orderService'

OrderService.list({ page, perPage, status, search })  // GET /orders
OrderService.getById(id)                               // GET /orders/{id}
OrderService.approve(id)                               // POST /orders/{id}/approve
OrderService.deny(id)                                  // POST /orders/{id}/deny
OrderService.destroy(id)                               // DELETE /orders/{id}
```

### Quote Service
```typescript
import { QuoteService } from '@/services/quoteService'

QuoteService.list({ page, perPage, orderId })  // GET /quotes
QuoteService.getById(id)                        // GET /quotes/{id}
QuoteService.create(payload)                    // POST /quotes
QuoteService.update(id, payload)                // PATCH /quotes/{id}
QuoteService.destroy(id)                        // DELETE /quotes/{id}
```

### User Service
```typescript
import { UserService } from '@/services/userService'

UserService.list({ page, perPage, role, search })  // GET /users
UserService.getById(id)                             // GET /users/{id}
UserService.update(id, payload)                     // PATCH /users/{id}
UserService.destroy(id)                             // DELETE /users/{id}
```

### Other Services
- `DriverService` - Driver CRUD + approval
- `BusinessService` - Business CRUD
- `AddressService` - Address CRUD
- `CatalogService` - Product catalog CRUD
- `LangService` - Language switching

---

## API Layer

### Making Requests
```typescript
import { api } from '@/lib/api/client'

// GET with type
const res = await api.get<Api.Response.Paginated<OrderData>>('/orders')

// POST with body
const res = await api.post<Api.Response.Single<QuoteData>>('/quotes', {
  orderId: 123,
  baseFare: 1500,
  // ...
})

// PATCH
await api.patch<Api.Response.Single<UserData>>(`/users/${id}`, payload)

// DELETE
await api.destroy<Api.Response.SuccessBasic>(`/orders/${id}`)
```

### Response Types
```typescript
// Single item
Api.Response.Single<T> = { item: T, message, status, extra }

// Multiple items (paginated)
Api.Response.Paginated<T> = {
  items: T[],
  meta: { total, currentPage, lastPage, perPage, ... },
  message, status, extra
}

// Basic success
Api.Response.SuccessBasic = { message, status, extra }

// Error
Api.Response.Error = { message, status, details?, errors?: Record<string, string[]> }
```

### Error Handling
```typescript
import { ApiError, isApiError } from '@/lib/api/error'

try {
  await api.post('/orders', data)
} catch (err) {
  if (isApiError(err)) {
    err.status      // HTTP status code
    err.message     // Error message
    err.errors      // Field validation errors: { field: ['error1', 'error2'] }
    err.details     // Additional details
  }
}
```

### Apply API Errors to React Hook Form
```typescript
import { applyApiErrorsToForm } from '@/utils/form'

const form = useForm<FormValues>()

const onSubmit = async (values: FormValues) => {
  try {
    await QuoteService.create(values)
  } catch (err) {
    applyApiErrorsToForm(err, form.setError, {
      // Optional: map API field names to form field names
      base_fare: 'baseFare',
      distance_fee: 'distanceFee',
    })
  }
}
```

---

## Hooks (React Query)

### Pattern
Each resource has its own hooks directory with:
- `use[Resource]List.ts` - Paginated list query
- `use[Resource].ts` - Single item query
- `use[Resource]Mutations.ts` - Create/update/delete mutations
- `index.ts` - Re-exports

### Orders
```typescript
import { useOrderList, useOrder, useApproveOrder, useDenyOrder, useDeleteOrder } from '@/hooks/orders'

// List with filters
const { data, isLoading, error } = useOrderList({
  page: 1,
  perPage: 10,
  status: 'pending',
  search: 'john'
})

// Single order
const { data: order, isLoading } = useOrder({ id: 123 })

// Mutations
const approveOrder = useApproveOrder()
approveOrder.mutate(orderId)
```

### Quotes
```typescript
import { useQuoteList, useQuote, useCreateQuote, useUpdateQuote, useDeleteQuote } from '@/hooks/quotes'
```

### Users
```typescript
import { useUserList, useUser, useUpdateUser, useDeleteUser } from '@/hooks/users'
```

### Drivers
```typescript
import { useDriverList, useDriver, useApproveDriver, useUpdateDriver, useDeleteDriver } from '@/hooks/drivers'
```

### Businesses
```typescript
import { useBusinessList, useBusiness, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/businesses'
```

---

## Utils

### HTTP Response Helpers
```typescript
import { hasItem, hasItems, hasPagination, successBasic, toBasicSuccess } from '@/utils/http'

if (hasItem(response)) {
  console.log(response.item)
}
if (hasItems(response)) {
  console.log(response.items)
}
```

### Form Error Helpers
```typescript
import { applyApiErrorsToForm, getFieldError, hasValidationErrors } from '@/utils/form'

// Apply all errors to form
applyApiErrorsToForm(err, form.setError)

// Get specific field error
const emailError = getFieldError(err, 'email')

// Check if has validation errors
if (hasValidationErrors(err)) {
  // Handle validation errors
}
```

### i18n Message Helpers
```typescript
import { validationMessage, resourceMessage, crudSuccessMessage, crudErrorMessage } from '@/utils/lang'

validationMessage('required', 'email')     // "The email field is required"
resourceMessage('created', 'order')        // "Order created"
crudSuccessMessage('created', 'order')     // "Order created successfully"
crudErrorMessage('delete', 'order')        // "Failed to delete order"
```

---

## i18n

### Configuration
**Translations are managed in the backend** at `api/lang/` (PHP files). This app fetches them at runtime from `/locales/{lng}/{ns}.json`.

To add or modify translations:
1. Edit PHP files in `../api/lang/en/*.php` or `../api/lang/es/*.php`
2. Run `langs` command from the API directory to regenerate JSON files
3. No manual sync needed - translations are fetched at runtime

### Namespaces
`addresses`, `auth`, `cache`, `common`, `http`, `models`, `orders`, `pagination`, `languages`, `passwords`, `resource`, `validation`

### Usage
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation('orders')

// Simple key
t('create.title')

// With interpolation
t('create.fulfilledBefore', { defaultValue: 'Deliver by (optional)' })

// Cross-namespace
t('validation:required', { attribute: t('models:user.email') })
```

---

## Forms (React Hook Form + Zod)

### Pattern
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/endpoint', values)
    } catch (err) {
      applyApiErrorsToForm(err, form.setError)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## Types

### Generated Types (types/generated.d.ts)
```typescript
App.Data.User.UserData
App.Data.Address.AddressData
App.Data.Order.OrderData
App.Data.Quote.QuoteData
App.Data.Business.BusinessData
App.Data.Driver.DriverData
App.Data.Catalog.CatalogData
App.Enums.OrderStatus
App.Enums.PaymentStatus
```

### Response Types (types/response.d.ts)
```typescript
Api.Response.Single<T>
Api.Response.Paginated<T>
Api.Response.SuccessBasic
Api.Response.Error
Api.Response.Login
```

---

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

---

## Commands

```bash
npm run dev      # Start dev server (port 3001)
npm run build    # Production build
npm run lint     # ESLint
```

---

## Key Patterns Summary

1. **Store + Service**: Stores for reactive state, Services for non-reactive calls
2. **Hydration**: Wait for `hydrated` flags before rendering app
3. **API Errors**: Use `applyApiErrorsToForm()` to bridge API → form errors
4. **i18n**: Always use namespaces, provide `defaultValue` for safety
5. **Forms**: React Hook Form + Zod schema + shadcn/ui Form components
6. **Types**: Use `Api.Response.*` for all API responses
7. **Queries**: Invalidate queries after mutations for fresh data
8. **Toasts**: Use `toast.success()` / `toast.error()` from Sonner

---

## Planned Features

### Pricing Rules System
See `docs/pricing-rules-plan.md` for full implementation plan:
- Per-currency pricing rules (CRC, USD)
- Distance-based fee tiers
- Version history tracking
- Admin UI for rule management
