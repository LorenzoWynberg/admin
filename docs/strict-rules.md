# Strict Rules

These rules MUST be followed at all times.

## Version Control

- **Use jj** - Never use raw git commands
- **Atomic commits** - One logical change per commit, small and focused
- **No co-authored-by** - Do not add "Co-Authored-By: Claude" to commit messages
- **Conventional commits** - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Protected branches** - NEVER push to `main`, `dev`, or `release/*`. Only push to `feature/*` or `hotfix/*`
- **Push constantly** - Don't accumulate local commits

## Code Quality

**Before committing ANY code, run checks in this order:**

1. **Lint/Typecheck first** - Fix all errors
2. **Format last** - Always run formatter as the final step

```bash
# API
./vendor/bin/phpstan analyse && ./vendor/bin/pint

# Admin / Front-end
npm run lint && npm run typecheck && npm run format
```

**DO NOT commit code that fails formatting or linting checks.**

## Type Safety

- **Always fix type errors** - Type safety is critical
- **Never edit `types/generated.d.ts`** - It's auto-generated from backend DTOs

## Activity Logs

- **Update on EVERY commit** - Add entry to `logs/activity/YYYY-MM-DD.md`
- **Use Costa Rica time (UTC-6)** - Always
- **Newest first** - Add entries at the TOP of the file

## Cross-Project Sync

When modifying DTOs/Enums in API:

1. Run `types` to regenerate TypeScript types
2. Copy to admin and front-end
3. Run `npm run gen:enums` in both
4. Commit in all affected repos

When modifying translations in API:

1. Run `langs` to regenerate JSON
2. No manual sync needed (served at runtime)
