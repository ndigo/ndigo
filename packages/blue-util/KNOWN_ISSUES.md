# Known Issues

## Ramda TypeScript Type Resolution (Deferred)

**Issue:** TypeScript cannot resolve ramda exports when using `moduleResolution: "Bundler"`

**Symptoms:**

- Error: `Module '"ramda"' has no exported member 'always'` (and similar for other exports)
- Affects multiple files: `_natural-sort.ts`, `function/index.ts`, `string/*.ts`, `list/*.ts`

**Root Cause:**

- Introduced in commit `e760adc` (ESM migration)
- Changed `moduleResolution` from `"Node"` to `"Bundler"` in `tsconfig.base.json`
- `@types/ramda@0.31.1` has `export * from "../index.js"` in `es/index.d.ts`
- With Bundler resolution, TypeScript cannot resolve this because there's no `index.js` file, only `index.d.ts`

**Current Workaround:**

- Using `types-ramda@0.31.0` with `skipLibCheck: true`
- Type errors persist but code compiles
- Runtime behavior is correct

**Attempted Fixes (All Failed):**

1. pnpm patches for `@types/ramda` to change export paths
2. Switching to `types-ramda` package instead of `@types/ramda`
3. Creating custom type declarations
4. Various import styles (named vs namespace imports)
5. Different `moduleResolution` settings (`"Node16"`, `"NodeNext"`)

**Dependencies:**

- Runtime: `ramda@~0.32.0`
- Types: `types-ramda@0.31.0` (in package.json), `@types/ramda@0.31.1` (workspace root)
- Note: Version mismatch between ramda (0.32) and its types (0.31)

**Related Files:**

- `src/ramda-extensions.d.ts` - Custom type definitions for newer Ramda 0.32.0 functions not in `@types/ramda@0.31.1` (`addIndexRight`, `collectBy`, `dropRepeatsBy`, `count`, `whereAny`)

**Potential Solutions to Explore:**

1. Downgrade ramda to 0.31.x to match `@types/ramda` version
2. Check if ramda 0.32.x has built-in TypeScript types (eliminating need for separate types package)
3. Create a proper pnpm patch that correctly fixes the export paths in `@types/ramda`
4. Wait for `@types/ramda` update that's compatible with Bundler resolution
5. Use module augmentation to properly extend ramda module types
6. Consider migrating to a different functional programming library with better TypeScript + ESM support

**Priority:** Medium (does not block runtime functionality, only affects development experience)

**Status:** Deferred for future resolution
