# BlueJS

A modular JavaScript/TypeScript framework organized as an Nx monorepo with
pnpm workspaces. The framework spans the browser and Node: a shared context
and dispatcher core, view and template technologies, HTTP clients and
servers, ORM, telemetry (OpenTelemetry), auth, and micro frontend hosting.

## Requirements

- **Node.js:** ≥24 (runtime, engines entry in the root manifest)
- **pnpm:** ≥11.0.0

## Technology Stack

- **TypeScript:** 7.0.2 (native compiler line; **doc tooling** runs on the
  pinned 6.0.3 toolchain — see `scripts/typedoc-ts-shim.mjs`)
- **Oxlint** (`pnpm lint`) + **oxfmt** (`pnpm format`) — formatting and
  linting
- **Nx:** 23.2.1 (monorepo management)
- **pnpm:** 11.4.0 (package manager)
- **Vitest:** 4.0.18 (testing + `vitest bench` benchmarks)
- **Vite:** 8.2.2 (bundler)

## Getting Started

### Work on the framework (this repository)

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

The full workflow — Nx targets, focused test runs, and the work-tracking
process — lives in [CONTRIBUTING.md](CONTRIBUTING.md).

### Build an application

Applications are pnpm workspaces over `@blue/*` packages; the
[`blue` CLI](packages/blue-cli/README.md) fronts the application lifecycle
(`blue new`, `blue dev`, `blue serve`, `blue generate`, `blue db`,
`blue inspect`, `blue doctor` — [guide 25](docs/guides/25-blue-cli.md)). Pick a
path below: each lists the packages to start with, then the demo apps to follow.

> **Pre-1.0:** the packages are not published yet — build from this repository
> and use the demo ladder as your starting point.

#### If you want to build a client-side web app

1. [`@blue/context`](packages/blue-context/README.md) + [`@blue/boot`](packages/blue-boot/README.md) — DI container and bootstrap
2. [`@blue/view-webcomponent`](packages/blue-view-webcomponent/README.md) — Web Component views
3. [`@blue/signals`](packages/blue-signals/README.md) — reactive state
4. [`@blue/router`](packages/blue-router/README.md) — routing
5. [`@blue/http`](packages/blue-http/README.md) — HTTP client (interceptors, parsers, cache)
6. [`@blue/platform-web`](packages/blue-platform-web/README.md) — browser platform glue

Then follow the ladder: [apps/01-blue-hello](apps/01-blue-hello/README.md)
(minimal SPA) → [apps/03-blue-todo](apps/03-blue-todo/README.md) (micro
frontend) → [apps/11-blue-conduit-web](apps/11-blue-conduit-web/README.md)
(RealWorld frontend).

#### If you want to build a Node server-side app

1. [`@blue/boot`](packages/blue-boot/README.md) — application bootstrap (`ApplicationBuilder`, profiles, typed config)
2. [`@blue/platform-node`](packages/blue-platform-node/README.md) — HTTP server, dispatcher, static files
3. [`@blue/dispatcher`](packages/blue-dispatcher/README.md) — controllers (`@getMapping` / `@postMapping`)
4. [`@blue/orm`](packages/blue-orm/README.md) + [`@blue/orm-drizzle`](packages/blue-orm-drizzle/README.md) — persistence
5. [`@blue/telemetry-node`](packages/blue-telemetry-node/README.md) — tracing, metrics, logging

Then follow the ladder: [apps/02-blue-hello-node](apps/02-blue-hello-node/README.md)
(minimal server) → [apps/04-blue-api](apps/04-blue-api/README.md) (the reference
Node app) → [apps/10-blue-conduit-api](apps/10-blue-conduit-api/README.md)
(RealWorld API). The end-to-end tutorial is [guide 01 — Building a Node
API](docs/guides/01-building-a-node-api.md).

#### Server-rendered with islands (both)

EJS shell + hydration + live updates: [apps/06-blue-island](apps/06-blue-island/README.md)
and [apps/12-blue-petclinic](apps/12-blue-petclinic/README.md); the model is
[guide 18 — Signals & Islands](docs/guides/18-signals-and-islands.md).

#### Run the demos

```bash
cd apps/<app-dir>
pnpm dev     # browser apps (Vite)
pnpm start   # Node apps (tsx)
```

All 19 apps — reading order, ports, what each demonstrates — are indexed in
[apps/README.md](apps/README.md); `pnpm apps:smoke` boots and probes every Node
demo.

## Applications

