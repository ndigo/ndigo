<p align="center">
  <img src="assets/images/Ndigo.svg" alt="Ndigo logo" width="160" height="160">
</p>

# Ndigo

A modular TypeScript framework that spans the Browser and Node: a shared context and dispatcher core, view and template technologies, HTTP clients and servers, ORM, telemetry, auth, and micro frontend hosting.

## Requirements

- **Node.js:** ≥24 (runtime, engines entry in the root manifest)
- **pnpm:** ≥12.0.0

## Technology Stack

- **TypeScript:** 7.0.2 (native compiler line; **doc tooling** runs on the
  pinned 6.0.3 toolchain — see `scripts/typedoc-ts-shim.mjs`)
- **Oxlint** (`pnpm lint`) + **oxfmt** (`pnpm format`) — formatting and
  linting
- **Nx:** 24.0.4 (monorepo management)
- **pnpm:** 12.16.1 (package manager)
- **Vitest:** 5.1.0 (testing + `vitest bench` benchmarks)
- **Vite:** 8.3.5 (bundler)

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

Applications are pnpm workspaces over `@ndigo/*` packages; the
[`ndigo` CLI](packages/ndigo-cli/README.md) fronts the application lifecycle
(`ndigo new`, `ndigo dev`, `ndigo serve`, `ndigo generate`, `ndigo db`,
`ndigo inspect`, `ndigo doctor` — [guide 25](docs/guides/25-ndigo-cli.md)). Pick a
path below: each lists the packages to start with, then the demo apps to follow.

> **Pre-1.0:** the packages are not published yet — build from this repository
> and use the demo ladder as your starting point.

#### If you want to build a client-side web app

1. [`@ndigo/context`](packages/ndigo-context/README.md) + [`@ndigo/boot`](packages/ndigo-boot/README.md) — DI container and bootstrap
2. [`@ndigo/view-webcomponent`](packages/ndigo-view-webcomponent/README.md) — Web Component views
3. [`@ndigo/signals`](packages/ndigo-signals/README.md) — reactive state
4. [`@ndigo/router`](packages/ndigo-router/README.md) — routing
5. [`@ndigo/http`](packages/ndigo-http/README.md) — HTTP client (interceptors, parsers, cache)
6. [`@ndigo/platform-web`](packages/ndigo-platform-web/README.md) — browser platform glue

Then follow the ladder: [apps/01-ndigo-hello](apps/01-ndigo-hello/README.md)
(minimal SPA) → [apps/03-ndigo-todo](apps/03-ndigo-todo/README.md) (micro
frontend) → [apps/11-ndigo-conduit-web](apps/11-ndigo-conduit-web/README.md)
(RealWorld frontend).

#### If you want to build a Node server-side app

1. [`@ndigo/boot`](packages/ndigo-boot/README.md) — application bootstrap (`ApplicationBuilder`, profiles, typed config)
2. [`@ndigo/platform-node`](packages/ndigo-platform-node/README.md) — HTTP server, dispatcher, static files
3. [`@ndigo/dispatcher`](packages/ndigo-dispatcher/README.md) — controllers (`@getMapping` / `@postMapping`)
4. [`@ndigo/orm`](packages/ndigo-orm/README.md) + [`@ndigo/orm-drizzle`](packages/ndigo-orm-drizzle/README.md) — persistence
5. [`@ndigo/telemetry-node`](packages/ndigo-telemetry-node/README.md) — tracing, metrics, logging

Then follow the ladder: [apps/02-ndigo-hello-node](apps/02-ndigo-hello-node/README.md)
(minimal server) → [apps/04-ndigo-api](apps/04-ndigo-api/README.md) (the reference
Node app) → [apps/10-ndigo-conduit-api](apps/10-ndigo-conduit-api/README.md)
(RealWorld API). The end-to-end tutorial is [guide 01 — Building a Node
API](docs/guides/01-building-a-node-api.md).

#### Server-rendered with islands (both)

EJS shell + hydration + live updates: [apps/06-ndigo-island](apps/06-ndigo-island/README.md)
and [apps/12-ndigo-petclinic](apps/12-ndigo-petclinic/README.md); the model is
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

