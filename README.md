# BlueJS

A modular JavaScript/TypeScript framework organized as an Nx monorepo with pnpm workspaces.

## Requirements

- **Node.js:** ≥18.0.0
- **pnpm:** ≥8.0.0

## Technology Stack

- **TypeScript:** 5.7.2 (ES2022 target)
- **ESLint:** 9.17.0 (flat config)
- **Nx:** 20.3.2 (monorepo management)
- **pnpm:** 8.15.0 (package manager)
- **Vitest:** 2.1.8 (testing framework)
- **Vite:** 6.0.7 (bundler)

## Getting Started

```bash
# Enable pnpm via corepack (first time only)
corepack enable

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Packages

- [blue-content](packages/blue-content/README.md)
- [blue-context](packages/blue-context/README.md)
- [blue-core](packages/blue-core/README.md)
- [blue-demo](packages/blue-demo/README.md)
- [blue-dispatcher](packages/blue-dispatcher/README.md)
- [blue-domain](packages/blue-domain/README.md)
- [blue-factory](packages/blue-factory/README.md)
- [blue-fill](packages/blue-fill/README.md)
- [blue-has](packages/blue-has/README.md)
- [blue-http](packages/blue-http/README.md)
- [blue-logger](packages/blue-logger/README.md)
- [blue-model](packages/blue-model/README.md)
- [blue-parser](packages/blue-parser/README.md)
- [blue-platform-web](packages/blue-platform-web/README.md)
- [blue-print](packages/blue-print/README.md)
- [blue-router](packages/blue-router/README.md)
- [blue-util](packages/blue-util/README.md)
- [blue-validate](packages/blue-validate/README.md)
- [blue-view](packages/blue-view/README.md)
- [blue-view-ractive](packages/blue-view-ractive/README.md)
- [blue-view-webcomponent](packages/blue-view-webcomponent/README.md)

# Development

## Build Commands

```bash
# Build all packages (from root)
pnpm build            # Build lib for all packages
pnpm build:all        # Build lib and bundles

# Build with Nx directly
nx run-many -t build:lib
nx run-many -t build:all

# Build specific package
nx run @blue/core:build:lib
cd packages/blue-core && pnpm build:lib

# View dependency graph
nx graph
```

## Testing

```bash
# Run all tests (from root)
pnpm test                    # Run all tests with Vitest
nx run-many -t test          # Nx directly

# Run specific package tests
nx run @blue/core:test
cd packages/blue-core && pnpm test

# Run tests in watch mode
pnpm vitest --watch

# Run tests with UI
pnpm vitest --ui

# Run with coverage
nx run-many -t test --coverage
```

## Code Style

The project uses Prettier for code formatting and ESLint 9 for code quality checks:

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Run linter
pnpm lint
```

**Configuration:**

- Prettier: `prettier.config.mjs`
- ESLint: `eslint.config.mjs` (flat config)

**Formatting Rules:**

- 4-space indentation for JavaScript/TypeScript
- 2-space indentation for JSON/YAML
- Single quotes for strings
- Semicolons required
- LF line endings
- 120 character line width
- Trailing commas (ES5)

# Terminology

## Naming Conventions

- **PascalCase** for classes and class mixins, e.g. `MyClass`
- **camelCase** for variables, properties, and methods, e.g. `myMethod`
- **is** prefix for type/inheritance checks (uses `typeof` or `instanceof`), e.g. `isString( value )`
- **like** prefix for duck-typing/interface checks, e.g. `likeController( value )` checks for expected properties
- **as** prefix for mixins that apply functionality:
    - Class mixins: `AsEventEmitter( Component )` produces a new class with combined capabilities
    - Function mixins: `asEventEmitter( component )` adds event emitter methods to the instance
- **Configurable** suffix denotes interfaces/classes with setters for normally readonly properties
