# BlueJS

A modular JavaScript/TypeScript framework organized as an Nx monorepo with
pnpm workspaces. The framework spans the browser and Node: a shared context
and dispatcher core, view and template technologies, HTTP clients and
servers, ORM, telemetry (OpenTelemetry), auth, and micro frontend hosting.

## Requirements

- **Node.js:** ≥22 (runtime, engines entry in the root manifest)
- **pnpm:** ≥11.0.0

## Technology Stack

- **TypeScript:** 7.0.2 (native compiler line; **doc tooling** runs on the
  pinned 6.0.3 toolchain — see `scripts/typedoc-ts-shim.mjs`)
- **Oxlint** (`pnpm lint`) + **oxfmt** (`pnpm format`) — formatting and
  linting
- **Nx:** 23.2.0 (monorepo management)
- **pnpm:** 11.4.0 (package manager)
- **Vitest:** 4.0.18 (testing + `vitest bench` benchmarks)
- **Vite:** 8.2.2 (bundler)

## Getting Started

```bash
# Enable pnpm via corepack (first time only)
corepack enable

# Install dependencies (postinstall applies the typedoc toolchain shim)
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint + format
pnpm lint
pnpm format:check
```

## Applications

| App                                               | What it demonstrates                                   |
| ------------------------------------------------- | ------------------------------------------------------ |
| [blue-hello](apps/blue-hello/README.md)           | Minimal browser SPA — context + route + Web Component  |
| [blue-hello-node](apps/blue-hello-node/README.md) | Minimal Node HTTP server                               |
| [blue-todo](apps/blue-todo/README.md)             | TodoMVC + micro frontend shell                         |
| [blue-api](apps/blue-api/README.md)               | Node API server — auth, ORM, negotiation, problem+json |
| [blue-host](apps/blue-host/README.md)             | Micro frontend host with lazy feature chunks           |
| [blue-island](apps/blue-island/README.md)         | Node SSR — EJS shell + island hydration + SSE          |
| [blue-views](apps/blue-views/README.md)           | View-resolution composite and negotiation              |

The [apps/README](apps/README.md) documents the progression from simple to
complex.

## Packages

