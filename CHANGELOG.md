# Changelog

All notable changes to BlueJS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Maintenance convention

- Every merged change that alters user-visible behavior adds an entry under
  `[Unreleased]` in the matching category (Added / Changed / Deprecated /
  Removed / Fixed / Security).
- Feature work links its decision record (`AD-XX`) where one exists — the
  [ADR index](docs/decisions/README.md) is the source of truth for _why_;
  this file is the user-facing _what changed_.
- Entries are imperative, user-facing, and unnumbered; keep them short
  enough for release notes. Formatting is oxfmt-checked.
- Pre-1.0: entries accumulate under `[Unreleased]`; the first release cuts
  it as `## [1.0.0]`.

## [Unreleased]

### Added

- `@blue/orm-drizzle` (AD-78): migration **files** — `loadMigrations(dir)`
  (one versioned module per file, `db/migrations/<NNNN>-<slug>.ts` by
  convention), `nextMigrationVersion(dir)`, and `migrateOnBoot({dataSource,
  dir})` — apply pending journaled migrations at boot, failing closed. The
  AD-30 runner contract is unchanged.
- `@blue/orm-drizzle` (AD-78): schema **generation** — `projectEntities`,
  `diffProjections`, `renderMigrationFile`, and the committed `schema.json`
  snapshot (`renderSnapshot`/`readSnapshot`, `predicate: 1`). Generation is
  a diff against the committed snapshot; constraints the metadata cannot
  express are reported, never emitted silently.
- `blue db new|generate|status` (AD-78): scaffold the next versioned
  migration, generate one from entity metadata (runs the app's
  `scripts.db:generate`), and report the journal (runs the app's
  `scripts.db:status`).
- `apps/04-blue-api`: the migration reference consumer — `db:migrate` /
  `db:generate` / `db:status` scripts, committed baseline migration +
  `db/schema.json`, `migrations.{runOnBoot,dir}` configuration with
  `migrateOnBoot` in the start path, and config-file loading
  (`config/application.json`) as the dotted-key carrier.
- Guide 27 — ORM & Migrations (the journaled lifecycle, the snapshot
  freshness gate, and the fidelity ceiling).

### Fixed

- `blue` (AD-75 review, discovered by AD-78): space-form nested commands
  (`blue db migrate`, `blue db new …`) printed topic help instead of running
  — the oclif `topicSeparator` was `:` so only `blue db:migrate` worked.
  `topicSeparator` is now a space; colon form keeps working.
- `blue` (AD-75, discovered by AD-78): one-shot commands (`db:*`, `inspect`,
  run-through scripts) received only `PATH` in their environment — config
  knobs like `BLUE_DB_URL`, OTel endpoints and secret keys never reached the
  app script. The invoking environment now flows through (shell-free
  signal relays unchanged).

### Fixed

- `@blue/cluster` (AD-74 review): the crash-loop guard now tears down **every**
  sibling slot — a tripped cluster settles with `reason: 'crash-loop'`
  instead of hanging with live children; a spawn failure aborts fail-closed
  (no orphaned children); the worst sibling exit code survives a trip (floor
  1); and a `stop()` after an `abort()` is a no-op.
- `blue serve` (AD-74/75 review): `--port` is now forwarded as the cluster's
  `basePort`, so `--cluster N --port P` gives every slot a distinct
  `PORT = P + slot` as documented — slots no longer collide on one port.
- `blue generate` (AD-75 review): forwards each generator's declared flags
  (`--package`, `--file`, `--force`, `--className`, `--summary`, `--author`,
  `--description`, `--module`, `--path`, `--jobs`) — `component` and `header`
  are runnable from the CLI.
- `blue doctor` (AD-75 review): reports the workspace root by walking up to
  `pnpm-workspace.yaml` (not the `node_modules` dir `pnpm root` answers),
  performs real environment checks, and exits `1` when one fails.
- `blue` (AD-75 review): one-shot commands install their signal relays before
  spawning (a signal in the spawn window is never dropped), and the
  shell-operator guard also rejects `$()`/backtick scripts.
- `@blue/jobs`/`@blue/redis/jobs` (AD-72 review): the Redis driver's
  `heartbeat` and `retry` are single-Lua-script atomic units — a stale
  heartbeat can no longer re-lease a job a successor reclaimed, and a retry
  can no longer resurrect a completed (terminal) job; the claim script sweeps
  companion hashes of phantom records (no unbounded growth); the runner
  awaits its last in-flight heartbeat before the terminal transition;
  enqueue now fails loud on `undefined` payload members; the LibSQL job store
  gained a `(state, lease_expires_at)` reclaim index.
