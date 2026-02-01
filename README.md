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

## Applications

- [blue-demo](apps/blue-demo/README.md)

## Packages

- [blue-content](packages/blue-content/README.md)
- [blue-context](packages/blue-context/README.md)
- [blue-core](packages/blue-core/README.md)
- [blue-dispatcher](packages/blue-dispatcher/README.md)
- [blue-domain](packages/blue-domain/README.md)
- [blue-factory](packages/blue-factory/README.md)
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

## Documentation Guide

### STYLE_GUIDE vs ARCHITECTURE

The project maintains two complementary documentation files for different purposes:

**STYLE_GUIDE.md - "How to Write Code"**
- **Focus:** Concrete implementation rules, naming, and formatting conventions
- **Audience:** All developers (including AI agents) writing code daily
- **Content:**
  - File naming conventions (kebab-case, underscore prefix, etc.)
  - Code naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
  - Prettier formatting rules (indentation, quotes, semicolons, etc.)
  - Module organization structure
  - Special patterns (internal files, test helpers, mixins)
  - Before/after examples of correct usage

**Think:** "How do I name this file/variable/class?" and "How should this code be formatted?"

**ARCHITECTURE.md - "Why the System Works This Way"**
- **Focus:** High-level design decisions, patterns, principles, and rationale
- **Audience:** Architects and senior developers understanding system design
- **Content:**
  - Core philosophy and design principles
  - Layered architecture organization
  - Design patterns (Strategy, Factory, Observer, Decorator, etc.)
  - Dependency management strategy (Library Integration Layer)
  - Module visibility concepts and API design
  - Roadmap and development phases

**Think:** "Why is the system designed this way?" and "What are the architectural patterns?"

**The Dividing Line:**

| Concern | ARCHITECTURE.md | STYLE_GUIDE.md |
| :--- | :--- | :--- |
| Dependency Management | "Use Library Integration Layer pattern" | "Import from @blue/util, not from ramda" |
| Code Organization | "Use Strategy Pattern for parsers" | "Name parser files: kebab-case.ts in src/" |
| Module Visibility | "Internal modules are implementation details" | "Prefix internal files with underscore: _util.ts" |
| Naming Philosophy | "Use `is` prefix for type checks, `like` for duck-typing" | "isString checks with typeof, returns boolean" |

**Maintenance Note:** When updating the dividing line explanation, update it in both `README.md` and `AGENTS.md` to keep them synchronized.

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

## File & Module Conventions

### Underscore-Prefix Pattern

Files prefixed with an underscore (`_*.ts`) are **internal to their package** and should not be considered part of the public API:

**Source files (`packages/*/src/_*.ts`):**
- Internal utilities and helper functions
- Implementation details not intended for external consumption
- Re-exports from dependencies organized for internal use
- Example: `_util.ts`, `_parser.ts`, `_natural-sort.ts`

**Test files (`packages/*/test/_*.ts`):**
- Test helper utilities and fixtures
- Custom assertion helpers
- Mock/worker implementations for testing
- Example: `_expect.ts`, `_worker.ts`

**Guidelines:**
- ❌ Do NOT export underscore-prefixed modules in `index.ts`
- ❌ Do NOT import underscore modules from other packages
- ✅ Use only within the same package
- ✅ Document purpose in file-level JSDoc comments

### Public API Surface

Each package's public API is defined by its `src/index.ts` file. Only modules explicitly exported there are considered public and stable.
