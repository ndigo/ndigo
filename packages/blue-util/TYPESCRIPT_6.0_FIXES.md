# TypeScript 6.0 Build Fixes - @blue/util

This document summarizes the fixes applied to resolve TypeScript 6.0 build errors in the @blue/util package.

## Issues Fixed

1. **seedrandom declaration error** (`packages/blue-util/src/math/random.ts:6:18`)
   - Added proper TypeScript declaration file for `seedrandom/lib/alea.js`
   - Created `packages/blue-util/src/_types/seedrandom.d.ts`

2. **RegExpExecArray null assignment errors** (`packages/blue-util/src/string/decode-uri-component.ts:62:9` and `76:9`)
   - Added proper type annotations to handle potential null values from regex matching

3. **Implicit any types in interpolate.ts** (`packages/blue-util/src/string/interpolate.ts:16:27` and `16:34`)
   - Added explicit parameter types `(match: string, value: string)`

4. **RegExp | undefined assignment error** (`packages/blue-util/src/string/to-reg-exp.ts:36:9`)
   - Used non-null assertion operator `!` when retrieving from cache

5. **Implicit any type in like-promise.ts** (`packages/blue-util/src/type/like-promise.ts:22:48`)
   - Added explicit parameter type `(value: any)`

## Verification

The build now completes successfully with:
```
nx run @blue/util:build:lib
```

All 7 original errors have been resolved while maintaining full functionality and type safety.