# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Additional Documentation:**

- `MIGRATION-2025.md` - Breaking changes and migration guide for the January 2025 dependency modernization
- `MIGRATION-TOOLING-2025.md` - Tooling migration guide (Yarn→pnpm, Lerna→Nx, Jest→Vitest)
- `MIGRATION-VITE-2025.md` - Build tool migration guide (webpack→Vite)
- `DEPENDENCIES-2025.md` - Complete list of dependency versions and comparisons
- `README.md` - Getting started and project overview

## Overview

BlueJS is a modular JavaScript/TypeScript framework organized as an **Nx monorepo** with **pnpm workspaces**. The framework provides core abstractions and utilities for building web applications, including routing, views, models, context management, and HTTP handling.

**Requirements:**

- Node.js ≥18.0.0
- pnpm ≥8.0.0

**Technology Stack (as of January 2025):**

- TypeScript 5.7.3 (ES2022 target, Bundler module resolution)
- ESLint 9.17.0 (flat config)
- Nx 20.3.4 (monorepo management, task orchestration, caching)
- Vitest 2.1.9 (testing framework)
- Vite 6.0.15 (bundler for production builds)
- pnpm 8.15.0 (package manager)
- Prettier 3.4.2 (code formatting)

## Repository Structure

This is a monorepo containing **20 packages** under `packages/`, each with a consistent structure:

- `src/` - TypeScript source files
- `lib/` - Compiled ESM output (generated)
- `index.js` - Compiled CommonJS bundle (generated)
- `index.cjs` - Compiled CommonJS bundle from Vite (generated)
- `test/` - Vitest tests

**All Packages:**

- @blue/boot
- @blue/content
- @blue/context
- @blue/core
- @blue/demo
- @blue/dispatcher
- @blue/domain
- @blue/factory
- @blue/http
- @blue/logger
- @blue/model
- @blue/parser
- @blue/platform-web
- @blue/print
- @blue/router
- @blue/service
- @blue/util
- @blue/validate
- @blue/view
- @blue/view-webcomponent

**Key packages and their dependencies:**

- **blue-core**: Foundation interfaces and utilities (Iterable, Comparable, Equatable, MediaType, etc.)
- **blue-util**: Utility functions, depends on blue-parser
- **blue-parser**: Parsing utilities
- **blue-context**: Application context and dependency injection, depends on blue-core, blue-factory, blue-logger
- **blue-factory**: Factory and instantiation patterns
- **blue-router**: Routing functionality, depends on blue-core
- **blue-view**: View layer abstractions, depends on blue-context, blue-core, blue-factory, blue-router
- **blue-view-webcomponent**: Web Components view implementation
- **blue-model**: Model layer using objectmodel library
- **blue-http**: HTTP client functionality
- **blue-dispatcher**: Request dispatching, depends on blue-http, blue-router, blue-view
- **blue-domain**: Domain modeling
- **blue-content**: Content handling
- **blue-logger**: Logging utilities with OpenTelemetry support
- **blue-validate**: Validation utilities
- **blue-print**: Printing utilities
- **blue-platform-web**: Web platform specifics
- **blue-boot**: Application bootstrapping
- **blue-service**: Service layer utilities
- **blue-demo**: Demo applications and examples

## Development Commands

### Building

Packages use Nx for efficient monorepo builds with caching and Vite for fast bundling:

```bash
# Build all packages (from root)
pnpm build            # Build TypeScript (lib/) for all packages
pnpm build:all        # Build lib and Vite bundles for all packages
nx run-many -t build:lib     # Nx directly

# Build specific package
nx run @blue/core:build:lib
cd packages/blue-core && pnpm build:lib

# Build bundles with Vite
nx run-many -t build:bundle  # Creates ESM and CommonJS bundles
cd packages/blue-core && pnpm build:bundle

# Build with dependency graph
nx graph              # Visualize package dependencies
```

**Build Process:**

- `build:lib` - TypeScript compiler creates ESM output in `lib/`
- `build:bundle` - Vite creates optimized bundles (index.js, index.cjs) with source maps
- Nx intelligently caches builds and only rebuilds what changed
- Vite provides near-instant builds with HMR and optimized output

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

### Code Formatting and Linting

```bash
# Format code (from root or package directory)
pnpm format           # Format all code with Prettier
pnpm format:check     # Check formatting without modifying files

# Lint code (from root or package directory)
pnpm lint             # Lint all code
npx eslint <path>     # ESLint 9 with TypeScript support
```

**Prettier** (`prettier.config.mjs`) handles code formatting:

- 4-space indentation for JavaScript/TypeScript
- 2-space indentation for JSON/YAML
- Single quotes for strings
- Semicolons required
- LF line endings
- 120 character line width

**ESLint** (`eslint.config.mjs`) handles code quality:

- TypeScript-specific rules via @typescript-eslint v8
- Integrated with Prettier (formatting rules disabled)
- Flat config format (ESLint 9 requirement)

### Documentation

```bash
# Generate documentation (from root directory)
pnpm doc              # Generate documentation (default: markdown)
pnpm doc:md           # Generate markdown documentation with TypeDoc
pnpm doc:html         # Generate HTML documentation with TypeDoc
pnpm doc:json         # Generate JSON API documentation
pnpm doc:watch        # Watch mode - regenerate on changes
```