- `@blue/redis/locks` (AD-73 review): `close()` now releases the driver's own
  leases (token-checked, in-process parity), and only a successful acquire
  advances the fencing-token counter (consecutive tokens on both drivers).

### Added

- `@blue/telemetry-node` + `@blue/management` (AD-77): Prometheus metrics —
  `metricExporter: 'prometheus'` (metric signal only) registers a pull
  `PrometheusMetricReader` over the SDK `MeterProvider`; the management
  `/metrics` endpoint serves the same snapshot two ways — the Prometheus
  text exposition document by default (the scraper contract), and a JSON
  projection on `Accept: application/json`. `HTTPServerInstrumentation`
  records the semconv `http.server.request.duration` histogram (seconds,
  method + status attributes) for every request in every export mode. The
  `/metrics` `{ features }` aggregator document is replaced by the
  meter-derived view (breaking change, documented in guide 26 §2). New
  snapshot model + renderers in `@blue/telemetry`; the telemetry lab gains
  `BLUE_TELEMETRY_METRIC_EXPORTER=prometheus`.

- `@blue/management` (AD-76): actuator parity — `/loggers` (level index,
  per-logger reads, and live `POST` level changes backed by a per-name
  registry in `@blue/log`), `/env` (property sources with origins,
  redacted values by default, `showValues` opt-in that never serves
  decrypted plaintext, `?toMatch=` filtering), `/configprops` (declared
  `@configurationProperties` keys and types only — never values), and
  health groups + single-component reads under `/health/<name>`. The new
  endpoints are **opt-in** via `management.endpoints.exposure.include`
  (a real config-file read path — the HI-5 annotation flips for the
  `management.*` read keys), with the AD-36 access-guard model extended to
  every management path. New guide 26.

- `blue generate package --jobs` — wire the `@blue/jobs` dependency into a
  new package at generation time.

- `@blue/jobs` (AD-72): durable job queues and the transactional outbox — the
  `JobDriver` SPI (lease-based at-least-once claims, attempts incremented at
  claim, expired leases reclaimed by the next `claim`, terminal `fail` with
  outcome telemetry/logs), the `JobQueue` producer facade, the `JobRunner`
  engine (concurrency slots, abort-on-timeout, lease heartbeat, exponential
  backoff, one `jobs.job.<type>` span and `@blue/log` outcome per execution),
  `@jobHandler` discovery mirroring `@scheduled` (registry scans at refresh,
  phase 0), and the outbox (`OutboxStore`, `OutboxRelay`,
  `JobOutboxPublisher`). Backends: `InProcessJobDriver` (the non-durable
  default), `LibSQLJobStore` + `LibSQLOutboxStore` in `@blue/orm-drizzle` (the
  outbox store borrows the data-source client, so `append()` inside
  `@transactional` commits or rolls back with the business data), and
  `RedisJobDriver` in the new `@blue/redis/jobs` subpath (atomic claim via one
  Lua script). `NodeAutoConfiguration` provides `jobDriver`, `jobQueue`,
  `jobHandlerRegistry`, and `jobRunner`; the runner starts explicitly — an
  unstarted runner arms no timer (worker processes call `start()`; see
  [guide 22](docs/guides/22-jobs-and-outbox.md)).
- `@blue/inspect` — programmatic inspection manifest (`inspectApplication`):
  a versioned, deterministic JSON view of routes, dispatcher mappings
  (pattern, HTTP methods/socket, handler class + method, parameters) and
  declared config keys (type, origin, presence — values are never read) for
  tooling, CI and docs. Seams: `MappingRegistry.entries()` /
  `getMappingEntries()` in `@blue/dispatcher`, and
  `declaredConfigurationProperties()` in `@blue/boot`; `apps/blue-api` gains
  an `inspect` script (AD-70).
- Config JSON Schema (`@blue/boot/schema/application.schema.json`) for
  `config/application.json` and profile variants, including the `{cipher:…}`
  at-rest secret marker, wired into `.vscode/settings.json`; the environment
  guide documents the `$schema` reference (AD-70).
- `@blue/oxlint-plugin`: `no-unsafe-view-name-literal` (the view-name
  traversal guard) and `no-duplicate-mapping-path` (method-level duplicate
  registrations), both enabled as errors; the duplicate rule is off in specs,
  where duplicate-registration fixtures are deliberate (AD-70).
