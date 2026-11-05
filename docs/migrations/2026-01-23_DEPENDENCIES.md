# Migration Guide: 2025 Modernization

This document describes the breaking changes introduced during the January 2025 modernization of the ndigo monorepo.

## Overview

All dependencies were updated to their latest stable versions as of January 2025, including several major version upgrades with breaking changes.

## Requirements Changes

| Package | Old Version | New Version |
| ------- | ----------- | ----------- |
| Node.js | ≥12.16.1    | **≥18.0.0** |
| npm     | ≥5.6.0      | **≥9.0.0**  |
| Yarn    | ≥1.6.0      | **≥1.22.0** |

**Action Required:** Ensure your development environment meets the new requirements.

## Major Dependency Updates

### TypeScript 4.9 → 5.7

**Changes:**

- Target updated from ES2019 to **ES2022**
- Native support for private class fields (`#field` syntax)
- Stricter type checking
- Better performance
- `skipLibCheck: true` added for faster builds

**Action Required:**

- Code using private fields now compiles correctly
- Review any new type errors from stricter checking
- Some implicit types may need explicit annotations

### ESLint 8 → 9 (Breaking)

**Changes:**

- **Flat config format is mandatory**
- Configuration file changed from `.eslintrc.js` to `eslint.config.mjs`
- Different plugin loading mechanism
- `.eslintignore` no longer supported (use `ignores` in config)

**Migration:**

```bash
# Old
eslint . --config .eslintrc.js

# New
npx eslint .  # Uses eslint.config.mjs automatically
```

**Action Required:**

- Use the new `eslint.config.mjs` configuration
- Remove any references to `.eslintrc.js`
- Ignores are now specified in the config file

### @typescript-eslint 5 → 8

**Changes:**

- Updated rules to match TypeScript 5.7
- Some rules renamed or removed:
    - `@typescript-eslint/member-delimiter-style` → removed
    - `@typescript-eslint/no-parameter-properties` → removed
    - `@typescript-eslint/no-var-requires` → `@typescript-eslint/no-require-imports`
    - `@typescript-eslint/no-triple-slash-reference` → `@typescript-eslint/triple-slash-reference`

**Action Required:** Configuration already updated in `eslint.config.mjs`

### Lerna 6 → 8

**Changes:**

