# Native First Refactor — Ramda/date-fns Removal

**Date:** 2026-06-12
**Status:** ✅ Completed
**Commit:** `4a785d0`

## Overview

Removed `ramda` and `date-fns`/`date-fns-tz` from `@ndigo/util`, replacing all functions with native JavaScript equivalents. This completes the "Native First" initiative to reduce external dependencies and improve performance.

## Changes

### Dependencies Removed from `@ndigo/util/package.json`

| Package       | Previous Version | Status     |
| ------------- | ---------------- | ---------- |
| `ramda`       | ~0.32.0          | ✅ Removed |
| `date-fns`    | ~4.1.0           | ✅ Removed |
| `date-fns-tz` | ~3.2.0           | ✅ Removed |
| `types-ramda` | 0.31.0           | ✅ Removed |

### Dependencies Retained in `@ndigo/util/package.json`

| Package      | Purpose                  |
| ------------ | ------------------------ |
| `seedrandom` | Random number generation |
| `slug`       | URL slug generation      |

### Functions Removed (No Consumers)

These functions had zero external consumers and were deleted entirely:

- `match` — Native `String.prototype.match()` wrapper
- `toLower` — Native `String.prototype.toLowerCase()` wrapper
- `toUpper` — Native `String.prototype.toUpperCase()` wrapper

### Functions Replaced with Native Equivalents

#### String Functions

| Ramda Function                       | Native Replacement                  | Curried?            |
| ------------------------------------ | ----------------------------------- | ------------------- |
| `replace(pattern, replacement, str)` | `str.replace(pattern, replacement)` | ✅ Yes (via arrow)  |
| `split(sep, str)`                    | `str.split(sep)`                    | ✅ Yes (via arrow)  |
| `test(rx, str)`                      | `rx.test(str)`                      | ❌ No (direct call) |
| `trim(str)`                          | `str.trim()`                        | ❌ No (direct call) |

#### Date Functions

| date-fns Function | Native Replacement            |
| ----------------- | ----------------------------- |
| `isFuture(date)`  | `date.getTime() > Date.now()` |
| `isPast(date)`    | `date.getTime() < Date.now()` |

### Files Modified

| File                                                     | Change                                            |
| -------------------------------------------------------- | ------------------------------------------------- |
| `packages/ndigo-util/src/string/index.ts`                | Removed 7 functions, fixed style issues           |
| `packages/ndigo-util/src/date/index.ts`                  | Replaced date-fns with native Date                |
| `packages/ndigo-util/src/math/index.ts`                  | Removed 13 dead Ramda math functions              |
| `packages/ndigo-util/package.json`                       | Removed ramda, date-fns, date-fns-tz, types-ramda |
| `packages/ndigo-util/src/ramda.d.ts`                     | Deleted                                           |
| `packages/ndigo-util/src/ramda-extensions.d.ts`          | Deleted                                           |
| `packages/ndigo-util/scripts/*.js`                       | Updated doc generation scripts                    |
| `packages/ndigo-validate/src/standard-constraints.ts`    | Added `_replace`/`_split` local helpers           |
| `packages/ndigo-core/src/media-type.ts`                  | Inlined `splitOnEquals`                           |
| `packages/ndigo-domain/src/constraints.ts`               | Replaced `test` with native                       |
| `packages/ndigo-domain/src/types.ts`                     | Replaced `test` with native                       |
| `packages/ndigo-dispatcher/src/route-handler-mapping.ts` | Replaced `trim` with native                       |
| `tsconfig.base.json`                                     | Added `outDir: ".tscache"`                        |
| `packages/*/tsconfig.json`                               | Added `rootDir: "./src"`, created 14 new files    |

### Documentation Updated

| File                                             | Change                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| `AGENTS.md`                                      | Updated integration layer table, removed ramda examples |
| `ARCHITECTURE.md`                                | Updated integration layer table and examples            |
| `README.md`                                      | Updated dividing line table                             |
| `KNOWN_ISSUES.md`                                | Replaced ramda resolution section with migration note   |
| `packages/ndigo-eslint-plugin/src/_constants.ts` | Removed ramda/date-fns from INTEGRATION_LAYER_MAP       |

## Testing

- **Build:** ✅ All 25 packages pass
- **Tests:** 2,318 pass, 47 pre-existing failures (0 regressions)
- **Lint:** ✅ No new warnings

## Security Additions

- Added `safe-regex` pre-check to `toRegExp` to detect catastrophic backtracking patterns
- Added LRU cache (1000-entry cap) to `toRegExp` to prevent memory exhaustion
- Added TSDoc security warnings to `patternConstraint`

## Migration Guide for Consumers

If your code imports from `@ndigo/util` and uses any of the removed functions:

### `match`, `toLower`, `toUpper`

These had no external consumers, so no migration needed.

### `replace` (curried)

**Before:**

```typescript
import { replace } from '@ndigo/util/string';
const removeSlashes = replace(/^\//, '');
```

**After:**

```typescript
const removeSlashes = (s: string) => s.replace(/^\//, '');
```

### `split` (curried)

**Before:**

```typescript
import { split } from '@ndigo/util/string';
const splitOnEquals = split('=');
```

**After:**

```typescript
const splitOnEquals = (s: string) => s.split('=');
```

### `test` (direct)

**Before:**

```typescript
import { test } from '@ndigo/util/string';
const result = test(rx, str);
```

**After:**

```typescript
const result = rx.test(str);
```

### `trim` (direct)

**Before:**

```typescript
import { trim } from '@ndigo/util/string';
const result = trim(value);
```

**After:**

```typescript
const result = value.trim();
```

### `isFuture`/`isPast`

**Before:**

```typescript
import { isFuture, isPast } from '@ndigo/util/date';
```

**After:**

```typescript
const isFuture = (date: Date): boolean => date.getTime() > Date.now();
const isPast = (date: Date): boolean => date.getTime() < Date.now();
```

## Notes

- All curried functions now use inline arrow functions instead of the Ramda-style wrapper
- The `patternConstraint` function in `standard-constraints.ts` now uses local `_replace` and `_split` helpers instead of importing from `@ndigo/util/string`
- Doc generation scripts now use a comment marker (`// Import custom functions for re-export`) instead of searching for ramda import boundaries