| App                                                              | What it demonstrates                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| [ndigo-hello](apps/01-ndigo-hello/README.md)                     | Minimal browser SPA — context + route + Web Component               |
| [ndigo-hello-node](apps/02-ndigo-hello-node/README.md)           | Minimal Node HTTP server                                            |
| [ndigo-todo](apps/03-ndigo-todo/README.md)                       | TodoMVC + micro frontend shell                                      |
| [ndigo-api](apps/04-ndigo-api/README.md)                         | Node API server — auth, ORM, negotiation, problem+json              |
| [ndigo-host](apps/05-ndigo-host/README.md)                       | Micro frontend host with lazy feature chunks                        |
| [ndigo-island](apps/06-ndigo-island/README.md)                   | Node SSR — EJS shell + island hydration + SSE                       |
| [ndigo-views](apps/07-ndigo-views/README.md)                     | View-resolution composite and negotiation                           |
| [ndigo-httpbin](apps/08-ndigo-httpbin/README.md)                 | HTTP semantics playground (binding, redirects, compression, limits) |
| [ndigo-todobackend](apps/09-ndigo-todobackend/README.md)         | Todo-Backend REST spec implementation                               |
| [ndigo-conduit-api](apps/10-ndigo-conduit-api/README.md)         | RealWorld (Conduit) API — JWT auth, CRUD, filters                   |
| [ndigo-conduit-web](apps/11-ndigo-conduit-web/README.md)         | RealWorld frontend (routes, guards, optimistic UI)                  |
| [ndigo-petclinic](apps/12-ndigo-petclinic/README.md)             | Server-rendered CRUD vertical (forms, i18n, JSON)                   |
| [ndigo-chat](apps/13-ndigo-chat/README.md)                       | Real-time rooms: presence, history, STOMP interop                   |
| [ndigo-kanban](apps/14-ndigo-kanban/README.md)                   | Collaborative board: versioned writes, optimistic UI                |
| [ndigo-resilience-lab](apps/15-ndigo-resilience-lab/README.md)   | Retry + circuit breaker lab (`@ndigo/resilience`)                   |
| [ndigo-redis-fanout](apps/16-ndigo-redis-fanout/README.md)       | Multi-node cache + socket fan-out (`@ndigo/redis`)                  |
| [ndigo-telemetry-lab](apps/17-ndigo-telemetry-lab/README.md)     | End-to-end observability — traces, metrics, sampling                |
| [ndigo-auth-playground](apps/18-ndigo-auth-playground/README.md) | Auth matrix — cookies, JWT, roles, OIDC + PKCE                      |
| [ndigo-hn](apps/19-ndigo-hn/README.md)                           | Hacker News reader — cached/offline HTTP client, long lists         |

The [apps/README](apps/README.md) documents the progression from simple to
complex. App directories are numbered in reading order (`apps/01-ndigo-hello` …);
the number is reading order only — package names stay unnumbered and stable.

## Packages