- Component integration contract (AD-69): islands can paint server content
  before any script runs — `IslandView({ shadowHtml })` emits
  `<template shadowrootmode="open">`, `hydrateIslands` adopts the
  browser-parsed shadow root and upgrades the element in place, and
  `AbstractWebComponent.ensureShadowRoot()` accepts a pre-existing root — plus
  `AsFormAssociated(Base)` in `@blue/view-webcomponent` for form-associated
  custom elements whose values submit as standard form data through the
  existing binding/Zod path. No UI library is bundled; the decision record
  defines the adoption checklist and the no-wrappers discipline.
- Component library selection (AD-71): Web Awesome is the adopted library for
  the single reference integration — a dependency of `apps/blue-island` only
  (framework packages stay library-free). The island's add-item form uses its
  form-associated controls end-to-end: native `FormData` →
  `application/x-www-form-urlencoded` → `POST /items` → `dataBinderValue` +
  Zod → SSE push. Theming is the library's token stylesheet plus `--wa-*`
  overrides; first paint stays the DSD fallback pattern. Guide 21 documents
  the workflow, and the AD-69 vetting checklist carries recorded results
  (Spectrum and Material Web ship no form-associated controls; FAST has no
  maintained component set).
- `@blue/log` — dependency-light logging core (Logger contract,
  `getLogger`/`LoggerFactory`, console + OpenTelemetry appenders, severity
  mappings) extracted so framework internals can log without the telemetry
  stack (AD-67).
- `delay(ms)` — shared async delay helper in `@blue/util`, re-exported from
  `@blue/test` (replaces copy-pasted test helpers across packages) (HG-6).
- Environment accessors `getEnv(name, fallback?)` / `isDevMode()` in
  `@blue/util`, re-exported from `@blue/context` — centralized env reads for
  framework and app code (replaces scattered `process.env` lookups).
- `@blue/dispatcher`: `registerArgumentResolvers()` and
  `passthroughArgumentValue()` exports (consolidated platform resolver
  utilities).
- TOON support (AD-66): `MediaTypes.TEXT_TOON` media token and opt-in
  `application.toon` config files — `StandardConfigFileLoader` probes JSON
  first, then TOON (`format: 'auto' | 'json' | 'toon'`); the
  `@toon-format/toon` decoder is an optional peer, loaded lazily only when a
  `.toon` file is actually found. A restricted `format` also applies to
  `BLUE_CONFIG_IMPORT` paths (extension mismatch errors), and JSON-looking
  `.toon` documents error with a rename hint instead of decoding to
  garbage. JSON stays the default everywhere.
- Framework core: application contexts, DI/factory with scopes and entry
  processors, profiles and typed configuration binding
  (`@configurationProperties`), placeholder resolution, CLI args, live
  refresh and at-rest secret encryption (AD-11..17, AD-29).
- HTTP client: interceptor pipeline (retry, cache, error normalization,
  status, app-reset, trace headers, timeouts) and the composable body
  transform pipeline with subpath exports (AD-01, AD-47, AD-49).
- Dispatcher/routing: radix metadata handler mapping, per-source argument
  resolvers (query/path/header/body/cookie/session), whole-source data
  binding (`dataBinderValue`), `@requestPart` multipart JSON, matrix
  parameter parity (AD-26, AD-27).
- Validation: Zod as the single runtime-schema primitive — `validatedBy`
  / `validatedBody` / `validatedQuery`, entity-derived schemas
  (`insertSchemaForEntity`), structured validation issues (AD-07).
- Node platform: `HTTPServer` + `NodeDispatcher`, view targets, static
  files (ETag/conditional GET, range, precompressed variants, SPA
  fallback), multipart streaming uploads, security headers, rate limiting,
  trusted-proxy client IP (AD-05, AD-25, AD-26, AD-28, AD-33, AD-37, AD-60).
- Auth & sessions: credentials auth with password encoders, OIDC
  authorization-code + PKCE, JWTs, role guards, HttpOnly cookie sessions,
  durable LibSQL sessions (AD-33, AD-40, AD-56).
- Persistence: decorator entity ORM with Drizzle adapter, relation fetch,
  journaled migrations, durable queue message store; opt-in Redis shared
  cache and live cross-node WebSocket/STOMP fan-out (AD-30, AD-31, AD-40).
- Caching: awaitable `Cache`/`CacheManager` (`@blue/cache`), `@cached`
  decorator, `memoize`, Redis backend (AD-24, AD-39, AD-40).
- Scheduling: `@scheduled` decorator with single-flight engine (AD-20);
  distributed scheduling explicitly deferred (AD-41).
- Content/i18n: `MessageSource` contract, i18next adapter, Intl formatters,
  locale negotiation (AD-19).
- WebSockets & STOMP: session registry with rooms/heartbeat, isomorphic
  client with reconnect, STOMP 1.2 broker/client (AD-21..23).