| App                                                            | What it demonstrates                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| [blue-hello](apps/01-blue-hello/README.md)                     | Minimal browser SPA — context + route + Web Component               |
| [blue-hello-node](apps/02-blue-hello-node/README.md)           | Minimal Node HTTP server                                            |
| [blue-todo](apps/03-blue-todo/README.md)                       | TodoMVC + micro frontend shell                                      |
| [blue-api](apps/04-blue-api/README.md)                         | Node API server — auth, ORM, negotiation, problem+json              |
| [blue-host](apps/05-blue-host/README.md)                       | Micro frontend host with lazy feature chunks                        |
| [blue-island](apps/06-blue-island/README.md)                   | Node SSR — EJS shell + island hydration + SSE                       |
| [blue-views](apps/07-blue-views/README.md)                     | View-resolution composite and negotiation                           |
| [blue-httpbin](apps/08-blue-httpbin/README.md)                 | HTTP semantics playground (binding, redirects, compression, limits) |
| [blue-todobackend](apps/09-blue-todobackend/README.md)         | Todo-Backend REST spec implementation                               |
| [blue-conduit-api](apps/10-blue-conduit-api/README.md)         | RealWorld (Conduit) API — JWT auth, CRUD, filters                   |
| [blue-conduit-web](apps/11-blue-conduit-web/README.md)         | RealWorld frontend (routes, guards, optimistic UI)                  |
| [blue-petclinic](apps/12-blue-petclinic/README.md)             | Server-rendered CRUD vertical (forms, i18n, JSON)                   |
| [blue-chat](apps/13-blue-chat/README.md)                       | Real-time rooms: presence, history, STOMP interop                   |
| [blue-kanban](apps/14-blue-kanban/README.md)                   | Collaborative board: versioned writes, optimistic UI                |
| [blue-resilience-lab](apps/15-blue-resilience-lab/README.md)   | Retry + circuit breaker lab (`@blue/resilience`)                    |
| [blue-redis-fanout](apps/16-blue-redis-fanout/README.md)       | Multi-node cache + socket fan-out (`@blue/redis`)                   |
| [blue-telemetry-lab](apps/17-blue-telemetry-lab/README.md)     | End-to-end observability — traces, metrics, sampling                |
| [blue-auth-playground](apps/18-blue-auth-playground/README.md) | Auth matrix — cookies, JWT, roles, OIDC + PKCE                      |
| [blue-hn](apps/19-blue-hn/README.md)                           | Hacker News reader — cached/offline HTTP client, long lists         |

The [apps/README](apps/README.md) documents the progression from simple to
complex. App directories are numbered in reading order (`apps/01-blue-hello` …);
the number is reading order only — package names stay unnumbered and stable.

## Packages

> The authoritative **package map** — every package's purpose, layer, platform,
> and runtime dependencies — lives in
> [ARCHITECTURE.md § Package Map](ARCHITECTURE.md#package-map). This list is a
> quick index with one-line purposes.

Core & infrastructure:

- [blue-core](packages/blue-core/README.md) — primitives, radix tree, media types
- [blue-util](packages/blue-util/README.md) — native helper utilities
- [blue-log](packages/blue-log/README.md) — logging core, severity mappings, thresholds (re-exported by `@blue/telemetry`)
- [blue-factory](packages/blue-factory/README.md) — IoC factory + scopes
- [blue-proxy](packages/blue-proxy/README.md) — method interception: annotation-driven advice weaving
- [blue-resilience](packages/blue-resilience/README.md) — resilience policies: `@retry`, `@circuitBreaker`
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
- [blue-redis](packages/blue-redis/README.md) — shared Redis cache + cross-node pub/sub fan-out (Node)
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
- [blue-oxlint-plugin](packages/blue-oxlint-plugin/README.md) — consumer-facing oxlint rules (repo-only rules live in [src/oxlint](src/oxlint/README.md))
- [blue-inspect](packages/blue-inspect/README.md) — deterministic app manifest generator (routes, mappings, config keys)
- [blue-generators](packages/blue-generators/README.md) — Nx scaffolding

Micro frontends:

- [blue-host](packages/blue-host/README.md) — host orchestration + feature mounting

## Documentation

| Document                           | Answers                                                                                                                                                                                                                                                     |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | _Why is the system built this way?_ — philosophy, layers, design patterns, dependency strategy, the package map, roadmap                                                                                                                                    |
| [STYLE_GUIDE.md](STYLE_GUIDE.md)   | _How do I write code here?_ — naming, formatting, file/module conventions, with per-section enforcement markers                                                                                                                                             |
| [CONTRIBUTING.md](CONTRIBUTING.md) | _How do I contribute?_ — setup, work tracking (issue → branch → PR), quality gates                                                                                                                                                                          |
| [docs/](docs/README.md)            | The documentation set: [guides](docs/guides/README.md) (numbered how-tos), [architecture topics](docs/architecture/README.md), [reference](docs/reference/README.md), [decisions (ADRs)](docs/decisions/README.md), [migrations](docs/migrations/README.md) |
| [AGENTS.md](AGENTS.md)             | Instructions for AI agents working in this repository                                                                                                                                                                                                       |
| [API.md](API.md)                   | Generated per-package API reference index (`pnpm doc:api`, freshness-gated)                                                                                                                                                                                 |

Conventions and layout rules are stated once, in [STYLE_GUIDE.md](STYLE_GUIDE.md);
architectural rationale once, in [ARCHITECTURE.md](ARCHITECTURE.md). This README
links them rather than restating them.

Tooling and generated surfaces:

- **Benchmarks** — `pnpm test:bench` runs the vitest bench suites; the
  todomvc Speedometer-3-style comparison runs via `pnpm test:benchmark:*`
- **Repository graph** — `graft build` maintains the local `graft/` code
  graph used by context-aware tooling

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

# Run tests in watch mode
pnpm vitest --watch

# UI mode and coverage are optional and need their plugins installed first:
#   pnpm add -w -D @vitest/ui @vitest/coverage-v8
pnpm vitest --ui
nx run-many -t test --coverage
```

## Code Style

The project uses **oxfmt** for formatting and **oxlint** for code quality
checks:

```bash
pnpm format        # fix
pnpm format:check  # verify
pnpm lint          # oxlint --type-aware --deny-warnings
```

Rules, naming conventions, patterns, and enforcement markers:
[STYLE_GUIDE.md](STYLE_GUIDE.md).

## Versioning

All BlueJS packages and applications are currently versioned below `1.0.0`,
indicating active development:

- Breaking changes may occur between commits
- Please file an issue when an API surprises you — the roadmap targets
  [Semantic Versioning 2.0.0](https://semver.org/) guarantees at `1.0.0`