> The authoritative **package map** — every package's purpose, layer, platform,
> and runtime dependencies — lives in
> [ARCHITECTURE.md § Package Map](ARCHITECTURE.md#package-map). This list is a
> quick index with one-line purposes.

Core & infrastructure:

- [ndigo-core](packages/ndigo-core/README.md) — primitives, radix tree, media types
- [ndigo-util](packages/ndigo-util/README.md) — native helper utilities
- [ndigo-log](packages/ndigo-log/README.md) — logging core, severity mappings, thresholds (re-exported by `@ndigo/telemetry`)
- [ndigo-factory](packages/ndigo-factory/README.md) — IoC factory + scopes
- [ndigo-proxy](packages/ndigo-proxy/README.md) — method interception: annotation-driven advice weaving
- [ndigo-resilience](packages/ndigo-resilience/README.md) — resilience policies: `@retry`, `@circuitBreaker`
- [ndigo-context](packages/ndigo-context/README.md) — application context, configuration, environments
- [ndigo-boot](packages/ndigo-boot/README.md) — application bootstrap, profiles, typed config
- [ndigo-signals](packages/ndigo-signals/README.md) — reactive state
- [ndigo-dom](packages/ndigo-dom/README.md) — isomorphic DOM providers
- [ndigo-cache](packages/ndigo-cache/README.md) — cache manager + `@cached` decorator
- [ndigo-scheduler](packages/ndigo-scheduler/README.md) — cron scheduling (`@scheduled`), task registry

Content & i18n:

- [ndigo-content](packages/ndigo-content/README.md) — content keys, themes, message-source contract
- [ndigo-content-i18next](packages/ndigo-content-i18next/README.md) — i18next `MessageSource` adapter

HTTP & routing:

- [ndigo-http](packages/ndigo-http/README.md) — fetch-based client, interceptors, parsers
- [ndigo-router](packages/ndigo-router/README.md) — routes, feature/partition routing
- [ndigo-socket](packages/ndigo-socket/README.md) — WebSocket domain: STOMP client, session contracts
- [ndigo-service](packages/ndigo-service/README.md) — typed service clients, SSE

Dispatch & views:

- [ndigo-dispatcher](packages/ndigo-dispatcher/README.md) — request dispatch, parameters, radix mapping
- [ndigo-view](packages/ndigo-view/README.md) — views, targets, content negotiation
- [ndigo-view-ejs](packages/ndigo-view-ejs/README.md) — EJS template technology
- [ndigo-view-webcomponent](packages/ndigo-view-webcomponent/README.md) — Web Component views

Platforms:

- [ndigo-platform-node](packages/ndigo-platform-node/README.md) — Node HTTP server, dispatcher, static files
- [ndigo-platform-web](packages/ndigo-platform-web/README.md) — browser platform glue

Data & management:

- [ndigo-orm](packages/ndigo-orm/README.md) — repository/data-mapper persistence
- [ndigo-orm-drizzle](packages/ndigo-orm-drizzle/README.md) — Drizzle ORM adapter
- [ndigo-redis](packages/ndigo-redis/README.md) — shared Redis cache + cross-node pub/sub fan-out (Node)
- [ndigo-management](packages/ndigo-management/README.md) — `/health`, `/metrics` endpoints
- [ndigo-openapi](packages/ndigo-openapi/README.md) — OpenAPI 3.0 spec from dispatch metadata + Swagger UI

Auth:

- [ndigo-auth-core](packages/ndigo-auth-core/README.md) — contracts, principal, registry
- [ndigo-auth-client](packages/ndigo-auth-client/README.md) — client auth + OIDC
- [ndigo-auth-server](packages/ndigo-auth-server/README.md) — server auth + JWT

Telemetry:

- [ndigo-telemetry](packages/ndigo-telemetry/README.md) — isomorphic API core
- [ndigo-telemetry-node](packages/ndigo-telemetry-node/README.md) — NodeSDK + Node instrumentations
- [ndigo-telemetry-web](packages/ndigo-telemetry-web/README.md) — browser setup + instrumentations

Testing & tooling:

- [ndigo-test](packages/ndigo-test/README.md) — MockHTTP in-process test harness
- [ndigo-oxlint-plugin](packages/ndigo-oxlint-plugin/README.md) — consumer-facing oxlint rules (repo-only rules live in [src/oxlint](src/oxlint/README.md))
- [ndigo-inspect](packages/ndigo-inspect/README.md) — deterministic app manifest generator (routes, mappings, config keys)
- [ndigo-generators](packages/ndigo-generators/README.md) — Nx scaffolding

Micro frontends:

- [ndigo-host](packages/ndigo-host/README.md) — host orchestration + feature mounting

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
nx run @ndigo/core:build:lib
cd packages/ndigo-core && pnpm build:lib

# View dependency graph
nx graph
```

## Testing

```bash
# Run all tests (from root)
pnpm test                    # Run all tests with Vitest
nx run-many -t test          # Nx directly

# Run specific package tests
nx run @ndigo/core:test
cd packages/ndigo-core && pnpm test

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

All Ndigo packages and applications are currently versioned below `1.0.0`,
indicating active development:

- Breaking changes may occur between commits
- Please file an issue when an API surprises you — the roadmap targets
  [Semantic Versioning 2.0.0](https://semver.org/) guarantees at `1.0.0`
