# Known Issues

## Ramda TypeScript Type Resolution (Resolved)

**Issue:** TypeScript cannot resolve ramda exports when using `moduleResolution: "Bundler"`

**Symptoms:**

- Error: `Module '"ramda"' has no exported member 'always'` (and similar for other exports)
- Affected multiple files: `_natural-sort.ts`, `function/index.ts`, `string/*.ts`, `list/*.ts`

**Root Cause:**

- Introduced in commit `e760adc` (ESM migration)
- Changed `moduleResolution` from `"Node"` to `"Bundler"` in `tsconfig.base.json`
- `@types/ramda@0.31.1` has `export * from "../index.js"` in `es/index.d.ts`
- With Bundler resolution, TypeScript cannot resolve this because there's no `index.js` file, only `index.d.ts`

**Solution:**

A local ambient module declaration (`src/ramda.d.ts`) bridges the `ramda` module to `types-ramda`
directly, bypassing the broken `@types/ramda` resolution chain:

```typescript
declare module 'ramda' {
    export * from 'types-ramda';
}
```

This replaces the previous workaround (a 259-line file that typed every ramda export as `any`) with
proper generic types from `types-ramda@0.31.0`. The companion `ramda-extensions.d.ts` augments the
module with types for the 13 functions added in ramda 0.32.0 that are not yet in types-ramda 0.31.0.

**Previous Workaround (Removed):**

- `src/ramda.d.ts` declared every ramda export as `any`, completely bypassing type checking
- 9 source files required `@ts-expect-error` comments due to the `any` types
- `skipLibCheck: true` was used to suppress additional type errors (still enabled, but no longer
  required specifically for ramda)

**Dependencies:**

- Runtime: `ramda@~0.32.0`
- Types: `types-ramda@0.31.0` (in package.json devDependencies)
- Note: `@types/ramda` is NOT installed — the local bridge declaration replaces it

**Related Files:**

- `src/ramda.d.ts` - Bridge module declaration: `declare module 'ramda' { export * from 'types-ramda' }`
- `src/ramda-extensions.d.ts` - Type definitions for ramda 0.32.0 functions not in types-ramda 0.31.0 (`addIndexRight`, `ascendNatural`, `collectBy`, `count`, `descendNatural`, `dropRepeatsBy`, `partialObject`, `promap`, `rebuild`, `sequence`, `splitWhenever`, `swap`, `thunkify`, `whereAny`)

**Status:** Resolved
