# Known Issues

## Ramda/date-fns Removal (Completed — 2026-06-12)

**Status:** ✅ Completed

Ramda and date-fns have been removed from `@blue/util`. All functions have been replaced with native JavaScript equivalents. The `ramda.d.ts` and `ramda-extensions.d.ts` type bridge files were deleted.

**Remaining dependencies in `@blue/util`:**

- `seedrandom` — Random number generation
- `slug` — URL slug generation

See `docs/migrations/2026-06-12_NATIVE_FIRST_REFACTOR.md` for the full migration details.
