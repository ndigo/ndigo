# Dependency Versions (January 2025)

This document provides a quick reference for all dependency versions after the 2025 modernization.

## System Requirements

| Requirement | Version                  |
| ----------- | ------------------------ |
| Node.js     | ≥18.0.0                  |
| pnpm        | ≥8.0.0 (Package Manager) |

## Root DevDependencies (package.json)

### TypeScript & Type Definitions

| Package     | Version  |
| ----------- | -------- |
| typescript  | ~5.7.2   |
| @types/jest | ~29.5.14 |
| @types/node | ~22.10.2 |

### ESLint

| Package                          | Version |
| -------------------------------- | ------- |
| eslint                           | ~9.17.0 |
| @typescript-eslint/eslint-plugin | ~8.18.2 |
| @typescript-eslint/parser        | ~8.18.2 |

### Testing

| Package    | Version |
| ---------- | ------- |
| vitest     | ~2.1.8  |
| @vitest/ui | ~2.1.8  |
| jsdom      | ~25.0.1 |
| msw        | ~2.7.0  |

### Build Tools

| Package                  | Version |
| ------------------------ | ------- |
| vite                     | ~6.0.7  |
| vite-plugin-dts          | ~4.3.0  |
| @vitejs/plugin-basic-ssl | ~1.1.0  |
| typescript               | ~5.7.2  |

### Monorepo Management

| Package | Version |
| ------- | ------- |
| nx      | ~20.3.2 |

### Package Manager

| Package | Version |
| ------- | ------- |
| pnpm    | 8.15.0  |

### Documentation

| Package | Version |
| ------- | ------- |
| jsdoc   | ~4.0.4  |

### Utilities

| Package          | Version  |
| ---------------- | -------- |
| ts-node          | ~10.9.2  |
| cross-env        | ~7.0.3   |
| debug            | ~4.3.7   |
| process          | ~0.11.10 |
| util             | ~0.12.4  |
| reflect-metadata | ~0.2.2   |
| benchmark        | ~2.1.4   |

## Package Runtime Dependencies

### blue-util (packages/blue-util)

| Package     | Version | Notes                              |
| ----------- | ------- | ---------------------------------- |
| date-fns    | ~4.1.0  | ⚠️ Breaking: v4 API changes        |
| date-fns-tz | ~3.2.0  | ⚠️ Breaking: v3 changes            |
| ramda       | ~0.31.1 | ⚠️ Breaking: R.range() API changed |
| slug        | ~11.0.1 | Updated from v8                    |
| seedrandom  | ~3.0.5  | No changes                         |

**DevDependencies:**
| Package | Version |
|---------|---------|
| @types/ramda | ~0.31.1 |
| @types/seedrandom | ~3.0.8 |
| @types/slug | ~5.0.9 |

### blue-factory (packages/blue-factory)

| Package          | Version | Notes               |
| ---------------- | ------- | ------------------- |
| reflect-metadata | ~0.2.2  | Updated from 0.1.13 |

### blue-model (packages/blue-model)