- Server push: SSE-first island reactivity (AD-09).
- Signals: `@blue/signals` reactive state on `@preact/signals-core`
  (AD-59).
- Micro-frontends: host runtime, feature contexts with event-gateway
  isolation, route partitioning, shared-dependency contract (AD-18, AD-54,
  AD-62).
- Resilience: `@blue/proxy` method interception with retry + circuit
  breaker (`@blue/resilience`) (AD-42, AD-43).
- Observability: OpenTelemetry tracing/metrics/logging with Node and web
  instrumentations (AD-32).
- API docs: OpenAPI 3.0.3 generation from dispatch metadata + Swagger UI,
  DTO/schema-target conversion (AD-35, AD-38).
- Tooling: `@blue/test` integration harness (bootApp/MockHTTP), oxlint
  plugin architectural rules (AD-45, AD-46, AD-63).
- Example applications `08`–`19`: `08-blue-httpbin` (HTTP semantics
  playground), `09-blue-todobackend` (Todo-Backend REST spec + CORS/HEAD/
  OPTIONS), `10-blue-conduit-api` (RealWorld API, JWT + spec-exact error
  envelope), `11-blue-conduit-web` (RealWorld frontend), `12-blue-petclinic`
  (server-rendered forms, i18n, JSON negotiation), `13-blue-chat` (rooms,
  presence, history; STOMP interop with `@stomp/stompjs`), `14-blue-kanban`
  (versioned cards, 409 conflicts, optimistic UI), `15-blue-resilience-lab`
  (`@retry`/`@circuitBreaker` breaker cycle), `16-blue-redis-fanout`
  (cross-node cache + socket fan-out), `17-blue-telemetry-lab` (browser→server
  trace continuation, sampling, OTLP), `18-blue-auth-playground` (cookie/JWT/
  role/session-durability matrix + embedded OIDC PKCE issuer), `19-blue-hn`
  (cached/offline HN reader) — each with tests and a boot-smoke probe
  (`docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md`).
- Root `pnpm apps:smoke` — boots every Node example app on a dedicated probe
  port, asserts its documented route (plus the hello-node WebSocket echo),
  requires a clean SIGTERM exit and a released port; wired into the CI quality
  lane.

- `@blue/locks` (AD-73): distributed locks with **fencing tokens** — the
  `LockDriver` SPI (non-blocking `acquire` with lease TTLs, monotonic per-key
  tokens where only the current token can `renew`/`release`/`isHeld`), the
  process-wide `InProcessLockDriver` (single-node truth — every driver in the
  process coordinates, zero config), and the `LOCK_DRIVER` context token.
- `@blue/redis/locks` (AD-73): `RedisLockDriver` — Lua `SET NX PX` acquire +
  compare-and-delete release, one namespace per environment, borrowed
  connection. Cross-process single-executor for multi-node deployments.
- `@blue/cli` (AD-75): the `blue` binary — `serve` (with the AD-74
  `--cluster <n>` surface and `--port` derivation), `dev`, `generate`
  (fronting `@blue/generators`), `db:migrate`, `inspect` (the AD-70
  entry), and `doctor` (environment diagnostics). Built on `@oclif/core`
  ^5 as an embedded library; scripts run shell-free so SIGTERM/SIGINT
  reach the actual application process.
- `@blue/cluster` (AD-74): the process supervisor — `ClusterRunner` spawns N
  replicated worker slots (`BLUE_CLUSTER_SLOT`/`SIZE`, `PORT = base + slot`
  derivation), relays `SIGINT`/`SIGTERM` into each child's own graceful
  shutdown (shared deadline, `SIGKILL` stragglers), respawns crashed slots
  with exponential backoff, trips fail-closed past `maxRestartsPerWindow`
  per slot, and aborts on a second signal; `runCluster()` runs one cluster
  to completion. The `node:child_process` spawner and `process` signal host
  are injectable seams for embeddings and tests.
- `@scheduled({ lock })` (AD-73): one node executes each fire of a locked
  schedule — the runner acquires before the run and releases in the `finally`
  (contended fires skip with a logged warning; `lockWait`/`lockWaitStep`/
  `lockTtl` tune the waiting, polling, and lease duration). `lockDriver` bean
  wired through `NodeAutoConfiguration` (in-process default, Redis override).
- Spec-typecheck lane (TST-A): `pnpm typecheck` now runs
  `tsc -p tsconfig.spec.json` after the per-project build checks, typechecking
  every package/app `src` **and** `test` file (strict, vitest globals, live
  `src/` resolution mirroring `vitest.aliases.ts`). Specs that never
  typechecked before are now green and gated red on an intentional error.
