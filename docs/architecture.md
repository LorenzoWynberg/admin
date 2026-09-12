# Admin Architecture Reference

Detailed documentation for the admin dashboard architecture.

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
│   │   ├── staff/        # Staff (dispatch/admin) account creation
│   │   ├── businesses/   # Business management
│   │   ├── catalogs/     # Catalog management
│   │   ├── pricing/      # Pricing rules
│   │   ├── period-bills/ # Period bill detail (deferred billing)
│   │   ├── notifications/# Notification history
│   │   └── settings/     # Admin settings
│   │       ├── currencies/
│   │       ├── payment-destinations/  # Where customers are told to send money
│   │       └── service-window/
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, Header
│   └── [resource]/       # Resource-specific components
├── config/
│   └── i18next.ts        # i18n configuration
├── data/
│   └── app-enums.ts      # AUTO-GENERATED runtime enums
├── hooks/                # React Query hooks per resource
├── lib/api/              # API client + error handling
├── providers/            # React context providers
├── services/             # Business logic layer (non-reactive)
├── stores/               # Zustand stores
├── types/                # Shared TypeScript types
├── utils/                # Utility functions
└── validation/           # Zod schemas
```

---

## Three-Layer Architecture

1. **API Layer** (`lib/api/client.ts`) - HTTP wrapper with auth
2. **Service Layer** (`services/`) - Business logic, can use outside React
3. **Hook Layer** (`hooks/`) - React Query hooks for components

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

// Catalog store - stores/useCatalogStore.ts
useCatalogStore(): {
  catalogs: Map<number, CatalogData>
  set(), get(), reset()
}

// Reactive hooks
useCatalog(id): CatalogData | undefined
useCatalogByCode(code): CatalogData | undefined
useCatalogElement(catalogId, elementId): CatalogElementData | undefined
```

---

## Real-time Broadcasts

### Echo Configuration

WebSocket connection to Laravel Reverb for real-time updates.

```typescript
// lib/echo.ts - Echo instance with auth
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configured for Laravel Reverb with Sanctum auth
```

### EchoProvider

React context provider managing Echo lifecycle with `useSyncExternalStore` for React Strict Mode compatibility.

```typescript
// providers/EchoProvider.tsx
<EchoProvider>
  {/* App - Echo connected, broadcasts subscribed */}
</EchoProvider>
```

**Key fix**: React Strict Mode double-invokes effects, which disconnected Echo between invocations. Fixed by managing Echo outside React's render cycle with `useSyncExternalStore`.

### Broadcast Hooks

```typescript
// hooks/catalogs/useCatalogBroadcast.ts
// Listens to public 'catalogs' channel, invalidates queries on changes

// hooks/notifications/useNotificationBroadcast.ts
// Listens to private 'notifications.{userId}' channel
// Shows toast + invalidates notification queries
```

---

## Notification Helpers

Shared utilities for notification display and navigation in `hooks/notifications/useNotificationHelpers.ts`.

### Exports

```typescript
import {
  useNotificationHelpers, // Hook with translation helpers
  getNotificationUrl, // Get navigation URL for a notification
  getNotificationData, // Extract data from notification object
  notificationRoutes, // Route config per model type
  type NotifData, // Notification data interface
} from '@/hooks/notifications';

import { buildUrl } from '@/utils/http'; // Build URL with query params
```

### Route Config

Each model type defines its own URL builder. Add new models here:

```typescript
const notificationRoutes: Record<string, (data: NotifData) => string | null> = {
  catalog: (data) => (data.model_id ? `/catalogs/${data.model_id}` : null),
  element: (data) =>
    data.catalog_id ? buildUrl(`/catalogs/${data.catalog_id}`, { element: data.model_id }) : null,
};
```

### Translation Helpers

```typescript
const { getTitle, getMessage, getModelLabel, getActionLabel } = useNotificationHelpers();

// Title: uses resource:success.was_actioned template
getTitle(data); // "Catalog was updated" (via {{resource, capitalize}} was {{action}})

// Message: uses resource:success.was_actioned template
getMessage(data); // "My Catalog was created"

// Labels: from respective namespaces
getModelLabel('catalog'); // from models:catalog
getActionLabel('created'); // from common:created
```

### Deep Linking

Clicking an element notification navigates to `/catalogs/2?element=4`.
The catalog page reads the `element` param and auto-opens the edit modal.

---

## Services

### Auth Service

```typescript
import { Auth } from '@/services/authService';

Auth.login({ email, password }); // POST /auth/token → sets token + user
Auth.logout(); // DELETE /auth/token → clears state
Auth.refresh(); // GET /auth/token/user → refreshes user
Auth.check(); // Returns boolean
Auth.user(); // Returns UserData | null
Auth.token(); // Returns string | null
```