- `useWorkspaces` option removed (automatically uses package manager's workspace config)
- Better integration with Nx for caching
- Improved performance

**Migration:**

```json
// Old lerna.json
{
  "useWorkspaces": true,  // ❌ No longer valid
  "packages": ["packages/*"]
}

// New lerna.json
{
  "packages": ["packages/*"]  // ✅ Workspaces auto-detected
}
```

**Action Required:** Configuration already updated.

## Runtime Dependency Breaking Changes

### date-fns 2.x → 4.x (ndigo-util)

**Changes:**

- ESM-first architecture (better tree-shaking)
- Some function signatures changed
- Improved TypeScript types
- Better timezone handling

**Common Issues:**

- Import paths may need adjustment
- Some advanced functions have new APIs

**Migration Example:**

```typescript
// Most common functions remain compatible
import { format, addDays } from 'date-fns';
format(new Date(), 'yyyy-MM-dd'); // ✅ Still works

// Check date-fns changelog for advanced features
```

**Action Required:** Test date-related functionality in ndigo-util

### date-fns-tz 2.x → 3.x (ndigo-util)

**Changes:**

- Follows date-fns v4 updates
- Module resolution changes
- Import path for `/fp` submodule changed

**Known Issue:**

```typescript
// Old (may not work)
import { formatInTimeZone } from 'date-fns-tz/fp';

// May need moduleResolution update or path adjustment
```

**Action Required:** Fix import in `packages/ndigo-util/src/date/index.ts`

### Ramda 0.30 → 0.31 (ndigo-util) ⚠️

**Breaking Change:**

```typescript
// Old API (0.30)
R.range(0, 10, 2); // [0, 2, 4, 6, 8]  ❌ No longer works

// New API (0.31)
R.range(0, 10); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]  ✅
```

**Impact:** 52 test failures in `packages/ndigo-util/src/list/range-n.spec.ts`

**Action Required:**

1. Review all uses of `R.range()` in the codebase
2. Implement custom step logic if needed:

```typescript
// Custom range with step
const rangeStep = (start, end, step) => R.range(start, end).filter((_, i) => i % step === 0);
```

3. Update tests to use new API

### slug 8.x → 11.x (ndigo-util)

**Changes:**

- API refinements
- Better Unicode support
- TypeScript improvements

**Action Required:** Test slug generation functionality if heavily used

### reflect-metadata 0.1 → 0.2

**Changes:**

- Minimal breaking changes
- Internal improvements
- Decorator metadata API remains stable

**Action Required:** None. Should work transparently.

### objectmodel 4.4.1 → 4.4.6 (ndigo-model)

**Note:** Version 5.0 does not exist. Updated to latest 4.x version.

**Action Required:** None expected. Patch version updates only.

## Development Dependency Updates

### Jest 29.4 → 29.7

**Changes:**

- Bug fixes and performance improvements
- Better ESM support
- No breaking changes in this minor update

**Action Required:** None

### webpack 5.75 → 5.97

**Changes:**

- Performance improvements
- Bug fixes
- Better compatibility with modern tools

**Action Required:** None

### MSW 1.x → 2.x

**Breaking Changes:**

- New request/response API
- Different handler setup
- Setup function changes

**Migration Example:**

```typescript
// Old (MSW 1.x)
rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }));
});

// New (MSW 2.x)
http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' });
});
```

**Action Required:** Update any tests using MSW for API mocking

## Yarn 4 Migration

**Changes:**

- Yarn migrated to v4 automatically during install
- New `.yarnrc.yml` format
- Different caching behavior
- Resolutions syntax changed

**Migration:**

```json
// Old resolutions (Yarn 1)
"resolutions": {
  "**/**/braces": ">=2.3.1"  // ❌ Nested globs not allowed
}

// New resolutions (Yarn 4)
"resolutions": {
  "braces": ">=2.3.1"  // ✅ Simple package name
}
```

**Action Required:** Configuration already updated.

## Build Process Changes

### TypeScript Compilation

**Old Target (ES2019):**

- Private fields not supported
- Required workarounds for modern features

**New Target (ES2022):**

- Native private class fields: `#field`
- Top-level await support
- Better async/await handling
- More efficient output

**Action Required:** None. Code should work better now.

### Linting

**Old Command:**

```bash
yarn eslint .
```

**New Command:**

```bash
npx eslint .  # Uses flat config automatically
```

**Action Required:** Update any CI/CD scripts to use `npx eslint`

## File Changes Summary

**Created:**

- `eslint.config.mjs` - New ESLint flat config
- `tsconfig.base.json` - Base TypeScript config for project references
- `MIGRATION-2025.md` - This file

**Modified:**

- `package.json` - All devDependencies updated, engines updated
- `tsconfig.build.json` - Target ES2022, skipLibCheck added
- `lerna.json` - Removed useWorkspaces
- `AGENTS.md` (formerly `CLAUDE.md`) - Updated documentation
- `README.md` - Added requirements and getting started sections
- 6 package.json files in packages/ - Runtime dependencies updated

**Deleted:**

- `.eslintrc.js` - Replaced by eslint.config.mjs
- `.eslintignore` - Functionality moved to eslint.config.mjs

## Testing Checklist

After migration, verify:

- [ ] `yarn install` completes successfully
- [ ] `npx eslint .` runs without errors
- [ ] `npx lerna run build:lib --stream` builds packages in order
- [ ] Tests pass (may have failures due to Ramda API changes)
- [ ] Date handling works correctly (date-fns v4)
- [ ] Dependency injection still works (reflect-metadata v0.2)
- [ ] API mocking works if using MSW

## Known Issues

### 1. Ramda Range Tests Failing

**Issue:** 52 test failures in `packages/ndigo-util/src/list/range-n.spec.ts`

**Cause:** `R.range()` no longer accepts step parameter

**Status:** Requires code update to use new Ramda 0.31 API

### 2. date-fns-tz Import Error

**Issue:** Cannot resolve `date-fns-tz/fp` module

**Cause:** Module structure changed in v3

**Status:** Requires import path adjustment or moduleResolution update

### 3. Parser Type Inference

**Issue:** Various type errors in parser code

**Cause:** TypeScript 5.7 stricter type checking

**Status:** Requires explicit type annotations in some parser functions

## Rollback Instructions

If critical issues arise:

```bash
# 1. Restore old dependencies
git checkout HEAD~1 package.json packages/*/package.json

# 2. Restore old configs
git checkout HEAD~1 tsconfig.build.json lerna.json

# 3. Restore old ESLint config
git checkout HEAD~1 .eslintrc.js .eslintignore
rm eslint.config.mjs

# 4. Reinstall old dependencies
rm -rf node_modules yarn.lock
yarn install
```

## Support

For issues related to this migration:

1. Check this migration guide first
2. Review the updated `AGENTS.md` for current best practices
3. Consult package-specific documentation for breaking changes
4. Check library migration guides:
    - [date-fns v4 changelog](https://github.com/date-fns/date-fns/releases)
    - [Ramda v0.31 changelog](https://github.com/ramda/ramda/releases)
    - [ESLint v9 migration guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
    - [MSW v2 migration guide](https://mswjs.io/docs/migrations/1.x-to-2.x)

## Timeline

- **Modernization Date:** January 23, 2025
- **TypeScript:** 4.9.5 → 5.7.2
- **Node.js Requirement:** 12.16.1 → 18.0.0
- **ESLint:** 8.34.0 → 9.17.0 (flat config)
- **Status:** Infrastructure complete, code updates needed