- `pnpm test:tooling`: durable `node --test` lane (SEC-B/WC-I) pinning the
  decorator-lowering plugin's extension scope (`.cts` included), vendored-vs-
  workspace resolution, and the `@`-pre-check — the /tmp probes now live in
  CI.
- `@blue/telemetry-web` (TEL-08): `countSocketClientBytes()` wires exact
  outbound-wire-byte telemetry through the socket client's `onSend` seam;
  `@blue/socket` exposes `SocketClient.onSendWired` so the instrumentation's
  `send` wrap skips its own payload estimation for seamed clients — bytes
  count exactly once, per write (buffered flushes and retried writes
  included).

### Changed

- `@blue/inspect` config introspection (REU-9): `declaredConfigurationProperties`
  and `relaxedKeyCandidates` moved to `@blue/context` (re-exported from
  `@blue/boot` unchanged) — the tooling package no longer pulls the boot layer
  into its runtime closure.

- OXC tooling updated to the 2026-10-05 releases: `oxlint` and
  `@oxlint/plugins` `^1.87.0`, `oxfmt` `^0.72.0` (`oxlint-tsgolint` was
  already current). oxfmt 0.72's native Markdown formatter (upstream breaking
  change) reformatted 31 docs — wrapped-prose indentation only. The tools
  AD-58 left unadopted were re-assessed at oxc 0.153: standard-decorator
  lowering is still absent (and `legacy` mode mis-invokes TC39 decorators), so
  `tsc -b` and the esbuild decorator pre-transform stand; oxc-parser is mature
  but unnecessary, oxc-minify/oxc-resolver have no consumer
  (`docs/audits/2026-10-07_OXC_UPDATE_AND_MATURITY_ASSESSMENT.md`).
- Example-app directories are numbered in reading order
  (`apps/01-blue-hello` … `apps/07-blue-views`, new apps `08`–`19`); package
  names stay unnumbered (`@blue/hello` …) except the two unscoped demos, now
  `@blue/island` and `@blue/views`. `blue-todo`'s Vite dev port moves
  3000 → 3003 and `blue-hello-node`'s default 3000 → 3010; the port registry
  lives in `apps/README.md`. Lockfile importers, CI artifact paths, lint
  ignores and all doc links were swept with the rename.
- Example-app practice sweep (guides + AD-67): every app imports `getLogger`
  from the `@blue/log` leaf instead of `@blue/telemetry`, and the twelve apps
  that only log dropped their `@blue/telemetry` dependency; `03-blue-todo`
  boots `MetadataConfigApplicationContext` instead of the Node-oriented
  `ApplicationBuilder` (−98 kB in the client bundle; guide 01's minimal-app
  snippet now matches `02-blue-hello-node` again); `01-blue-hello`'s smoke spec
  uses the `@blue/test` browser harness (`docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md` §12).

- The `@blue/requires-doc-header` oxlint rule now rejects stray `* * @…`
  header lines; a repo-wide sweep repaired 115 files (the artifact rendered as
  a literal `*` in generated module docs).
- Framework diagnostics (`@blue/factory`, `@blue/platform-node`, `@blue/test`)
  now import the logger from `@blue/log`; `@blue/telemetry` re-exports the
  logging surface, and the `@blue/telemetry/logger` subpath is gone — import
  `getLogger` from `@blue/log` (or the `@blue/telemetry` root).
- OpenTelemetry `ContextInstrumentation`/`DispatcherInstrumentation` are
  single implementations in `@blue/telemetry` (the node/web packages
  re-export them; the core dispatcher instrumentation gains the
  `_resolveViewName` span). The forked copies and the unused node
  `CountedInstrumentation` duplicate are removed.
- Decorators migrated from legacy experimental to TC39 Stage 3 standard
  (AD-44).
- Conditional auto-configuration decorators renamed `@conditionalOn*` →
  `@when*`: `@whenBrowser`, `@whenNode`, `@whenProperty`,
  `@whenProfile`, `@whenMissingEntry`; options interface now
  `WhenPropertyOptions`. The runtime `Symbol.metadata` keys follow the
  rename (`boot:whenPlatform`, `boot:whenProperty`, `boot:whenProfile`,
  `boot:whenMissingEntry`) — code reading the old `boot:conditionalOn*`
  keys must be updated.
- Cache API became fully awaitable, including `size()` (AD-39).
- `@blue/reactive` modernized into `@blue/signals` (AD-59).
- Toolchain migrated from ESLint/Prettier to oxlint/oxfmt; `tsc -b` build
  retained (AD-58).