Documentation is generated using **TypeDoc** with TSDoc comments:

- Output directory: `doc-md/` (markdown) or `doc-html/` (HTML)
- Configuration: `typedoc.json`
- Custom plugin: `scripts/typedoc-plugin-sig.js` (for `@sig` tags)
- 856 markdown files generated across 19 packages

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

## Nx Configuration

The project uses Nx (`nx.json`) for efficient task orchestration and caching:

**Key Features:**

- **Dependency-aware builds**: Nx automatically resolves build order based on package dependencies
- **Intelligent caching**: Build outputs are cached and reused when unchanged
- **Parallel execution**: Runs up to 3 tasks in parallel (configurable)
- **Affected commands**: Only build/test packages affected by changes

**Target Definitions:**

- `build:lib` - Depends on upstream packages' `build:lib`, caches output in `lib/`
- `build:bundle` - Depends on `build:lib`, creates Vite bundles
- `build:all` - Runs both `build:lib` and `build:bundle`
- `test` - Depends on `build:lib`, runs Vitest tests
- `lint` - Runs ESLint with caching

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

- TypeScript: 5.7.3
- Target: ES2022 (supports private class fields with `#field` syntax)
- Module: ESNext (with ESM output)
- Module Resolution: Bundler
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

### Dual Module Format

Packages export both ESM and CommonJS:

- `lib/index.js` - ESM output from TypeScript
- `index.js` - CommonJS bundle from Vite
- package.json specifies both via `exports`, `main`, and `module` fields

### Shared Build Infrastructure

All packages use centralized build scripts in `bin/` rather than duplicating logic. These scripts assume execution from a package directory (e.g., `packages/blue-core/`) and reference root-level tools via relative paths (`../../node_modules/.bin/`).

## Key Dependencies

### Runtime Dependencies

**blue-util package:**

- `date-fns`: ~4.1.0 (ESM-first, improved tree-shaking)
- `date-fns-tz`: ~3.2.0 (timezone support)
- `ramda`: ~0.32.0 (functional programming utilities)
- `slug`: ~11.0.1 (URL slug generation)
- `seedrandom`: ~3.0.5 (deterministic random numbers)

**blue-model package:**

- `objectmodel`: ~4.4.6 (runtime type checking)

**blue-factory and others:**

- `reflect-metadata`: ~0.2.2 (decorator metadata support)

### Development Dependencies (Root)

**Build Tools:**

- `typescript`: ~5.7.2
- `vite`: ~6.0.7
- `vite-plugin-dts`: ~4.3.0

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

**ramda v0.32:** Minor updates from v0.31. Most APIs remain compatible.

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

Vitest configuration is in `vitest.config.ts` at the root, with path aliases for all @blue/\* packages.

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

All packages are scoped under `@blue/` and use semver with alpha pre-release identifiers (e.g., `3.0.0-alpha.0`).

The project is being prepared for publication to npm. When ready to publish, add to individual package.json files:

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org"
}
```

## pnpm Configuration

The project uses a minimal `.npmrc` configuration optimized for performance and modern conventions:

**Key Settings:**

- `strict-peer-dependencies=false` - Allows flexible peer deps in monorepo
- `auto-install-peers=true` - Automatically installs missing peer dependencies
- `link-workspace-packages=true` - Symlinks workspace packages for faster development
- `save-workspace-protocol=rolling` - Uses `workspace:*` for local packages
- `engine-strict=true` - Enforces Node.js version requirements
- Selective hoisting for tooling (`@types/*`, `eslint*`, `prettier*`, `vite*`, `vitest*`)

**Performance Features:**

- Uses pnpm's dependency isolation (no `shamefully-hoist`)
- Offline-first package resolution (`prefer-offline=true`)
- Intelligent caching and minimal duplication

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
- Migrated from webpack to **Vite** (faster builds, better DX)
- Removed legacy configuration files

**⚠️ Known Issues Requiring Code Updates:**

1. **blue-logger Missing date-fns Dependency**: The logger package uses `date-fns` in `src/layouts/pattern-layout.ts` but doesn't declare it as a dependency. Needs to add `date-fns` to package dependencies.

2. **blue-util Test Failures**: 2 test failures in blue-util package:

    - `test/list/range-n.spec.ts` - Related to Ramda 0.32 API changes
    - `test/type/like-array.spec.ts` - Array-like detection issue

3. **Multiple Package Test Failures**: Several packages have test failures that need investigation:

    - @blue/core (1 test failure)
    - @blue/parser
    - @blue/content
    - @blue/factory
    - @blue/service
    - @blue/http
    - @blue/validate
    - @blue/print

4. **date-fns-tz v3 Import**: Module resolution issue with `date-fns-tz/fp` import in `packages/blue-util/src/date/index.ts`. May need moduleResolution update or import path adjustment.

**Status:** Build infrastructure is fully operational. TypeScript builds complete successfully with caching. Test failures are localized to specific packages and don't block development. Issues should be addressed incrementally.

**For Migration Details:** See `MIGRATION-2025.md` for complete breaking changes documentation and migration strategies.
