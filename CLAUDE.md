# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Additional Documentation:**
- `MIGRATION-2025.md` - Breaking changes and migration guide for the January 2025 dependency modernization
- `MIGRATION-TOOLING-2025.md` - Tooling migration guide (Yarn→pnpm, Lerna→Nx, Jest→Vitest)
- `DEPENDENCIES-2025.md` - Complete list of dependency versions and comparisons
- `README.md` - Getting started and project overview

## Overview

BlueJS is a modular JavaScript/TypeScript framework organized as a Lerna monorepo with Yarn workspaces. The framework provides core abstractions and utilities for building web applications, including routing, views, models, context management, and HTTP handling.

**Requirements:**
- Node.js ≥18.0.0
- pnpm ≥8.0.0

**Technology Stack (as of January 2025):**
- TypeScript 5.7.2 (ES2022 target)
- ESLint 9.17.0 (flat config)
- Nx 20.3.2 (monorepo management)
- Vitest 2.1.8 (testing framework)
- pnpm 8.15.0 (package manager)
- webpack 5.97.1

## Repository Structure

This is a monorepo containing 20+ packages under `packages/`, each with a consistent structure:
- `src/` - TypeScript source files
- `lib/` - Compiled ESM output (generated)
- `index.js` - Compiled CommonJS bundle (generated)
- `test/` - Tests using Karma for browser testing

Key packages and their dependencies:
- **blue-core**: Foundation interfaces and utilities (Iterable, Comparable, Equatable, MediaType, etc.)
- **blue-util**: Utility functions, depends on blue-parser
- **blue-parser**: Parsing utilities
- **blue-context**: Application context and dependency injection, depends on blue-core, blue-factory, blue-logger
- **blue-factory**: Factory and instantiation patterns
- **blue-router**: Routing functionality, depends on blue-core
- **blue-view**: View layer abstractions, depends on blue-context, blue-core, blue-factory, blue-router
- **blue-view-ractive**: Ractive.js view implementation
- **blue-view-webcomponent**: Web Components view implementation
- **blue-model**: Model layer using objectmodel library
- **blue-http**: HTTP client functionality
- **blue-dispatcher**: Request dispatching, depends on blue-http, blue-router, blue-view
- **blue-domain**: Domain modeling
- **blue-content**: Content handling
- **blue-logger**: Logging utilities
- **blue-validate**: Validation utilities
- **blue-fill**: Polyfills
- **blue-has**: Feature detection
- **blue-print**: Printing utilities
- **blue-platform-web**: Web platform specifics

## Development Commands

### Building

Packages use Nx for efficient monorepo builds with caching:

```bash
# Build all packages (from root)
pnpm build            # Build lib for all packages
pnpm build:all        # Build lib and bundles for all packages
nx run-many -t build:lib     # Nx directly

# Build specific package
nx run @blue/core:build:lib
cd packages/blue-core && pnpm build:lib

# Build with dependency graph
nx graph              # Visualize package dependencies
```

Nx intelligently caches builds and only rebuilds what changed, dramatically improving build times.

### Testing

```bash
# Run tests for all packages (from root)
pnpm test             # Run all tests with Vitest
nx run-many -t test   # Nx directly

# Run tests for specific package
nx run @blue/core:test
cd packages/blue-core && pnpm test

# Run tests in watch mode
nx run @blue/core:test --watch

# Run tests with UI
pnpm vitest --ui

# Run tests with coverage
nx run-many -t test --coverage
```

Tests are configured using:
- `vitest.config.ts` - Root Vitest configuration
- Individual packages can override with their own vitest.config.ts
- Some packages may still use Karma for browser testing (bin/test_web.sh)

### Linting

```bash
# Lint code (from root or package directory)
pnpm lint             # Lint all code
npx eslint <path>     # ESLint 9 with TypeScript support
```