- Single-`Application` boot model; JSON-config loading and conditional
  browser/node boots (AD-03, AD-05).

### Removed

- `@blue/telemetry`'s `./logger` subpath — use `@blue/log` (AD-67).
- Legacy validation: `@blue/validate` constraint system and
  `@blue/model`/objectmodel, replaced by Zod (AD-07).
- `@blue/domain` MVVM layer, archived (AD-02 supersession).
- `@blue/parser` (dissolved into `@blue/core`) and the Ramda/Arcsecond
  dependencies (AD-57).
- `SiteBuilder` stub and the legacy Site/Page model remnants (AD-03).

### Fixed

- `@blue/generators:package` emits the current package tsconfigs (strict +
  `@blue/*` build paths; the stale `baseUrl` made every generated package fail
  `tsc -b` under TypeScript 7) and registers the new alias in the shared
  `vitest.aliases.ts` table instead of the obsolete `vitest.config.ts`
  insertion (a generated package previously missed manifest-gate rule 11).
- `@blue/auth-core` no longer exports the Node-only `ScryptPasswordEncoder`
  from its package root: the module imports `node:crypto` at evaluation time,
  and `@blue/auth-client` re-exported the whole root — so any browser app
  importing the auth client dragged a Node built-in into its module graph and
  crashed under `vite dev` (the production build masked it by compiling
  `process.env` reads away). The encoder now lives at
  `@blue/auth-core/scrypt`; the root stays isomorphic. Consumers updated
  (`apps/04`, `apps/10`, `apps/18`, the auth-server and orm-drizzle specs,
  guides 11 and 16, the package README) — verified by loading `blue-todo`'s
  dev server in a real browser (zero console errors, app renders).

- `blue-hello-node`'s `/echo` WebSocket handler now declares its session
  argument (`@parameters({ session: socketSessionValue('session') })`) — the
  previous form ran the handler with `undefined` and every connection closed
  with 1011 before echoing; locked with
  `apps/02-blue-hello-node/test/hello-socket.spec.ts`.
- App default ports are seeded into `process.env.PORT` before boot in
  `02-blue-hello-node`, `08-blue-httpbin` and `13-blue-chat`: the managed
  `HTTPServer` reads `process.env.PORT` (falling back to 3000), so the
  documented defaults were logged but not bound.

- App client bundles are valid JavaScript again: Vite 8's oxc transform passes
  TC39 decorators through unchanged (oxc 0.151 offers no lowering option), so
  decorator-using bundles — `@service`/`@getCall` in `blue-island`,
  `@signal`/`@effect` in `blue-todo` — shipped as syntax errors while Vitest
  suites stayed green (Vitest transforms through esbuild). A shared
  `scripts/vite-plugin-lower-decorators.mjs` esbuild pre-transform lowers them
  for app builds; the built bundles are syntax-checked in CI-adjacent tests.
- `blue-todo` renders its starter items on every todo route (`/`, `/active`,
  `/completed`, `/index`): the root/route models previously omitted `items`,
  so a fresh load or deep link showed an empty list. The Playwright e2e lane
  passes end-to-end again (build order, bundle syntax, and seeding were all
  broken).
- JWT verification now requires the `exp` and `sub` claims (exp-less tokens
  are rejected instead of authenticating indefinitely; a missing/empty `sub`
  no longer maps to the shared `'unknown'` id), with an optional
  `clockToleranceSeconds`; HMAC configs now reject secrets shorter than
  32 bytes at construction (SE-1, SE-2).
- Refresh-scoped beans with `destroy()`/`close()` now tear down when the
  refresh scope clears on environment refresh (`config:refresh`): the
  container registers the destruction callback at creation time, exactly once
  per instance (AD-29).
- Conditional sources are now gated consistently: an inactive
  `@whenBrowser`/`@whenNode`/`@whenProperty`/… `@configurationProperties`
  class no longer binds, no longer rebinds on refresh, and no longer
  contributes `@environment` schemas (CF-1).
- Boot bind errors no longer interpolate the property value, so a decrypted
  secret can no longer leak into the failure message (CF-2).
- `@blue/test` `MockHTTP` finalizes interceptor denials exactly like the live
  Node adapter (`401`/`403` problem documents, `302` redirects), so guards are
  testable without writing the response themselves (IN-1).
- `@blue/util` `toRegExp` treats plain patterns that merely contain flag
  letters (`my-pattern`, `greedy`) as literals instead of throwing a
  `SyntaxError` (IN-2).
- `CacheInterceptor` no longer stores or serves responses whose credentials
  were attached by a request-time interceptor — the cache gates on the
  request that was actually sent (HT-1).