### Order Service

```typescript
import { OrderService } from '@/services/orderService';

OrderService.list({ page, perPage, status, search }); // GET /orders
OrderService.getById(id); // GET /orders/{id}
OrderService.approve(id); // POST /orders/{id}/approve
OrderService.deny(id); // POST /orders/{id}/deny
OrderService.destroy(id); // DELETE /orders/{id}
```

### Quote Service

```typescript
import { QuoteService } from '@/services/quoteService';

QuoteService.list({ page, perPage, orderId }); // GET /quotes
QuoteService.getById(id); // GET /quotes/{id}
QuoteService.create(payload); // POST /quotes
QuoteService.update(id, payload); // PATCH /quotes/{id}
QuoteService.destroy(id); // DELETE /quotes/{id}
```

### User Service

```typescript
import { UserService } from '@/services/userService';

UserService.list({ page, perPage, role, search }); // GET /users
UserService.getById(id); // GET /users/{id}
UserService.update(id, payload); // PATCH /users/{id}
UserService.destroy(id); // DELETE /users/{id}
```

### Notification Service

```typescript
import { NotificationService } from '@/services/notificationService';

NotificationService.list({ page, perPage, unreadOnly, search, model, action, from, to }); // GET /notifications
NotificationService.markAsRead(id); // PATCH /notifications/{id}/read
NotificationService.markAllAsRead(); // PATCH /notifications/read-all
NotificationService.destroy(id); // DELETE /notifications/{id}
```

### Period Bill Service

```typescript
import { PeriodBillService } from '@/services/periodBillService';

PeriodBillService.needsAttention(); // GET /period-bills/needs-attention (staff)
PeriodBillService.getById(publicId); // GET /period-bills/{publicId}
PeriodBillService.settle(publicId, data); // POST .../settle   (admin, multipart)
PeriodBillService.approveDeclaration(publicId, notes); // POST .../approve (admin)
PeriodBillService.rejectDeclaration(publicId, notes); // POST .../reject  (admin)
PeriodBillService.fetchProof(publicId); // GET .../proof  → Blob
```

Two things about this service are load-bearing:

- **`needsAttention()` is a pass-through and must stay one.** The api returns one
  row per bill at its most urgent reason, already sorted: `BillAttentionReason`
  declares its cases in precedence order (unresolved charge → overdue →
  declaration to verify → quiet) and the endpoint sorts by urgency then due
  date. An unresolved charge outranks an overdue bill because the customer's
  money may already be gone while the bill still reads unpaid. **Never re-sort
  these rows client-side** — it silently discards a ranking nothing else states.