ESLint uses flat config format (`eslint.config.mjs`) and enforces:
- Space in parens: `( value )` not `(value)`
- Template string spacing: `${ value }` not `${value}`
- Array bracket spacing: `[ 1, 2, 3 ]` not `[1, 2, 3]`
- No space after keywords: `if(`, `for(`, `while(`, `switch(`, `catch(`
- Space before/after arrows: `( x ) => x + 1`
- Semicolons required
- TypeScript-specific rules via @typescript-eslint v8

**Note:** ESLint 9 requires flat config format. The configuration is in `eslint.config.mjs` (not `.eslintrc.js`).

### Documentation

```bash
# Generate JSDoc documentation (from package directory)
yarn doc              # Uses JSDoc with config from .jsdoc.json
```

### Other Commands

```bash
# Debug bundle in browser
yarn debug:bundle
yarn debug:web

# Run benchmarks (some packages)
yarn benchmark

# Profile performance (some packages)
yarn profile
```

## Code Conventions

Follow the conventions defined in the main README:

- **PascalCase** for classes and class mixins (e.g., `MyClass`)
- **camelCase** for variables, properties, and methods (e.g., `myMethod`)
- **is** prefix for type/inheritance checks (e.g., `isString()` uses `typeof` or `instanceof`)
- **like** prefix for duck-typing/interface checks (e.g., `likeController()` checks for expected properties)
- **as** prefix for mixins that apply functionality:
  - Class mixins: `AsEventEmitter( Component )` returns enhanced class
  - Function mixins: `asEventEmitter( component )` adds methods to instance
- **Configurable** suffix denotes interfaces/classes with setters for normally readonly properties

## TypeScript Configuration

- TypeScript: 5.7.2
- Target: ES2022 (supports private class fields with `#field` syntax)
- Module: ESNext (with ESM output)
- Module Resolution: Node
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Source maps: inline
- Declaration files and maps generated
- Skip lib check: enabled for faster builds
- Build config: `tsconfig.build.json` in each package, extending root config
- Base config: `tsconfig.base.json` for packages using project references

## Architecture Patterns

### Dependency Injection

The framework uses decorators and reflect-metadata (v0.2.2) for dependency injection through the blue-context package. Many packages declare `reflect-metadata` as a peer dependency. The following packages include reflect-metadata:
- blue-factory (dependency)
- blue-context (peer dependency)
- blue-dispatcher (peer dependency)
- blue-fill (dependency)

### Dual Module Format

Packages export both ESM and CommonJS:
- `lib/index.js` - ESM output from TypeScript
- `index.js` - CommonJS bundle from webpack
- package.json specifies both via `exports`, `main`, and `module` fields

### Shared Build Infrastructure

All packages use centralized build scripts in `bin/` rather than duplicating logic. These scripts assume execution from a package directory (e.g., `packages/blue-core/`) and reference root-level tools via relative paths (`../../node_modules/.bin/`).

## Key Dependencies

### Runtime Dependencies

**blue-util package:**
- `date-fns`: ~4.1.0 (ESM-first, improved tree-shaking)
- `date-fns-tz`: ~3.2.0 (timezone support)
- `ramda`: ~0.31.1 (functional programming utilities)
- `slug`: ~11.0.1 (URL slug generation)
- `seedrandom`: ~3.0.5 (deterministic random numbers)

**blue-model package:**
- `objectmodel`: ~4.4.6 (runtime type checking)

**blue-factory and others:**
- `reflect-metadata`: ~0.2.2 (decorator metadata support)

### Development Dependencies (Root)

**Build Tools:**
- `typescript`: ~5.7.2
- `webpack`: ~5.97.1
- `webpack-cli`: ~5.1.4
- `ts-loader`: ~9.5.1
- `terser-webpack-plugin`: ~5.3.10

**Linting:**
- `eslint`: ~9.17.0 (flat config format)
- `@typescript-eslint/eslint-plugin`: ~8.18.2
- `@typescript-eslint/parser`: ~8.18.2