- `HashRouter` public navigation now mirrors the route into `location.hash`
  (suppressing the self-caused `hashchange` echo) and restores it on rejected
  navigations (PL-1).
- Multipart `fileThreshold: 0` now really forces every part to disk, and
  negative/non-finite `MultipartLimits` throw a descriptive `RangeError`
  instead of silently falling back to defaults (PL-2).
- `FetchCredentialsInterceptor` clones the outgoing request, preserving
  signal/mode/redirect/cache/integrity and no longer throwing on bodied
  requests in Node (PL-3).
- `Cookies.getJSON`/`Cookies.get` return `undefined` for a missing key
  instead of throwing (PL-4).
- Drizzle DDL derives SQLite storage types from the declared column metadata
  (varchar/boolean/json → TEXT, real/float → REAL, blob → BLOB) and string
  primary keys round-trip (`NUMERIC` affinity for caller-assigned keys; only
  generated INTEGER keys auto-increment) — matching `drizzle-zod`'s mapping
  (DA-1).
- `@counted` counters resolve lazily on first call, so instrumentations
  constructed before the global meter provider no longer bind to the
  NoopMeter and drop datapoints (OP-1).
- The scheduler's `maxRunTime` cap timer is cleared when a run settles, so a
  completed run no longer pins the event loop for the rest of the cap (OP-2).
- `WebSocketClient.send` copies binary payloads (Buffer/subarray views) to the
  exact byte window instead of shipping the whole ArrayBuffer pool slab
  (PR-1).
- OpenAPI documents convert Zod schemas with the `openapi-3.0` target
  (`nullable`/`enum`/`items` instead of draft-2020-12 `type` arrays,
  `const`, `prefixItems`) (PR-2).
- `/health` and `/metrics` responses now carry the default security-header
  set (`SecurityHeadersInterceptor` prepended to the management mapping,
  matching the API-docs mapping) (SE-4).
- Boot: nested `@defaultValue` converts like top-level defaults (numbers and
  booleans bind typed), and a failure after context creation closes the
  context instead of leaking listeners/beans (CF-4, CF-6).
- `@blue/factory`: `init()` failures now propagate as `FrameworkError`
  instead of warning and serving the half-initialized instance (CF-5).
- HTTP client: `TimeoutInterceptor` releases its timer when a request settles
  and composes a caller-supplied `AbortSignal` with its own (caller cancels
  propagate as cancels; only real timeouts yield 408) (HT-2, HT-5);
  `TransformInterceptor` leaves bodyless/empty bodies untouched (HEAD/204,
  empty POSTs) and routes `preRequest` failures through the documented
  error/completion hooks (HT-3).
- Dispatcher: base-class-declared `@routeMapping`/`@errorMapping` members are
  discovered on subclasses (no more 404s), and an unmapped handler error is
  rethrown instead of being replaced by `TypeError('view name is undefined')`
  (HT-4, HT-6).
- `BrowserRouter` runs the full preHandle → postHandle → afterCompletion
  chain with mapped-interceptor param binding; the offline retry replays the
  original request (method/headers/body) instead of a bare GET (PL-5, PL-7);
  the node adapter's socket-probe memo no longer retains an entry per
  distinct parameterized path (PL-8).
- Web components: delegated events keep working after
  disconnect → reconnect (PL-6).
- ORM: Drizzle reads decode declared `boolean`/`json` columns (load → modify
  → save round-trips), and in-memory transactions snapshot/restore
  deep-cloned stores so rollback reverts in-place mutations (DA-2, DA-3).
- Telemetry: router spans cover the async navigation and flag failures;
  inbound HTTP spans carry `http.response.status_code` and ERROR on 5xx; a
  configured `logExporter` switches `LoggerFactory` to the OpenTelemetry
  appender; `fatal`/`critical` map to FATAL severities; instrumentations get
  a base-class enable latch (no double-wrap on re-enable); `sdk.shutdown()`
  is documented and wired into the blue-api graceful shutdown
  (OP-3, OP-5, OP-6, OP-8, OP-9, OP-10). `/metrics` returns duration
  summaries again (OP-4).
- Resilience: invalid circuit-breaker specs fail loud at weave/invoke time
  instead of silently inverting the policy (OP-7).
- Signals: subclass reactivation limitation documented; the activation error
  names both possible causes (IN-3).
- Demos: blue-todo's signals counter renders; blue-host nav uses real hash
  links; blue-views `/report` loads from a production bundle; blue-island's
  documented `dev` flow works (AP-1..AP-4).