> The authoritative **package map** — every package's purpose, layer, platform,
> and runtime dependencies — lives in
> [ARCHITECTURE.md § Package Map](ARCHITECTURE.md#package-map). This list is a
> quick index with one-line purposes.

Core & infrastructure:

- [blue-core](packages/blue-core/README.md) — primitives, radix tree, media types
- [blue-util](packages/blue-util/README.md) — native helper utilities
- [blue-factory](packages/blue-factory/README.md) — IoC factory + scopes
- [blue-context](packages/blue-context/README.md) — application context, configuration, environments
- [blue-boot](packages/blue-boot/README.md) — application bootstrap, profiles, typed config
- [blue-signals](packages/blue-signals/README.md) — reactive state
- [blue-dom](packages/blue-dom/README.md) — isomorphic DOM providers
- [blue-cache](packages/blue-cache/README.md) — cache manager + `@cached` decorator
- [blue-scheduler](packages/blue-scheduler/README.md) — cron scheduling (`@scheduled`), task registry

Content & i18n:

- [blue-content](packages/blue-content/README.md) — content keys, themes, message-source contract
- [blue-content-i18next](packages/blue-content-i18next/README.md) — i18next `MessageSource` adapter

HTTP & routing:

- [blue-http](packages/blue-http/README.md) — fetch-based client, interceptors, parsers
- [blue-router](packages/blue-router/README.md) — routes, feature/partition routing
- [blue-socket](packages/blue-socket/README.md) — WebSocket domain: STOMP client, session contracts
- [blue-service](packages/blue-service/README.md) — typed service clients, SSE

Dispatch & views:

- [blue-dispatcher](packages/blue-dispatcher/README.md) — request dispatch, parameters, radix mapping
- [blue-view](packages/blue-view/README.md) — views, targets, content negotiation
- [blue-view-ejs](packages/blue-view-ejs/README.md) — EJS template technology
- [blue-view-webcomponent](packages/blue-view-webcomponent/README.md) — Web Component views

Platforms:

- [blue-platform-node](packages/blue-platform-node/README.md) — Node HTTP server, dispatcher, static files
- [blue-platform-web](packages/blue-platform-web/README.md) — browser platform glue

Data & management:

- [blue-orm](packages/blue-orm/README.md) — repository/data-mapper persistence
- [blue-orm-drizzle](packages/blue-orm-drizzle/README.md) — Drizzle ORM adapter
- [blue-management](packages/blue-management/README.md) — `/health`, `/metrics` endpoints
- [blue-openapi](packages/blue-openapi/README.md) — OpenAPI 3.0 spec from dispatch metadata + Swagger UI

Auth:

- [blue-auth-core](packages/blue-auth-core/README.md) — contracts, principal, registry
- [blue-auth-client](packages/blue-auth-client/README.md) — client auth + OIDC
- [blue-auth-server](packages/blue-auth-server/README.md) — server auth + JWT

Telemetry:

- [blue-telemetry](packages/blue-telemetry/README.md) — isomorphic API core
- [blue-telemetry-node](packages/blue-telemetry-node/README.md) — NodeSDK + Node instrumentations
- [blue-telemetry-web](packages/blue-telemetry-web/README.md) — browser setup + instrumentations

Testing & tooling:

- [blue-test](packages/blue-test/README.md) — MockHTTP in-process test harness
- [blue-oxlint-plugin](packages/blue-oxlint-plugin/README.md) — architecture-enforcing oxlint rules
- [blue-generators](packages/blue-generators/README.md) — Nx scaffolding

Micro frontends:

- [blue-host](packages/blue-host/README.md) — host orchestration + feature mounting

## Documentation

- **API reference** — `pnpm doc:api` generates each package's reference from
  JSDoc into `packages/<name>/doc/api/` (index:
  [doc/README.md](doc/README.md))
- **Guides** — the hand-written documentation set lives in `docs/`
  ([index](docs/README.md)): [guides](docs/guides/README.md),
  [architecture](docs/architecture/README.md),
  [reference](docs/reference/README.md),
  [migrations](docs/migrations/README.md)
- **Benchmarks** — `pnpm test:bench` runs the vitest bench suites; the
  todomvc Speedometer-3-style comparison runs via `pnpm test:benchmark:*`
- **Repository graph** — `graft build` maintains the local `graft/` code
  graph used by context-aware tooling

## Development

## Build Commands

```bash
# Build all packages (from root)
pnpm build            # Build lib for all packages
pnpm build:all        # Build lib and bundles

# Build with Nx directly
nx run-many -t build:lib

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

# Run tests in watch mode / with UI / with coverage
pnpm vitest --watch
pnpm vitest --ui
nx run-many -t test --coverage
```

## Code Style

The project uses **oxfmt** for formatting and **oxlint** for code quality
checks:

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Run linter
pnpm lint
```

**Configuration:**

- Oxfmt: `oxfmt` via `pnpm format` (120-column, 4-space indent, single quotes)
- Oxlint: `.oxlintrc.json` plus the repository rules in
  `@blue/oxlint-plugin`

## Documentation Guide

### STYLE_GUIDE vs ARCHITECTURE

The project maintains two complementary documentation files for different purposes:

**STYLE_GUIDE.md - "How to Write Code"**

- **Focus:** Concrete implementation rules, naming, and formatting conventions
- **Audience:** All developers (including AI agents) writing code daily
- **Content:**
    - File naming conventions (kebab-case, underscore prefix, etc.)
    - Code naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
    - oxfmt formatting rules (indentation, quotes, semicolons, etc.)
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

| Concern               | ARCHITECTURE.md                                           | STYLE_GUIDE.md                                     |
| :-------------------- | :-------------------------------------------------------- | :------------------------------------------------- |
| Dependency Management | "Use Library Integration Layer pattern"                   | "Import from @blue/util, not from seedrandom"      |
| Code Organization     | "Use Strategy Pattern for parsers"                        | "Name parser files: kebab-case.ts in src/"         |
| Module Visibility     | "Internal modules are implementation details"             | "Prefix internal files with underscore: \_util.ts" |
| Naming Philosophy     | "Use `is` prefix for type checks, `like` for duck-typing" | "isString checks with typeof, returns boolean"     |

**Maintenance Note:** When updating the dividing line explanation, update it in both `README.md` and `AGENTS.md` to keep them synchronized.

## Terminology

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

## Versioning

All BlueJS packages and applications are currently versioned below `1.0.0`,
indicating active development:

- Breaking changes may occur between commits
- Please file an issue when an API surprises you — the roadmap targets
  [Semantic Versioning 2.0.0](https://semver.org/) guarantees at `1.0.0`