- **`fetchProof()` bypasses `api.get()`, and no longer needs to.**
  `PeriodBillData.proofUrl` names an authenticated stream route on a private
  disk, not a storage URL: rendered as a plain `href` or `<img src>` the browser
  sends no Authorization header and the api answers 401. `api.get()` parses JSON
  and returns `{}` for a byte stream, so the bytes are fetched here with the
  token attached and handed to `useBillProof()`, which wraps them in an object
  URL and revokes it on unmount.

  **New code does not copy this.** `api.getBlob()` now carries a byte stream
  through the client itself — with the shared 401 handling and api error message
  that a service doing its own `fetch` loses — behind `FileService.fetchFile()`
  and `useAuthorizedFile()`, which is what every evidence file (payment proof,
  POD photo and signature, receipt file, invoice PDF) is read through. Folding
  `fetchProof()` and `uploadService.ts` onto it is [admin#44].

### Payment Destination Service

```typescript
import { PaymentDestinationService } from '@/services/paymentDestinationService';

PaymentDestinationService.list(); // GET /payment-destinations (staff, walks pages)
PaymentDestinationService.create(data); // POST   (admin)
PaymentDestinationService.update(id, data); // PATCH  (admin) — `method` is immutable
PaymentDestinationService.destroy(id); // DELETE (admin) — soft delete
```

Addressed by numeric `id`, not a public id. The api paginates the index at a
fixed 15 and reads no `per_page`, so `list()` walks the pages rather than
truncating. `method` decides which other fields a row may carry and cannot be
changed after creation — swapping one means deactivating the row and creating a
new one.

### Other Services

- `DriverService` - Driver CRUD + approval
- `StaffService` - Creates a `dispatch` or `admin` account (`POST /staff`, no password — the API generates one and emails an invite)
- `BusinessService` - Business CRUD
- `AddressService` - Address CRUD
- `CatalogService` - Product catalog CRUD
- `LangService` - Language switching

---

## API Layer

### Making Requests

```typescript
import { api } from '@/lib/api/client';

// GET with type
const res = await api.get<Api.Response.Paginated<OrderData>>('/orders');

// POST with body
const res = await api.post<Api.Response.Single<QuoteData>>('/quotes', {
  orderId: 123,
  baseFare: 1500,
});

// PATCH
await api.patch<Api.Response.Single<UserData>>(`/users/${id}`, payload);

// DELETE
await api.destroy<Api.Response.SuccessBasic>(`/orders/${id}`);
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
import { ApiError, isApiError } from '@/lib/api/error';

try {
  await api.post('/orders', data);
} catch (err) {
  if (isApiError(err)) {
    err.status; // HTTP status code
    err.message; // Error message
    err.errors; // Field validation errors: { field: ['error1', 'error2'] }
    err.details; // Additional details
  }
}
```

### Apply API Errors to React Hook Form

```typescript
import { applyApiErrorsToForm } from '@/utils/form';

const form = useForm<FormValues>();

const onSubmit = async (values: FormValues) => {
  try {
    await QuoteService.create(values);
  } catch (err) {
    applyApiErrorsToForm(err, form.setError, {
      // Optional: map API field names to form field names
      base_fare: 'baseFare',
      distance_fee: 'distanceFee',
    });
  }
};
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
import { useOrderList, useOrder, useDeleteOrder } from '@/hooks/orders';

// List with filters
const { data, isLoading, error } = useOrderList({
  page: 1,
  perPage: 10,
  status: 'pending',
  search: 'john',
});

// Single order
const { data: order, isLoading } = useOrder({ id: 123 });

// Mutations
const deleteOrder = useDeleteOrder();
deleteOrder.mutate(orderId);
```

### Other Hooks

```typescript
// Quotes
import {
  useQuoteList,
  useQuote,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
} from '@/hooks/quotes';

// Users
import { useUserList, useUser, useUpdateUser, useDeleteUser } from '@/hooks/users';

// Drivers
import {
  useDriverList,
  useDriver,
  useApproveDriver,
  useUpdateDriver,
  useDeleteDriver,
} from '@/hooks/drivers';

// Staff (dispatch/admin account creation — there is no Staff model, so
// creation invalidates and reads back through ['users'] / @/hooks/users)
import { useCreateStaff } from '@/hooks/staff';

// Businesses
import {
  useBusinessList,
  useBusiness,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
} from '@/hooks/businesses';

// Notifications
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/notifications';

// Notifications with filters
const { data, isLoading } = useNotifications({
  page: 1,
  perPage: 20,
  unreadOnly: true, // Bell dropdown: only unread
  search: 'catalog', // Text search across title, message, model_name
  model: 'Catalog', // Filter by type
  action: 'updated', // Filter by action
  from: '2026-01-01', // Date range
  to: '2026-01-19',
});

// Unread count (for bell badge)
const { data: count } = useUnreadCount();
```

### Period Bills

```typescript
import {
  useBillsNeedingAttention,
  usePeriodBill,
  useSettlePeriodBill,
  useApproveDeclaration,
  useRejectDeclaration,
  useBillProof,
} from '@/hooks/periodBills';

// The sixth Needs Attention tab. Rows arrive ordered by the api — render them
// as they come; see the Period Bill Service note above.
const { data } = useBillsNeedingAttention(); // { items, summary } keyed by AttentionUrgency

// The detail. The queue loads no lines, so `perCurrencyTotals` and `lines` are
// absent on a queue row and present only here.
const { data: bill } = usePeriodBill(publicId);

// The comprobante, fetched through the authenticated route and revoked on unmount.
const proof = useBillProof(publicId, isViewerOpen); // { url, contentType, isLoading, isError }
```

Query key is `['period-bills', ...]`; every act invalidates the whole key,
because approving, rejecting or recording a payment all change which bills need
a person.

### Payment Destinations

```typescript
import {
  usePaymentDestinations,
  useCreatePaymentDestination,
  useUpdatePaymentDestination,
  useDeletePaymentDestination,
} from '@/hooks/paymentDestinations';
```

---

## Utils

### HTTP Response Helpers

```typescript
import { hasItem, hasItems, hasPagination, successBasic, toBasicSuccess } from '@/utils/http';

if (hasItem(response)) {
  console.log(response.item);
}
if (hasItems(response)) {
  console.log(response.items);
}
```

### Form Error Helpers

```typescript
import { applyApiErrorsToForm, getFieldError, hasValidationErrors } from '@/utils/form';

// Apply all errors to form
applyApiErrorsToForm(err, form.setError);

// Get specific field error
const emailError = getFieldError(err, 'email');

// Check if has validation errors
if (hasValidationErrors(err)) {
  // Handle validation errors
}
```

### i18n Message Helpers

```typescript
import {
  validationMessage,
  validationMessageLazy,
  resourceMessage,
  crudSuccessMessage,
  crudErrorMessage,
  statusLabel,
  orderStatusLabel,
} from '@/utils/lang';

validationMessage('required', 'email'); // "The email field is required"
validationMessageLazy('required', 'email'); // () => "The email field is required"
resourceMessage('created', 'order'); // "Order created"
crudSuccessMessage('created', 'order'); // "Order created successfully"
crudErrorMessage('delete', 'order'); // "Failed to delete order"
orderStatusLabel('estimated'); // "Quote Ready"
```

### Format Helpers

```typescript
import { formatCurrency, applyRounding } from '@/utils/format';

formatCurrency(100, '$'); // "$100.00"
formatCurrency(100, '₡', 0); // "₡100"

applyRounding(10.3, 'nearest', 1); // 10
applyRounding(10.3, 'up', 1); // 11
applyRounding(10.3, 'down', 1); // 10
applyRounding(12, 'nearest', 5); // 10
```

---

## Forms (React Hook Form + Zod)

### Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validationMessageLazy } from '@/utils/lang'

const schema = z.object({
  email: z.string().email({ error: validationMessageLazy('email', 'email') }),
  name: z.string().min(1, { error: validationMessageLazy('required', 'name') }),
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

### Validation messages

A zod check with no message argument falls back to **zod's own English string**, in every locale,
permanently — so every check that a user can trip needs one.

Which helper depends on where the schema is declared:

| Schema declared…              | Helper                    | Why                                                                 |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------- |
| at **module scope**           | `validationMessageLazy()` | The module body runs at import, before i18next has fetched anything |
| inside the **component body** | `validationMessage()`     | Re-evaluated on every render, always after init                     |

The JSDoc on `validationMessageLazy` in `utils/lang.ts` carries the mechanism. Pass it as zod's
`error` option — `message` does not take a function:

```typescript
z.string().min(3, { error: validationMessageLazy('min.string', 'name', { min: 3 }) });
z.string().refine(isAdult, {
  error: validationMessageLazy('before_or_equal', 'dateOfBirth', () => ({ date })),
});

// Put one on the TYPE too wherever the bound input can hand zod the wrong type — an
// `<Input type="number" {...field} />` gives react-hook-form a string, which fails
// `z.number()` before any check runs:
z.number({ error: validationMessageLazy('numeric', 'minKm') }).min(0, {
  error: validationMessageLazy('min.numeric', 'minKm', { min: 0 }),
});
```

The second argument is an `attributes.*` key. **The locale JSON lives in the api repo, so this repo
cannot add one** — if a field has no entry there, leave that field's message off and raise the
missing key rather than passing a key that does not resolve, which renders the raw key to the user.

---

## i18n

### Configuration

Translations are managed in the backend at `api/lang/` (PHP files). This app fetches them at runtime from `/locales/{lng}/{ns}.json`.

To add or modify translations:

1. Edit PHP files in `../api/lang/en/*.php` or `../api/lang/es/*.php`
2. Run `langs` command from the API directory
3. No manual sync needed - translations are fetched at runtime

### Namespaces

The registered set lives in `config/i18next.ts` (`const namespaces`) — that array is the source of truth; a namespace not listed there will silently fail to load even if the API serves its JSON. Currently registered:

`addresses`, `audit_logs`, `auth`, `businesses`, `catalogs`, `chat`, `common`, `currencies`, `drivers`, `errors`, `http`, `languages`, `models`, `notifications`, `orders`, `pagination`, `passwords`, `payments`, `pricing`, `quotes`, `resource`, `routes`, `statuses`, `tax`, `users`, `validation`

### Usage

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('orders');

// Simple key
t('create.title');

// With interpolation
t('create.desiredDeliveryAt', { defaultValue: 'Deliver by (optional)' });

// Cross-namespace
t('validation:required', { attribute: t('models:user.email') });
```

---

## Types

### Generated Types (types/generated.d.ts)

```typescript
App.Data.User.UserData;
App.Data.Address.AddressData;
App.Data.Order.OrderData;
App.Data.Quote.QuoteData;
App.Data.Business.BusinessData;
App.Data.Driver.DriverData;
App.Data.Catalog.CatalogData;
App.Enums.OrderStatus;
App.Enums.PaymentStatus;
```

### Response Types (types/response.d.ts)

```typescript
Api.Response.Single<T>;
Api.Response.Paginated<T>;
Api.Response.SuccessBasic;
Api.Response.Error;
Api.Response.Login;
```

### Runtime Enums

TypeScript enums in `types/generated.d.ts` are compile-time only. To use enum values at runtime:

```typescript
import { Enums } from '@/data/app-enums';

if (order.status === Enums.OrderStatus.PENDING) {
  // ...
}
```

Regenerate with `npm run gen:enums` or automatically on `npm run dev`/`build`.