- Tooling: `@blue/generators` gains `build:lib`; nx legacy project blocks
  removed and `build:todomvc` rewired; scaffold manifests pass the docs
  gate; generated headers use `@module blue-<name>`; the dead JSDoc
  migration script is gone (TO-2..TO-7, HG-5).
- STOMP/SSE/service: `maxUnacked: 0` accepts the spec-mandated id-only ACK as
  a receipted no-op; duplicate caller receipt ids reject instead of stranding
  a send; in-memory queue capacity no longer shrinks to the byte budget;
  SSE parsers stop emitting phantom `message` events for `retry:`/id-only
  blocks; the service proxy delegates `Object.prototype` members; stream
  spans flag request-level failures (PR-3..PR-8, PR-10).
- OpenAPI: recursive schemas hoist into `components.schemas` with resolvable
  pointers, and path template variables without a declared extractor get
  synthesized parameters (PR-9, PR-11).
- Auth client: OIDC pending state is a pluggable store — a callback can be
  completed by another adapter instance (or process) sharing it (SE-5).
- Reuse: `getErrorMessage` is promoted to `@blue/util` and used at all inline
  sites (HG-3).
- Platform/dispatcher: streamed renders honor response backpressure;
  formatting services fail loud without a locale; `HTTPResponseViewTarget`
  delegates entity serialization (problem+json parity); `OfflineInterceptor`
  gains `dispose()`; content negotiation threads the request per call instead
  of a process global; empty-value and repeated-key route conditions behave
  as documented; mapping-name lookups are live; duplicate feature prefixes
  and sparse parameter maps fail loud (PL-9..PL-12, HT-7..HT-11, A-4).
- Test harness: MockHTTP mirrors query fidelity (repeated params,
  null-prototype data), socket-only 404s, OPTIONS dispatch, and 405 + Allow
  (IN-4, IN-5).
- Context/factory: `@property` binds without `@propertySource` and follows
  environment changes; exported contracts documented; dead code removed;
  `getInstance` returns registered non-constructor values as-is (CF-9..CF-12).
- Data: set-based `count`/`existsById`/`deleteById`; Redis fanout reports the
  most recent error (decode errors never masked); one shared
  `resolveCacheName`; `@cached` tolerates a detached receiver (DA-7..DA-9,
  DA-11).
- Tooling/hygiene: root `lint` builds the oxlint plugin first; benchmarks
  resolve hashed bundles and reap their preview server; dead root devDeps and
  `vite.config.lib.ts` removed; a root `typecheck` script covers every
  package and app (CI widened); the docs-link gate now checks package/app
  READMEs; `.DS_Store` untracked; audit moderates cleared (TO-8..TO-13,
  HG-12, SE-9). Every package README now meets the enforced section standard
  (docs gate widened with it).
- Docs: plans/migrations indexes completed; CSP docs aligned with SEC-4;
  root README inventories refreshed; new Guide 17 (static files) and Guide 18
  (signals & islands); removed-tooling references swept (DO-3..DO-9).
- Demos: app READMEs corrected; unused app deps pruned; dead auth helpers
  removed; blue-api route list + matrix tests (AP-5..AP-9).

### Security

- Disabled or deleted accounts revoke live sessions and JWTs at validation,
  and on-demand user-wide revocation is available through
  `CredentialsAuthAdapter.logoutAll(userId)` +
  `SessionStore.deleteForUser(userId)` (AD-68, SE-7).
- JWT `validate` accepts only access tokens: framework refresh tokens
  (`token_use: 'refresh'`, 7-day TTL) can no longer authenticate an API
  request; a present claim that is not `'access'` fails closed (SE-7).
- blue-todo's `todo-item.checked` getter now reflects the value assigned to
  the property (it previously read a host attribute nothing ever set) (AP-11).
- Dependency override `source-map-js >= 1.2.2` (GHSA-68fv-2mgg-jv7q):
  `pnpm audit --prod` reports zero known vulnerabilities again.
- The CSRF double-submit cookie is hardened to the `__Host-` prefix with a
  spoofed-cookie rejection spec (SE-8).
- Remote config sources gain a fetch timeout (10 s) and a response-size cap
  (1 MiB) with the existing keep-last-good policy (SE-10).
- Cookie attribute writing truncates values at the first `;` and rejects
  `;`/CR/LF in attribute names (SE-11).
- Security headers default-on in `NodeAutoConfiguration` (CSP, HSTS,
  X-Frame-Options, nosniff, …) (AD-25).
- Rate limiting with fixed-window limiter and real client IP behind
  trusted proxies (AD-33, AD-37).
- At-rest secret encryption via `{cipher:...}` markers, AES-256-GCM
  (AD-29).