| Package     | Version | Notes                         |
| ----------- | ------- | ----------------------------- |
| objectmodel | ~4.4.6  | Latest 4.x (v5 doesn't exist) |

### blue-context (packages/blue-context)

**DevDependencies / PeerDependencies:**
| Package | Version |
|---------|---------|
| reflect-metadata | 0.2.2 |

### blue-dispatcher (packages/blue-dispatcher)

**DevDependencies / PeerDependencies:**
| Package | Version |
|---------|---------|
| reflect-metadata | 0.2.2 |

### blue-fill (packages/blue-fill)

| Package                       | Version       | Notes               |
| ----------------------------- | ------------- | ------------------- |
| reflect-metadata              | ~0.2.2        | Updated from 0.1.13 |
| abort-controller              | ~3.0.0        | No changes          |
| blob-polyfill                 | ~7.0.20220408 | No changes          |
| core-js                       | ~3.28.0       | No changes          |
| es-module-shims               | ~1.6.3        | No changes          |
| intl                          | ~1.2.5        | No changes          |
| mOxie                         | ~1.5.7        | No changes          |
| navigator.sendbeacon          | ~0.0.20       | No changes          |
| spanning-css-polyfill         | ~2.0.7        | No changes          |
| unorm                         | ~1.6.0        | No changes          |
| viewportsegments-css-polyfill | ~1.0.3        | No changes          |
| viewportsegments-polyfill     | ~1.0.3        | No changes          |
| webcrypto-shim                | ~0.1.7        | No changes          |
| whatwg-fetch                  | ~3.6.2        | No changes          |

## Version Comparison

### Major Upgrades (Before → After)

| Package                        | Before   | After    | Change      |
| ------------------------------ | -------- | -------- | ----------- |
| typescript                     | ~4.9.5   | ~5.7.2   | +2 major    |
| eslint                         | ~8.34.0  | ~9.17.0  | +1 major ⚠️ |
| @typescript-eslint/\*          | ~5.52.0  | ~8.18.2  | +3 major    |
| @types/node                    | ~18.13.0 | ~22.10.2 | +4 major    |
| lerna                          | ^6.5.1   | ^8.2.4   | +2 major    |
| msw                            | ~1.0.1   | ~2.7.0   | +1 major ⚠️ |
| date-fns                       | ~2.29.3  | ~4.1.0   | +2 major ⚠️ |
| date-fns-tz                    | ~2.0.0   | ~3.2.0   | +1 major ⚠️ |
| slug                           | ~8.2.2   | ~11.0.1  | +3 major    |
| fork-ts-checker-webpack-plugin | ~7.3.0   | ~9.0.2   | +2 major    |

### Minor/Patch Updates

| Package                       | Before  | After    |
| ----------------------------- | ------- | -------- |
| webpack                       | ~5.75.0 | ~5.97.1  |
| webpack-cli                   | ~5.0.1  | ~5.1.4   |
| jest                          | ~29.4.3 | ~29.7.0  |
| ts-jest                       | ~29.0.5 | ~29.2.5  |
| @types/jest                   | ~29.4.0 | ~29.5.14 |
| ts-loader                     | ~9.4.2  | ~9.5.1   |
| terser-webpack-plugin         | ~5.3.1  | ~5.3.10  |
| tsconfig-paths-webpack-plugin | ~4.0.0  | ~4.1.0   |
| ts-node                       | ~10.9.1 | ~10.9.2  |
| jsdoc                         | ~4.0.1  | ~4.0.4   |
| debug                         | ~4.3.3  | ~4.3.7   |
| ramda                         | ~0.30.1 | ~0.31.1  |
| objectmodel                   | ~4.4.1  | ~4.4.6   |
| reflect-metadata              | ~0.1.13 | ~0.2.2   |

## Configuration File Changes

| File                | Status      | Notes                              |
| ------------------- | ----------- | ---------------------------------- |
| eslint.config.mjs   | ✅ Created  | New flat config format             |
| .eslintrc.js        | ❌ Deleted  | Replaced by flat config            |
| .eslintignore       | ❌ Deleted  | Integrated into config             |
| tsconfig.build.json | 📝 Modified | Target ES2022, skipLibCheck added  |
| tsconfig.base.json  | ✅ Created  | Base config for project references |
| lerna.json          | 📝 Modified | Removed useWorkspaces              |
| package.json (root) | 📝 Modified | All deps + engines updated         |

## Breaking Changes Summary

⚠️ **Requires Code Changes:**

1. **Ramda 0.31**: `R.range()` API changed (~52 test failures)
2. **date-fns-tz 3.x**: Module import path changed (1 error)
3. **ESLint 9**: Must use flat config format
4. **MSW 2.x**: New handler API (if using in tests)

✅ **Compatible (No Code Changes):**

1. TypeScript 5.7: Better, stricter, faster
2. webpack 5.97: Bug fixes
3. Jest 29.7: Minor improvements
4. reflect-metadata 0.2: Internal improvements
5. Node 18+: LTS support

## Verification Commands

```bash
# Check versions
node --version          # Should show v18+
pnpm --version          # Should show v8+
npx nx --version        # Should show v20+

# Verify installation
pnpm install            # Should complete without errors

# Check linting
pnpm lint               # Should run with flat config

# Check TypeScript
npx tsc --version       # Should show 5.7.2

# Build packages
pnpm build              # Build all packages with Nx

# Run tests
pnpm test               # Run all tests with Vitest

# View dependency graph
nx graph                # Open interactive visualization
```

## Update Date

**Last Updated:** January 23, 2025

**Modernization Status:**

- ✅ Phase 1 Complete: Dependencies modernized (TypeScript 5.7, ESLint 9, etc.)
- ✅ Phase 2 Complete: Tooling upgraded (pnpm, Nx, Vitest)
- ⚠️ Code updates needed: Ramda API changes, date-fns-tz imports

**See also:** `MIGRATION-TOOLING-2025.md` for tooling migration details