**Testing:**
- `vitest`: ~2.1.8
- `@vitest/ui`: ~2.1.8
- `jsdom`: ~25.0.1 (browser environment)
- `msw`: ~2.7.0 (API mocking)

**Monorepo & Build:**
- `nx`: ~20.3.2
- `pnpm`: 8.15.0 (package manager)

### Breaking Changes from Previous Versions

**date-fns v4:** Better tree-shaking, some API changes in advanced functions. Most common functions remain compatible.

**ramda v0.31:** `R.range()` function changed from 3 arguments `(start, end, step)` to 2 arguments `(start, end)`. The step parameter was removed.

**slug v11:** API updates from v8. Check migration guide if using advanced features.

**reflect-metadata v0.2:** Minimal breaking changes. Decorator metadata API remains stable.

**ESLint v9:** Requires flat config format (`eslint.config.mjs`). The old `.eslintrc.js` format is no longer supported.

**MSW v2:** New request/response API. Different handler setup pattern. Check MSW docs for migration if tests use mocking.

## Testing Strategy

The framework uses Vitest as the primary test runner, which provides:
- Fast test execution with native ESM support
- Compatible API with Jest for easy migration
- Built-in watch mode and UI
- Excellent TypeScript support

Some packages may also use:
- Karma for browser-specific testing (bin/test_web.sh)
- Mocha for legacy Node.js tests

Vitest configuration is in `vitest.config.ts` at the root, with path aliases for all @blue/* packages.

## Building in Dependency Order

Nx automatically handles build order based on the dependency graph:

```bash
# Build all packages in correct dependency order
pnpm build                    # Uses nx run-many with dependency resolution
nx run-many -t build:lib      # Nx directly

# View dependency graph
nx graph                      # Opens interactive visualization
nx show project @blue/core --web  # Show specific package deps

# Affected builds (only build what changed)
nx affected -t build:lib      # Build only affected packages
nx affected:graph             # See what's affected
```

Nx automatically:
- Resolves build order based on package dependencies
- Caches build outputs for unchanged packages
- Runs builds in parallel where possible
- Only rebuilds affected packages after changes

## Publishing

Packages are configured to publish to an internal JPMorgan Chase Artifactory registry:
```
https://artifacts.jpmchase.net/artifactory/api/npm/npm
```

All packages are scoped under `@blue/` and use semver with alpha pre-release identifiers (e.g., `3.0.0-alpha.0`).

## Modernization Status (January 2025)

**✅ Phase 1 Completed (Initial Modernization):**
- All dependencies updated to latest stable versions
- TypeScript 5.7.2 with ES2022 target
- ESLint 9 with flat config format
- Node.js requirement: ≥18.0.0

**✅ Phase 2 Completed (Tooling Upgrade):**
- Migrated from Yarn to **pnpm** (faster, more efficient)
- Migrated from Lerna to **Nx** (better caching, task orchestration)
- Migrated from Jest to **Vitest** (faster, native ESM, better DX)
- Removed legacy configuration files

**⚠️ Known Issues Requiring Code Updates:**

1. **Ramda 0.31 API Changes**: `R.range()` function signature changed from 3 arguments to 2 arguments. The step parameter was removed. This affects `packages/blue-util/src/list/range-n.spec.ts` with ~52 test failures.

2. **date-fns-tz v3 Import**: Module resolution issue with `date-fns-tz/fp` import in `packages/blue-util/src/date/index.ts`. May need moduleResolution update or import path adjustment.

3. **Parser Type Inference**: Some type errors in parser code due to TypeScript 5.7 stricter type checking. Requires explicit type annotations.

**Status:** Build infrastructure is fully operational. The remaining TypeScript errors are concentrated in test files and utility functions. Production code can continue development while these are addressed incrementally.

**For Migration Details:** See `MIGRATION-2025.md` for complete breaking changes documentation and migration strategies.
