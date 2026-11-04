# Known Issues

## Third-party dependency removal (Completed — 2026-10-31)

**Status:** ✅ Completed

`@ndigo/util` is now a zero-dependency leaf toolkit. `seedrandom`, `slug`, and
`safe-regex` were removed along with the unused or replaceable helpers they
backed (the `guid`/`rand*` PRNG chain — replaced by native
`crypto.randomUUID()` — plus `slugify` and `toRegExp`). See AD-84
(`docs/decisions/2026-10-31_AD84_UTIL_SURFACE_PRUNE.md`).

## Ramda/date-fns Removal (Completed — 2026-06-12)

**Status:** ✅ Completed

Ramda and date-fns have been removed from `@ndigo/util`. All functions have been replaced with native JavaScript equivalents. The `ramda.d.ts` and `ramda-extensions.d.ts` type bridge files were deleted.

See `docs/migrations/2026-06-12_NATIVE_FIRST_REFACTOR.md` for the full migration details.
