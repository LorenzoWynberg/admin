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

Then push immediately. See `docs/strict-rules.md` for all rules.

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
npm test              # Run tests
npm test -- --coverage  # Run tests with coverage report
```

Tests use Vitest. Test files are in `__tests__/` folders next to source files:

- `lib/api/__tests__/` - API error handling
- `utils/__tests__/` - Utility functions (form, format, http, lang)

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
4. **i18n**: Always use namespaces, provide `defaultValue` for safety
5. **Queries**: Invalidate queries after mutations for fresh data

---

## Types

**Never edit `types/generated.d.ts`** - it's auto-generated from backend DTOs.

To sync types from backend:

```bash
cp ../api/resources/types/generated.d.ts types/generated.d.ts
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
- `docs/jj-guide.md` - Version control reference
