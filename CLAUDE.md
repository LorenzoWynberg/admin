> **IMPORTANT: Read `docs/strict-rules.md` first.** It contains critical rules that must always be followed.

# Mandados Admin

Next.js 16 admin dashboard with TypeScript, Zustand, React Query, React Hook Form, shadcn/ui.

## Code Quality

**Before committing, run in order:**

```bash
npm run lint       # 1. Fix lint errors
npm run typecheck  # 2. Fix type errors
npm run format     # 3. Format (LAST step)
```

Then commit **only when the user asks** — run `/simplify` first, and never auto-push. See `docs/strict-rules.md` for all rules.

---

## Commands

```bash
npm run dev        # Start dev server (port 3111)
npm run build      # Production build
npm run gen:enums  # Regenerate runtime enums from types/generated.d.ts
npm run check      # Run format:check + lint + typecheck
```

---

## Testing

```bash
npm run test:run        # Run tests once and exit — use this in any gate or script
npm test                # WATCH MODE — never exits; interactive use only
npm run test:coverage   # Run once with a coverage report
```

Tests use Vitest. Test files are in `__tests__/` folders next to source files:

- `lib/api/__tests__/` - API error handling
- `utils/__tests__/` - Utility functions (form, format, http, lang)
- `services/__tests__/` - Service-layer request shaping
- `hooks/*/__tests__/` - React Query hooks
- `components/*/__tests__/` - Component behavior
- `app/**/__tests__/` - Page-level behavior

Coverage target: 100% on all tested utility files.

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

## Key Patterns

1. **Three layers**: API (`lib/api/`) → Services (`services/`) → Hooks (`hooks/`)
2. **Hydration**: Wait for `hydrated: true` from stores before rendering
3. **API errors**: Use `applyApiErrorsToForm()` to bridge API → form errors
4. **i18n**: Always use namespaces. **Do not add `defaultValue` to a key that exists** — see below
5. **Queries**: Invalidate queries after mutations for fresh data

---

## i18n (Translations)

Translations come from the API via [laravel-to-i18next](https://github.com/LorenzoWynberg/laravel-to-i18next).

### `defaultValue` is a marker, not a safety net

The locale JSON lives in the **api** repo (`lang/{en,es,fr}/`) and is served over
HTTP — **no consumer repo can add a key.** That is what makes `defaultValue`
dangerous rather than merely redundant:

- **On a key that exists, never use it.** It silently masks a broken namespace
  registration or a typo'd key — the string renders, the wiring stays wrong, and
  nobody finds out. This is the failure this repo has actually hit.
- **On a key that genuinely does not exist yet**, it is defensible only as a
  temporary marker that a cross-repo change is half-landed, and it is a debt to
  clear, not a fallback to leave behind. The right move is to add the key in api
  first.

If a key you need is missing from api's `lang/`, ask for it there — do not invent
a fallback here. Existing call sites that still pass `defaultValue` predate this
rule and are not worth churning on their own.

### Placeholder Capitalization

Laravel placeholders are auto-converted:

- `:foo` → `{{foo}}` (as-is)
- `:Foo` → `{{foo, capitalize}}` (first letter uppercase)
- `:FOO` → `{{foo, uppercase}}` (all uppercase)

**Frontend passes lowercase keys** - i18next applies formatting automatically:

```typescript
t('resource:success.was_actioned', { resource: 'my catalog', action: 'created' });
// With `:Resource` in Laravel → outputs "My catalog was created"
```

### Key Namespaces

| Namespace    | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `models`     | Model names: `t('models:catalog', { count: 2 })`   |
| `common`     | UI labels: `created`, `updated`, `save`            |
| `resource`   | CRUD messages: `success.created`, `error.deleting` |
| `statuses`   | Status labels: `pending`, `read`, `unread`         |
| `validation` | Form validation messages                           |

### Helpers (`utils/lang.ts`)

```typescript
import { capitalize, modelLabel, actionLabel, statusLabel } from '@/utils/lang';

modelLabel('catalog'); // "catalog" (from models:catalog)
actionLabel('created'); // "Created" (auto-capitalized from common:created)
statusLabel('pending'); // "pending" (from statuses:pending)
capitalize(modelLabel('catalog')); // "Catalog"
```

---

## Types

**Never edit `types/generated.d.ts`** - it's auto-generated from backend DTOs.

To sync types from backend:

```bash
cp ../api/resources/types/generated.d.ts types/generated.d.ts
cp ../api/resources/types/response.d.ts types/response.d.ts
cp ../api/resources/types/notifications.d.ts types/notifications.d.ts
npm run gen:enums
```

Runtime enums (for comparisons):

```typescript
import { Enums } from '@/data/app-enums';
if (order.status === Enums.OrderStatus.PENDING) { ... }
```

---

## Import Conventions

1. Multi-line imports first (separated by blank line)
2. Single-line imports sorted by length ASC
3. CSS imports last (separated by blank line)

---

## See Also

- `docs/architecture.md` - Detailed services, hooks, patterns, API reference
- `docs/pricing-rules-plan.md` - Pricing system implementation plan
- `docs/strict-rules.md` - Critical rules
