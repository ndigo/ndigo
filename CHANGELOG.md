# Changelog

All notable changes to Ndigo are documented in this file.

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

- `@ndigo/cli`: `ndigo routes --toon` — one TOON document on stdout for the
  route list, an experimental sibling beside the `--json` contract (issue
  #349). Measured first (`scripts/toon-measure.mjs`): on a real 20-route
  manifest TOON is −59% vs pretty / −36% vs minified JSON; `ui list`'s
  heterogeneous registry items measure −21%/<0% and stay JSON-only. The two
  flags error together, `--json` stays canonical, the flag brief is marked
  `[experimental]` while TOON is a Working Draft, and the SDK arrives as a
  regular lazily imported dependency (CLI startup untouched).
- `@ndigo/view-toon`: the TOON view technology (AD-102) — `ToonView`
  (`text/toon;charset=utf-8`), `toonViewResolver(viewName, options?)` for
  opt-in per-route negotiation (register the JSON resolver first:
  registration order is what keeps JSON the default), and `encodeToon()`
  for synchronous in-process prompt composition. `@toon-format/toon` is a
  regular pinned dependency (spec v4.4), so the wire surface fails at
  install time, never as a request-time missing-module error. Supersedes
  AD-66 D-3 in part: TOON may appear in HTTP responses as an explicitly
  composed representation with an app-registered `.toon` extension; the
  framework wires nothing for it, and storage, SSE, WS/STOMP, external
  protocols, MCP results/schemas, and every negotiation default stay
  out of reach. JSON remains the fallback and the fixed default
  everywhere.
- `@ndigo/ai`: provider-neutral agent contracts — messages, streaming events,
  structured output, and a bounded tool-calling loop over `@ndigo/mcp` tool
  sources, with GenAI spans, rate limits, and rollout flags.
- `@ndigo/ai-sdk`: the Vercel AI SDK integration layer (`ai`), the only package
  that imports the SDK; tools are declared but executed by the agent loop.
- `@ndigo/mcp`: `McpToolRegistry.from(dispatcher)` now accepts the real
  dispatcher type, and `argumentResolvers` binds parameterized tools through
  the same chain HTTP uses. Tools without it fail with a clear error instead
  of a missing-resolver crash.
- `apps/21-ndigo-agent-lab`: a local-model tool loop over the same
  `@toolMapping` handlers served by HTTP and MCP, streamed over SSE with one
  trace.
- `@ndigo/boot`: `ApplicationBuilder.fromConfig(url, options?)` accepts TOON
  documents (AD-66 Phase 3) — a `.toon` address suffix decodes as TOON
  (query strings and fragments stripped first), an explicit
  `format: 'json' | 'toon'` option overrides the address, and `format:
  'json'` over a `.toon` address errors instead of silently re-parsing.
  Extensionless and `.json` addresses stay JSON, the optional
  `@toon-format/toon` peer is only resolved on the TOON path, and the
  decode contract is identical to `.toon` config files (strict mode,
  JSON-shaped rename hint, object shape guard, bounded diagnostics).
- `@ndigo/ui`: the owned design system — canonical `--nd-*` tokens, the opt-in
  base layer, the typed token catalog, and a shadcn-compatible copy-in registry
  (41 items: theme, element foundation, native-first and Zag.js primitives, and
  five blocks).
- `@ndigo/cli`: the `ui` family — `ui init`, `list`, `view`, `validate`, `add`,
  and `mcp` (a stdio MCP server for registry discovery and installation).
- `@ndigo/cli`: `mcp` — a stdio MCP server over application introspection
  (`get_manifest`, `get_routes`, `get_config_keys`, `get_best_practices`,
  `run_doctor`, `get_logs`, `run_target`, `record_rule`), with `--readOnly`
  gating and `--live` delegation to the app's `scripts.mcp`.
- `@ndigo/cli`: one `--json` contract across `doctor`, `info`, `logs`,
  `config list`, `env`, `openapi`, `db status`, `lint`, `typecheck`, and
  `routes` — one document on stdout, diagnostics on stderr, exit codes
  unchanged, human output untouched without the flag. `ndigo commands` (and
  the MCP `get_commands` tool) publishes the command index with flags,
  positionals, and exit codes.
- `@ndigo/cli`: `ai:init`/`ai:check`/`ai:update` — a version-matched managed
  `AGENTS.md` block, nine skills under `.agents/skills/`, and optional
  `.mcp.json` wiring, generated from `tools/agent-content/` and shipped with
  the CLI. `create-ndigo-app` gains `--agents`/`--no-agents` for the bootstrap
  pointer.
- `create-ndigo-app`: `--ui`/`--no-ui` — browser scaffolds can opt into the
  Ndigo design system. The flag writes the version-free pointers only
  (`ndigo.ui.json` with the `ndigo ui init` aliases, a `src/styles.css` that
  imports `@ndigo/ui/tokens.css`, and the `@ndigo/ui` dependency); components
  and the lockfile stay with `ndigo ui`. Off by default and never implied by
  `--yes`; `--ui` without `--kind` means browser, and `--kind node --ui` is a
  usage error.
- `@ndigo/cli`: `ui catalog` and the `get_catalog` MCP tool — an A2UI 1.0
  catalog derived from the registry and the application's `ui.lock.json`, so
  an agent can only generate components the application installed.
- `@ndigo/mcp`: MCP tools projected from dispatch metadata — `@toolMapping`
  handlers serve `tools/list`, `tools/call`, resources, and prompts over stdio
  and Streamable HTTP, with read-only and `@whenFeature` policy, OpenAPI schema
  parity, and one GenAI span per call. `ndigo add @ndigo/mcp` runs the
  `mcp-setup` generator. `@ndigo/platform-node` exposes the raw request on the
  route for transport-owning handlers.
- `@ndigo/view-webcomponent`: WebMCP tools — `provideWebMcpTools` /
  `declareWebMcpTool` (AbortSignal lifecycle), `AsWebMcpElement`
  (connect/disconnect registration), and `webMcpToolForHandler` (schema from
  `@parameters` + `validatedBy`).
- `@ndigo/mcp`: MCP Apps — `_meta.ui.resourceUri` from `@toolMapping({ ui })`,
  `ui://` resources served as `text/html;profile=mcp-app`, a
  `createUiResource` single-file document helper, and the
  `io.modelcontextprotocol/ui` capability.
- `@ndigo/core` + `@ndigo/view`: `application/a2ui+json` and `A2UIView` — an
  A2UI 1.0 message-array representation selected by content negotiation, with
  an `a2uiViewResolver` helper and no A2UI runtime dependency.
- `@ndigo/ui`: the `a2ui-surface` registry item — `<nd-a2ui-surface>` renders
  A2UI 1.0 surfaces with `@a2ui/web_core` and the installed `nd-*` elements.
  The component map is generated from `registry.json` and filtered to elements
  the page defines; unknown components emit `nd-a2ui-error`.
- `apps/20-ndigo-ui-lab`: a browser lab for the full ndigo-ui registry — tokens,
  native-first primitives, Zag.js behaviour elements, and all five blocks — with
  keyboard and axe coverage.

- `@ndigo/cli`: the command surface expanded from the AD-75 core (serve, dev,
  generate, db, inspect, doctor) to the full developer loop — `build`, `test`,
  `lint`, `format`, `typecheck`, `clean`, `info`, `config`, `routes`, `logs`,
  `completion`, `env`, `openapi` (`--out`/`--format`), `add` (installs an
  `@ndigo/*` capability and runs its setup generator), `update`
  (manifest-driven `@ndigo/*` bumps with `--check`), and `new --preset`
  (`minimal`, `browser`, `api`).
- `@ndigo/cli`: the engine-agnostic `db` family — `list`, `push`, `pull`,
  `studio`, `seed`, `rollback`, plus `--db <name>` selection on the existing
  `migrate`/`generate`/`status`. Commands front the app's `db:*` scripts or
  its registered adapter, so the CLI carries no ORM knowledge.
- `@ndigo/orm`: the `NdigoDatabaseAdapter` contract and `runDbCommand`
  dispatcher — the seam `@ndigo/cli` talks to, with engine packages providing
  adapters (`@ndigo/orm-drizzle` ships `createDrizzleAdapter`).
- `@ndigo/generators`: `entity` (real `@entity`/`@column` template),
  `controller`, `service`, `middleware`, and `config` generators, plus
  `redis`/`jobs`/`socket`/`cache` setup generators invoked by `ndigo add`.
  The `app` generator gains `--preset` and an `api` preset that scaffolds a
  sample entity and a database adapter registry.
- `@ndigo/openapi`: `writeOpenAPISpec` — generate an `OpenAPIDocument` and
  write it to a file (`json`; `yaml` reserved in the signature).
- `@ndigo/cluster`: `waitForExit` now resolves for a child that has already
  exited, and maps signal termination to a defined exit code — removes an
  intermittent supervisor shutdown hang.

- `@ndigo/auth-client` (issue #61): the **OIDC refresh-token grant** —
  `OIDCAdapter.refresh(refreshToken)` performs the `grant_type=refresh_token`
  exchange (discovery-resolved, client-secret auth for confidential clients)
  and verifies the response's ID token through the full path with no nonce
  and subject stability against the token's binding. Refresh tokens are
  captured at code exchange and bound to the verified subject in a
  `refreshStore` (default in-memory, `pendingStore`-style instance affinity);
  only captured tokens are redeemable — access/ID tokens are rejected before
  any network call — and rotation consumes the presented token single-use.
  Provider rejections (`400 invalid_grant`) surface as `invalid_token`.
  `exchangeCodeForTokens` now returns `OIDCResult` (the `AuthResult` plus
  `refreshToken`), the adapter gains an optional `prompt` authorization
  parameter (several providers require `prompt: 'consent'` before granting
  `offline_access`), and `AuthClient` captures rotated refresh tokens from
  any refresh-capable adapter and presents them on `client.refresh(adapterId)`.
  The conformance leg runs against a live provider: `18-ndigo-auth-playground`
  mode 6 captures the embedded `oidc-provider`'s refresh token **server-side**
  and redeems it via `GET /oidc/refresh`, rotation included.
- `@ndigo/auth-core`: `AuthResult` gains an optional `refreshToken` seat for
  rotation-capable adapters.
- `@ndigo/flags-openfeature` (AD-87 Phase 2): the **browser entry**
  (`@ndigo/flags-openfeature/web`) — `WebOpenFeatureFlagEvaluator` over
  `@openfeature/web-sdk` (static-context snapshot semantics, the same
  reason/error mapping, `null` narrowing, and never-throw boundary as the
  server evaluator) — and **`FeatureFlagTelemetryHook`**: one
  `feature_flag.evaluation` span per evaluation with the OTel feature-flag
  semconv attributes (`feature_flag.key`, `feature_flag.provider.name`,
  `feature_flag.result.reason`, `feature_flag.result.variant`, `error.type`
  on abnormal outcomes), usable on both SDKs and inert until telemetry
  providers are wired. Guide 28 gains the browser recipe and provider
  notes (flagd/OFREP).
- `@ndigo/platform-node` (AD-87 companion): the flag targeting-context
  seam — the **`FLAG_CONTEXT_RESOLVER`** bean
  (`FlagEvaluationContextResolver`; default
  `SessionPrincipalFlagContextResolver`: the session-bag principal's id as
  the targeting key with its roles as attributes, falling back to the
  AD-37 client address; `ClientAddressFlagContextResolver` ships for
  address-only targeting), and **late-bound gate dependencies**: the
  `FeatureGateInterceptor` now resolves `FLAG_EVALUATOR` /
  `FLAG_CONTEXT_RESOLVER` from the application context per check, so
  app-level bean overrides (the vendor-bridge recipe included) reach
  `@whenFeature` routes instead of pinning the auto-configuration
  defaults.
- `@ndigo/flags` (AD-87): the evaluation vocabulary widens to the full
  OpenFeature surface — reasons `CACHED`/`UNKNOWN`/`STALE`, error codes
  `TARGETING_KEY_MISSING`/`INVALID_CONTEXT`, and an optional
  `flagMetadata` on `FlagEvaluation` (`DISABLED` is documented as a
  successful evaluation).
- `@ndigo/flags-openfeature` (AD-87): the **OpenFeature bridge** — a
  `FlagEvaluator` over `@openfeature/server-sdk` clients (global,
  domain-scoped, or explicit), never-throw at the boundary, provider
  `flagMetadata` passed through; vendor flagging (flagd, OFREP,
  LaunchDarkly, …) plugs in behind the existing SPI, so `@whenFeature`
  gates and app code stay unchanged.
- `@ndigo/generators` (AD-85): the **`app` generator** — scaffolds a demo
  application under `apps/NN-ndigo-<slug>` from the `01-ndigo-hello` (browser)
  or `02-ndigo-hello-node` (node) shape, allocating the reading-order number
  and dev port automatically (the port scan covers the ladder's documented
  conventions; explicit `--number`/`--port` fail loud on collisions). The
  generator factories now load through Node's native TypeScript stripping —
  Nx-loaded generator files import their own modules with `.ts` specifiers,
  rewritten on emit by `rewriteRelativeImportExtensions`.
- `@ndigo/cli` (AD-85): **`ndigo new <name>`** (`--kind`, `--number`, `--port`,
  `--description`, `--dry-run`) fronts the app generator through the
  workspace's Nx bridge; `ndigo generate app` fails with a pointer at it (one
  canonical path per artifact).
- `@ndigo/generators` (drive-by, 2026-11-01): the `package` generator's
  manifest now ships `files: ["api", "lib"]` — the docs standard the manifest
  gate enforces.
- `@ndigo/flags` (AD-82): feature flags — the **`FlagEvaluator`** SPI
  (typed, async, **never-throw**: abnormal evaluation returns the supplied
  default with a `reason` + `errorCode`), the zero-config
  **`PropertyFlagProvider`** (flag `name` → `feature.<name>` properties,
  read-through so `environment.refresh()` flips flags live; **percentage
  rollouts** via `feature.rollout.<flag>` ∈ [0, 1] bucketed per targeting
  key — `SPLIT` reason), the **`@whenFeature`** class/method gate metadata
  (flag-key validated at decoration time), and the `FLAG_EVALUATOR` bean
  token.
- `@ndigo/platform-node` (AD-82): the **`FeatureGateInterceptor`** —
  default-on in the node mapping, evaluates `@whenFeature` gates per
  request and denies an off flag with a 404 problem document
  (`urn:ndigo:not-found`; the `@FeatureGate`/`DisabledFeaturesHandler`
  analog); the default `FLAG_EVALUATOR` bean reads the application
  environment.
- `apps/04-ndigo-api` (AD-82): the gated `/gated-report` demo route
  (`@whenFeature('gated.report')`, `feature.gated.report` in
  `config/application.json`).

- `@ndigo/orm-drizzle` (AD-78): migration **files** — `loadMigrations(dir)`
  (one versioned module per file, `db/migrations/<NNNN>-<slug>.ts` by
  convention), `nextMigrationVersion(dir)`, and `migrateOnBoot({dataSource,
  dir})` — apply pending journaled migrations at boot, failing closed. The
  AD-30 runner contract is unchanged.
- `@ndigo/orm-drizzle` (AD-78): schema **generation** — `projectEntities`,
  `diffProjections`, `renderMigrationFile`, and the committed `schema.json`
  snapshot (`renderSnapshot`/`readSnapshot`, `predicate: 1`). Generation is
  a diff against the committed snapshot; constraints the metadata cannot
  express are reported, never emitted silently.
- `ndigo db new|generate|status` (AD-78): scaffold the next versioned
  migration, generate one from entity metadata (runs the app's
  `scripts.db:generate`), and report the journal (runs the app's
  `scripts.db:status`).
- `apps/04-ndigo-api`: the migration reference consumer — `db:migrate` /
  `db:generate` / `db:status` scripts, committed baseline migration +
  `db/schema.json`, `migrations.{runOnBoot,dir}` configuration with
  `migrateOnBoot` in the start path, and config-file loading
  (`config/application.json`) as the dotted-key carrier.
- Guide 27 — ORM & Migrations (the journaled lifecycle, the snapshot
  freshness gate, and the fidelity ceiling).
- `@ndigo/rate-limit` (AD-79): the `RateLimiter` SPI as a leaf package —
  async `consume` (AD-39), `RateLimitPolicy`/`RateLimitResult`,
  `validateRateLimitPolicy`, `likeRateLimiter`, `FixedWindowRateLimiter`
  (moved from `@ndigo/platform-node`), and the `RATE_LIMITER` context
  token. The platform interceptor awaits, the bean registers under the
  token, and apps import `RateLimitPolicy` from the new package (clean
  cutover — no re-exports).
- `@ndigo/redis/rate-limit` (AD-79): `RedisRateLimiter` — the shared-store
  fixed-window driver, one Lua script per consume (INCR, PEXPIRE on the
  first request of a window, PTTL as the `Retry-After` basis), keys
  `ndigo:rl:<namespace>:<windowMs>:<key>`, windows anchored at first
  request; budgets survive restarts and N processes share one budget
  (fail-closed by default; `onError: 'fail-open'` logs through
  `@ndigo/log` and allows).
- `@ndigo/platform-node` (AD-80/AD-81, 2026-10-09): opt-in TLS origin with
  native HTTP/2 — `tls?: TLSServerOptions` on `HTTPServerOptions` and the
  adapter (`key`/`cert`/`ca` inline-or-path, `minVersion?`, `ciphers?`,
  `clientAuth?` for mutual TLS, `maxConcurrentStreams?` to bound h2
  streams per connection), plus the all-or-nothing `NDIGO_TLS_KEY` /
  `NDIGO_TLS_CERT` + optional `NDIGO_TLS_CA` env pair (default adapter only;
  blank values count as unset). TLS material switches the listener to an
  `http2.createSecureServer` in `allowHTTP1` mode — ALPN negotiates h2
  with an HTTP/1.1 fallback, and WebSockets keep riding h1.1 (no RFC 8441
  in `ws`/browsers). Plaintext, edge-terminated stays the default posture
  (AD-80); a half-configured env pair throws rather than silently serving
  plaintext.
- `@ndigo/platform-node` (AD-90): the **`runNodeApplication(sources, options)`**
  lifecycle preset — composes `NodeAutoConfiguration` and `NodeEnvironment`
  with config files (new default reader `nodeConfigFileReader`), the
  `configureBuilder` / `beforeStart` hooks, extra teardown `resources`, and
  the `SIGINT`/`SIGTERM` wiring, then starts the managed `HTTP_SERVER` and
  returns `{ context, server, port, close }`. Every implicit action has a
  `false` switch; `ApplicationBuilder` and `gracefulShutdown` stay public
  and unchanged.
- `@ndigo/platform-node` (AD-90): `HTTPServer.port` reports the **bound**
  port once started — the kernel-assigned port when `port: 0` was requested —
  and reverts to the configured port on `close()`.
- `@ndigo/platform-web` (AD-90): the **`createWebApplication(sources, options)`**
  lifecycle preset — composes `WebAutoConfiguration` and `BrowserEnvironment`
  with the `DOMElementViewTarget` / `BrowserDispatcher` / `HashRouter` wiring
  and the first navigation, registers `VIEW_TARGET` / `DISPATCHER` / `ROUTER`,
  and exposes `root` / `eventMap` / `interceptors` / `initialPath` /
  `autoNavigate` / `beforeNavigate` / `platform` / `profiles` / `properties`
  options; `destroy()` is idempotent. The manual
  `MetadataConfigApplicationContext` path stays public and unchanged.
- `create-ndigo-app` (AD-92): an unscoped `npm create ndigo-app` bin that
  scaffolds a standalone pnpm project (node or browser kind) using the
  AD-90 presets (`runNodeApplication` / `createWebApplication`), with
  `--local` dev mode against the workspace, a copied decorator-lowering
  plugin, and a smoke + bundle guard in the generated app. Ships at 1.0.

### Changed

- `apps/07-ndigo-island`: migrated from Web Awesome to the ndigo-ui registry
  items — the form now uses native `<input>`/`<button>` with copy-in CSS and no
  component-library dependency (AD-95).
- `@ndigo/cli` (AD-75): the CLI underpinnings moved from `@oclif/core` v5 to
  `@stricli/core` — commands are `buildCommand` declarations, nested `db`
  routes use `buildRouteMap`, and the bin reads the same Stricli application
  the `runCli` embedding entry exposes. Exit-code contract unchanged
  (`0` ok / `2` usage / `1` runtime).
- `create-ndigo-app` is unchanged: it uses a hand-rolled argument parser (no
  OCLIF), so the migration did not apply to it.

- `@ndigo/generators` (AD-93): the repo-only Nx generator collection moved
  out of `packages/` to `tools/generators/` (`private: true`) — it hard-codes
  this repository's layout and is never published. `packages/` now contains
  consumer packages only; `ndigo new` / `ndigo generate` are unchanged.
- **The project is renamed: BlueJS → ndigo** (issue #78, AD-88): packages
  publish under `@ndigo/*`, the CLI is `ndigo`, problem-type URIs are
  `urn:ndigo:*`, env vars are `NDIGO_*`, Redis keys are `ndigo:*`, session
  cookies are `ndigo-session` / `__Host-ndigo-session`, and the durable tables
  are `ndigo_sessions` / `ndigo_jobs` / `ndigo_queue_messages` /
  `_ndigo_migrations`. The repository becomes `github.com/ndigo/ndigo`. Dated
  historical records keep the old name pending the tracked scrub pass.
- `@ndigo/oxlint-plugin` + lint rules (AD-86): repository-only rules moved
  out of the package into the internal plugin at root `src/oxlint/`, loading
  directly from TypeScript (rule IDs `internal/*`, e.g.
  `internal/no-internal-file-exports`). The package now ships the
  consumer-facing rules only; `pnpm test:internal` runs the internal specs.
- `@ndigo/oxlint-plugin` (AD-86, #117): `no-raw-console` and
  `no-browser-globals-in-isomorphic` returned to the internal plugin
  (`internal/*`) — both key off this repository's `packages/ndigo-*` layout,
  so they are inert or misleading in consumer projects. The package ships its
  six layout-independent rules until the two are de-hardcoded for app repos.
- `@ndigo/host` (AD-18): dropped the `private: true` staging flag — the
  package is publishable and the AD-86 `packages/` surface guard now carries
  no exceptions.
- `ndigo db generate` (2026-10-08 review, REV-002/REV-006): **fails loud**
  instead of emitting what the operator has not reviewed — a delta with
  destructive drops (dropped columns/tables) or changes the projection cannot
  express (type/nullability/PK) exits non-zero with the offending statements
  on stderr until acknowledged via `NDIGO_DB_ACCEPT_DROPS=true` /
  `NDIGO_DB_ACCEPT_UNSUPPORTED=true`. Previously the unsupported subset
  printed a warning, exited 0 and advanced the snapshot anyway, so the CI
  freshness gate could not see the DB/entity divergence.
- `/metrics` (2026-10-08 review, REV-003): the endpoint no longer dead-ends
  when no telemetry pull reader is configured — `ManagementAutoConfiguration`
  registers its feature aggregator as the fallback snapshot source, so
  feature counters (`counted` / `FeatureMetricAggregator`) are served in the
  Prometheus text + JSON views out of the box; a configured telemetry reader
  still wins.
- `@ndigo/telemetry` (2026-10-08 review, REV-004): the Prometheus text
  renderer keeps the first snapshot when two instrument names sanitize to
  the same exposition name (hyphen vs underscore class) and sanitizes
  attribute keys, so a scrape document can no longer carry malformed or
  duplicate metric names.
- `@ndigo/scheduler` (croner 10 → 11): DST handling is realigned with Vixie
  cron. A fixed-time job whose wall time falls in the spring-forward gap now
  runs at the first valid time after the gap (`0 30 2 * * *` in
  `Europe/Paris` fires 03:00, not 03:30), a job scoped to the skipped hour
  does not fire that day, and an interval job runs _through_ the repeated
  fall-back hour on both of its occurrences instead of jumping over it by the
  gap's length. Patterns using `?` in the day-of-month or day-of-week field
  now behave as the documented wildcard alias (`0 0 ? * MON` ran daily on
  10.x, now runs on Mondays). No API change: `@scheduled` specs, expressions
  and time zones are untouched.
- `@ndigo/content-i18next` (i18next 24 → 26): the adapter initializes with
  `initAsync: false` (the deprecated `initImmediate` alias it used was removed
  in i18next 26) and language resolution follows the 25.x matcher — a
  region-qualified code such as `fr-CA` still resolves to the base language, and
  `changeLanguage` requests no longer race. Behavior is unchanged for the
  adapter's surface; consumers that keep their own `i18next` copy alongside
  this package now need ≥26 for a single instance type.
- `@ndigo/orm-drizzle` (`@libsql/client` 0.17.4 → 0.18.0): the libSQL local
  driver now pools connections, so the transaction boundary is a real
  interactive transaction (`client.transaction('write')`, `BEGIN IMMEDIATE`)
  bound to the caller's async context instead of raw `BEGIN`/`COMMIT` on a
  single connection. Statements inside `run(fn)` — the Drizzle database, raw
  client calls, durable stores handed `dataSource.client` — join it as before;
  a statement from another async context now runs on its own connection instead
  of being silently enrolled in (and rolled back with) someone else's
  transaction, and the two cases that cannot be served this way fail loud:
  `TRANSACTION_ACTIVE` while an open transaction holds an in-memory database's
  only connection, `SQLITE_BUSY` on a concurrent write to a file database.
  `TransactionManager.run(fn)`, `@transactional` and the nested/concurrent
  rejection are unchanged.

- **API reference regrouped by source file** (`pnpm doc:api`, guides 12 and
  STYLE_GUIDE §5): each package's generated reference is now one module per
  source file instead of a flat list of kinds. `api/README.md` lists the
  files, each file page lists its own symbols, and symbol pages are namespaced
  by file (`api/<file>/classes/<Symbol>.md`). `_*.ts` internal files stay out;
  the `@module` header tag is retired (TypeDoc derives module names from paths —
  a package-wide tag collapsed multi-entry packages into duplicate modules) and
  the header generator, lint rule and 1,489 file headers were updated with it.
  Cross-file `{@link}` targets must now name their module
  (`{@link <module>.<Symbol> | Symbol}`); the doc-coverage gate was repaired (it
  had been checking the wrong reflection kinds and could never fire) and the 62
  public symbols it flagged are documented.
- `apps/02-ndigo-hello-node`, `apps/05-ndigo-api`, `@ndigo/generators`
  (AD-90): the Node entrypoints adopt the `runNodeApplication` preset — no
  more `process.env['PORT']` mutation or hand-written start/shutdown
  assembly, and `05-ndigo-api` drops its hand-written config-file reader.
  Generated node apps infer the dev port from `{ port: … }` and no longer
  declare `@ndigo/boot` directly (the platform carries it).
- `apps/08-ndigo-views`, `apps/19-ndigo-hn`, `@ndigo/generators` (AD-90): the
  browser entrypoints adopt the `createWebApplication` preset — no more
  hand-wired dispatcher/router/view-target assembly or duplicated hash-path
  helper. Generated browser apps ship `<name>-configuration.ts` (replacing
  `<name>-context.ts`) and no longer declare `@ndigo/router` directly.

### Fixed

- `ndigo doctor` (2026-11-02 review follow-up): the Node floor was pinned at
  22 while root `engines` requires `>=24` under `engine-strict` — the
  diagnostic users attach to issue reports pronounced an unusable runtime
  healthy. The floor is 24 now, a parity spec fails the lane if it drifts
  from `engines.node` again, and `CONTRIBUTING.md` states the same floor.
- `apps/04-ndigo-api` (2026-10-08 review, REV-001): `migrations.runOnBoot`
  binds with strict boolean parsing — the string `"false"`/`"0"` (env/CLI
  sources) now stays **false**; `z.coerce.boolean()` applied `Boolean("false")`
  → `true` and silently enabled migration-on-boot. A misspelled flag now
  fails boot instead of flipping the default.
- `apps/04-ndigo-api` (AD-78 remainder): the Drizzle controller opens the
  file-backed SQL store lazily inside `ensureInit()` — after `ensureDbDir()`
  — instead of at construction, so the lane boots on a fresh checkout
  (no pre-existing `data/` directory; libSQL CANTOPEN class) and tests can
  pin `NDIGO_DB_URL` before any request touches the store, as documented.
- `ndigo` (AD-75 review, discovered by AD-78): space-form nested commands
  (`ndigo db migrate`, `ndigo db new …`) printed topic help instead of running
  — the oclif `topicSeparator` was `:` so only `ndigo db:migrate` worked.
  `topicSeparator` is now a space; colon form keeps working.
- `ndigo` (AD-75, discovered by AD-78): one-shot commands (`db:*`, `inspect`,
  run-through scripts) received only `PATH` in their environment — config
  knobs like `NDIGO_DB_URL`, OTel endpoints and secret keys never reached the
  app script. The invoking environment now flows through (shell-free
  signal relays unchanged).
- `@ndigo/boot` (AD-90 D-5): the profile resolver no longer reads
  `process.env` directly — `NDIGO_PROFILES_ACTIVE`, `NDIGO_PROFILES_DEFAULT`,
  and `NDIGO_PROFILES_GROUPS` resolve through `getEnv`, so booting through
  `ApplicationBuilder` / `Application` works in browsers and workers where
  `process` is absent instead of failing startup with `process is not
  defined`; profile precedence is unchanged.

### Fixed

- `@ndigo/cluster` (AD-74 review): the crash-loop guard now tears down **every**
  sibling slot — a tripped cluster settles with `reason: 'crash-loop'`
  instead of hanging with live children; a spawn failure aborts fail-closed
  (no orphaned children); the worst sibling exit code survives a trip (floor
  1); and a `stop()` after an `abort()` is a no-op.
- `ndigo serve` (AD-74/75 review): `--port` is now forwarded as the cluster's
  `basePort`, so `--cluster N --port P` gives every slot a distinct
  `PORT = P + slot` as documented — slots no longer collide on one port.
- `ndigo generate` (AD-75 review): forwards each generator's declared flags
  (`--package`, `--file`, `--force`, `--className`, `--summary`, `--author`,
  `--description`, `--module`, `--path`, `--jobs`) — `component` and `header`
  are runnable from the CLI.
- `ndigo doctor` (AD-75 review): reports the workspace root by walking up to
  `pnpm-workspace.yaml` (not the `node_modules` dir `pnpm root` answers),
  performs real environment checks, and exits `1` when one fails.
- `ndigo` (AD-75 review): one-shot commands install their signal relays before
  spawning (a signal in the spawn window is never dropped), and the
  shell-operator guard also rejects `$()`/backtick scripts.
- `@ndigo/jobs`/`@ndigo/redis/jobs` (AD-72 review): the Redis driver's
  `heartbeat` and `retry` are single-Lua-script atomic units — a stale
  heartbeat can no longer re-lease a job a successor reclaimed, and a retry
  can no longer resurrect a completed (terminal) job; the claim script sweeps
  companion hashes of phantom records (no unbounded growth); the runner
  awaits its last in-flight heartbeat before the terminal transition;
  enqueue now fails loud on `undefined` payload members; the LibSQL job store
  gained a `(state, lease_expires_at)` reclaim index.
- `@ndigo/redis/locks` (AD-73 review): `close()` now releases the driver's own
  leases (token-checked, in-process parity), and only a successful acquire
  advances the fencing-token counter (consecutive tokens on both drivers).

### Added

- `@ndigo/telemetry-node` + `@ndigo/management` (AD-77): Prometheus metrics —
  `metricExporter: 'prometheus'` (metric signal only) registers a pull
  `PrometheusMetricReader` over the SDK `MeterProvider`; the management
  `/metrics` endpoint serves the same snapshot two ways — the Prometheus
  text exposition document by default (the scraper contract), and a JSON
  projection on `Accept: application/json`. `HTTPServerInstrumentation`
  records the semconv `http.server.request.duration` histogram (seconds,
  method + status attributes) for every request in every export mode. The
  `/metrics` `{ features }` aggregator document is replaced by the
  meter-derived view (breaking change, documented in guide 26 §2). New
  snapshot model + renderers in `@ndigo/telemetry`; the telemetry lab gains
  `NDIGO_TELEMETRY_METRIC_EXPORTER=prometheus`.

- `@ndigo/management` (AD-76): actuator parity — `/loggers` (level index,
  per-logger reads, and live `POST` level changes backed by a per-name
  registry in `@ndigo/log`), `/env` (property sources with origins,
  redacted values by default, `showValues` opt-in that never serves
  decrypted plaintext, `?toMatch=` filtering), `/configprops` (declared
  `@configurationProperties` keys and types only — never values), and
  health groups + single-component reads under `/health/<name>`. The new
  endpoints are **opt-in** via `management.endpoints.exposure.include`
  (a real config-file read path — the HI-5 annotation flips for the
  `management.*` read keys), with the AD-36 access-guard model extended to
  every management path. New guide 26.

- `ndigo generate package --jobs` — wire the `@ndigo/jobs` dependency into a
  new package at generation time.

- `@ndigo/jobs` (AD-72): durable job queues and the transactional outbox — the
  `JobDriver` SPI (lease-based at-least-once claims, attempts incremented at
  claim, expired leases reclaimed by the next `claim`, terminal `fail` with
  outcome telemetry/logs), the `JobQueue` producer facade, the `JobRunner`
  engine (concurrency slots, abort-on-timeout, lease heartbeat, exponential
  backoff, one `jobs.job.<type>` span and `@ndigo/log` outcome per execution),
  `@jobHandler` discovery mirroring `@scheduled` (registry scans at refresh,
  phase 0), and the outbox (`OutboxStore`, `OutboxRelay`,
  `JobOutboxPublisher`). Backends: `InProcessJobDriver` (the non-durable
  default), `LibSQLJobStore` + `LibSQLOutboxStore` in `@ndigo/orm-drizzle` (the
  outbox store borrows the data-source client, so `append()` inside
  `@transactional` commits or rolls back with the business data), and
  `RedisJobDriver` in the new `@ndigo/redis/jobs` subpath (atomic claim via one
  Lua script). `NodeAutoConfiguration` provides `jobDriver`, `jobQueue`,
  `jobHandlerRegistry`, and `jobRunner`; the runner starts explicitly — an
  unstarted runner arms no timer (worker processes call `start()`; see
  [guide 22](docs/guides/22-jobs-and-outbox.md)).
- `@ndigo/inspect` — programmatic inspection manifest (`inspectApplication`):
  a versioned, deterministic JSON view of routes, dispatcher mappings
  (pattern, HTTP methods/socket, handler class + method, parameters) and
  declared config keys (type, origin, presence — values are never read) for
  tooling, CI and docs. Seams: `MappingRegistry.entries()` /
  `getMappingEntries()` in `@ndigo/dispatcher`, and
  `declaredConfigurationProperties()` in `@ndigo/boot`; `apps/ndigo-api` gains
  an `inspect` script (AD-70).
- Config JSON Schema (`@ndigo/boot/schema/application.schema.json`) for
  `config/application.json` and profile variants, including the `{cipher:…}`
  at-rest secret marker, wired into `.vscode/settings.json`; the environment
  guide documents the `$schema` reference (AD-70).
- `@ndigo/oxlint-plugin`: `no-unsafe-view-name-literal` (the view-name
  traversal guard) and `no-duplicate-mapping-path` (method-level duplicate
  registrations), both enabled as errors; the duplicate rule is off in specs,
  where duplicate-registration fixtures are deliberate (AD-70).
- Component integration contract (AD-69): islands can paint server content
  before any script runs — `IslandView({ shadowHtml })` emits
  `<template shadowrootmode="open">`, `hydrateIslands` adopts the
  browser-parsed shadow root and upgrades the element in place, and
  `AbstractWebComponent.ensureShadowRoot()` accepts a pre-existing root — plus
  `AsFormAssociated(Base)` in `@ndigo/view-webcomponent` for form-associated
  custom elements whose values submit as standard form data through the
  existing binding/Zod path. No UI library is bundled; the decision record
  defines the adoption checklist and the no-wrappers discipline.
- Component library selection (AD-71): Web Awesome is the adopted library for
  the single reference integration — a dependency of `apps/ndigo-island` only
  (framework packages stay library-free). The island's add-item form uses its
  form-associated controls end-to-end: native `FormData` →
  `application/x-www-form-urlencoded` → `POST /items` → `dataBinderValue` +
  Zod → SSE push. Theming is the library's token stylesheet plus `--wa-*`
  overrides; first paint stays the DSD fallback pattern. Guide 21 documents
  the workflow, and the AD-69 vetting checklist carries recorded results
  (Spectrum and Material Web ship no form-associated controls; FAST has no
  maintained component set).
- `@ndigo/log` — dependency-light logging core (Logger contract,
  `getLogger`/`LoggerFactory`, console + OpenTelemetry appenders, severity
  mappings) extracted so framework internals can log without the telemetry
  stack (AD-67).
- `delay(ms)` — shared async delay helper in `@ndigo/util`, re-exported from
  `@ndigo/test` (replaces copy-pasted test helpers across packages) (HG-6).
- Environment accessors `getEnv(name, fallback?)` / `isDevMode()` in
  `@ndigo/util`, re-exported from `@ndigo/context` — centralized env reads for
  framework and app code (replaces scattered `process.env` lookups).
- `@ndigo/dispatcher`: `registerArgumentResolvers()` and
  `passthroughArgumentValue()` exports (consolidated platform resolver
  utilities).
- TOON support (AD-66): `MediaTypes.TEXT_TOON` media token and opt-in
  `application.toon` config files — `StandardConfigFileLoader` probes JSON
  first, then TOON (`format: 'auto' | 'json' | 'toon'`); the
  `@toon-format/toon` decoder is an optional peer, loaded lazily only when a
  `.toon` file is actually found. A restricted `format` also applies to
  `NDIGO_CONFIG_IMPORT` paths (extension mismatch errors), and JSON-looking
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
- Caching: awaitable `Cache`/`CacheManager` (`@ndigo/cache`), `@cached`
  decorator, `memoize`, Redis backend (AD-24, AD-39, AD-40).
- Scheduling: `@scheduled` decorator with single-flight engine (AD-20);
  distributed scheduling explicitly deferred (AD-41).
- Content/i18n: `MessageSource` contract, i18next adapter, Intl formatters,
  locale negotiation (AD-19).
- WebSockets & STOMP: session registry with rooms/heartbeat, isomorphic
  client with reconnect, STOMP 1.2 broker/client (AD-21..23).
- Server push: SSE-first island reactivity (AD-09).
- Signals: `@ndigo/signals` reactive state on `@preact/signals-core`
  (AD-59).
- Micro-frontends: host runtime, feature contexts with event-gateway
  isolation, route partitioning, shared-dependency contract (AD-18, AD-54,
  AD-62).
- Resilience: `@ndigo/proxy` method interception with retry + circuit
  breaker (`@ndigo/resilience`) (AD-42, AD-43).
- Observability: OpenTelemetry tracing/metrics/logging with Node and web
  instrumentations (AD-32).
- API docs: OpenAPI 3.0.3 generation from dispatch metadata + Swagger UI,
  DTO/schema-target conversion (AD-35, AD-38).
- Tooling: `@ndigo/test` integration harness (bootApp/MockHTTP), oxlint
  plugin architectural rules (AD-45, AD-46, AD-63).
- Example applications `08`–`19`: `08-ndigo-httpbin` (HTTP semantics
  playground), `09-ndigo-todobackend` (Todo-Backend REST spec + CORS/HEAD/
  OPTIONS), `10-ndigo-conduit-api` (RealWorld API, JWT + spec-exact error
  envelope), `11-ndigo-conduit-web` (RealWorld frontend), `12-ndigo-petclinic`
  (server-rendered forms, i18n, JSON negotiation), `13-ndigo-chat` (rooms,
  presence, history; STOMP interop with `@stomp/stompjs`), `14-ndigo-kanban`
  (versioned cards, 409 conflicts, optimistic UI), `15-ndigo-resilience-lab`
  (`@retry`/`@circuitBreaker` breaker cycle), `16-ndigo-redis-fanout`
  (cross-node cache + socket fan-out), `17-ndigo-telemetry-lab` (browser→server
  trace continuation, sampling, OTLP), `18-ndigo-auth-playground` (cookie/JWT/
  role/session-durability matrix + embedded OIDC PKCE issuer), `19-ndigo-hn`
  (cached/offline HN reader) — each with tests and a boot-smoke probe
  (`docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md`).
- Root `pnpm apps:smoke` — boots every Node example app on a dedicated probe
  port, asserts its documented route (plus the hello-node WebSocket echo),
  requires a clean SIGTERM exit and a released port; wired into the CI quality
  lane.

- `@ndigo/locks` (AD-73): distributed locks with **fencing tokens** — the
  `LockDriver` SPI (non-blocking `acquire` with lease TTLs, monotonic per-key
  tokens where only the current token can `renew`/`release`/`isHeld`), the
  process-wide `InProcessLockDriver` (single-node truth — every driver in the
  process coordinates, zero config), and the `LOCK_DRIVER` context token.
- `@ndigo/redis/locks` (AD-73): `RedisLockDriver` — Lua `SET NX PX` acquire +
  compare-and-delete release, one namespace per environment, borrowed
  connection. Cross-process single-executor for multi-node deployments.
- `@ndigo/cli` (AD-75): the `ndigo` binary — `serve` (with the AD-74
  `--cluster <n>` surface and `--port` derivation), `dev`, `generate`
  (fronting `@ndigo/generators`), `db:migrate`, `inspect` (the AD-70
  entry), and `doctor` (environment diagnostics). Built on `@oclif/core`
  ^5 as an embedded library; scripts run shell-free so SIGTERM/SIGINT
  reach the actual application process.
- `@ndigo/cluster` (AD-74): the process supervisor — `ClusterRunner` spawns N
  replicated worker slots (`NDIGO_CLUSTER_SLOT`/`SIZE`, `PORT = base + slot`
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
- `@ndigo/telemetry-web` (TEL-08): `countSocketClientBytes()` wires exact
  outbound-wire-byte telemetry through the socket client's `onSend` seam;
  `@ndigo/socket` exposes `SocketClient.onSendWired` so the instrumentation's
  `send` wrap skips its own payload estimation for seamed clients — bytes
  count exactly once, per write (buffered flushes and retried writes
  included).

### Changed

- `@ndigo/inspect` config introspection (REU-9): `declaredConfigurationProperties`
  and `relaxedKeyCandidates` moved to `@ndigo/context` (re-exported from
  `@ndigo/boot` unchanged) — the tooling package no longer pulls the boot layer
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
  (`apps/01-ndigo-hello` … `apps/07-ndigo-views`, new apps `08`–`19`); package
  names stay unnumbered (`@ndigo/hello` …) except the two unscoped demos, now
  `@ndigo/island` and `@ndigo/views`. `ndigo-todo`'s Vite dev port moves
  3000 → 3003 and `ndigo-hello-node`'s default 3000 → 3010; the port registry
  lives in `apps/README.md`. Lockfile importers, CI artifact paths, lint
  ignores and all doc links were swept with the rename.
- Example-app practice sweep (guides + AD-67): every app imports `getLogger`
  from the `@ndigo/log` leaf instead of `@ndigo/telemetry`, and the twelve apps
  that only log dropped their `@ndigo/telemetry` dependency; `03-ndigo-todo`
  boots `MetadataConfigApplicationContext` instead of the Node-oriented
  `ApplicationBuilder` (−98 kB in the client bundle; guide 01's minimal-app
  snippet now matches `02-ndigo-hello-node` again); `01-ndigo-hello`'s smoke spec
  uses the `@ndigo/test` browser harness (`docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md` §12).

- The `internal/requires-doc-header` oxlint rule now rejects stray `* * @…`
  header lines; a repo-wide sweep repaired 115 files (the artifact rendered as
  a literal `*` in generated module docs).
- Framework diagnostics (`@ndigo/factory`, `@ndigo/platform-node`, `@ndigo/test`)
  now import the logger from `@ndigo/log`; `@ndigo/telemetry` re-exports the
  logging surface, and the `@ndigo/telemetry/logger` subpath is gone — import
  `getLogger` from `@ndigo/log` (or the `@ndigo/telemetry` root).
- OpenTelemetry `ContextInstrumentation`/`DispatcherInstrumentation` are
  single implementations in `@ndigo/telemetry` (the node/web packages
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
- `@ndigo/reactive` modernized into `@ndigo/signals` (AD-59).
- Toolchain migrated from ESLint/Prettier to oxlint/oxfmt; `tsc -b` build
  retained (AD-58).
- Single-`Application` boot model; JSON-config loading and conditional
  browser/node boots (AD-03, AD-05).

### Removed

- `@ndigo/telemetry`'s `./logger` subpath — use `@ndigo/log` (AD-67).
- Legacy validation: `@ndigo/validate` constraint system and
  `@ndigo/model`/objectmodel, replaced by Zod (AD-07).
- `@ndigo/domain` MVVM layer, archived (AD-02 supersession).
- `@ndigo/parser` (dissolved into `@ndigo/core`) and the Ramda/Arcsecond
  dependencies (AD-57).
- `SiteBuilder` stub and the legacy Site/Page model remnants (AD-03).

### Fixed

- `@ndigo/generators:package` emits the current package tsconfigs (strict +
  `@ndigo/*` build paths; the stale `baseUrl` made every generated package fail
  `tsc -b` under TypeScript 7) and registers the new alias in the shared
  `vitest.aliases.ts` table instead of the obsolete `vitest.config.ts`
  insertion (a generated package previously missed manifest-gate rule 11).
- `@ndigo/auth-core` no longer exports the Node-only `ScryptPasswordEncoder`
  from its package root: the module imports `node:crypto` at evaluation time,
  and `@ndigo/auth-client` re-exported the whole root — so any browser app
  importing the auth client dragged a Node built-in into its module graph and
  crashed under `vite dev` (the production build masked it by compiling
  `process.env` reads away). The encoder now lives at
  `@ndigo/auth-core/scrypt`; the root stays isomorphic. Consumers updated
  (`apps/04`, `apps/10`, `apps/18`, the auth-server and orm-drizzle specs,
  guides 11 and 16, the package README) — verified by loading `ndigo-todo`'s
  dev server in a real browser (zero console errors, app renders).

- `ndigo-hello-node`'s `/echo` WebSocket handler now declares its session
  argument (`@parameters({ session: socketSessionValue('session') })`) — the
  previous form ran the handler with `undefined` and every connection closed
  with 1011 before echoing; locked with
  `apps/02-ndigo-hello-node/test/hello-socket.spec.ts`.
- App default ports are seeded into `process.env.PORT` before boot in
  `02-ndigo-hello-node`, `08-ndigo-httpbin` and `13-ndigo-chat`: the managed
  `HTTPServer` reads `process.env.PORT` (falling back to 3000), so the
  documented defaults were logged but not bound.

- App client bundles are valid JavaScript again: Vite 8's oxc transform passes
  TC39 decorators through unchanged (oxc 0.151 offers no lowering option), so
  decorator-using bundles — `@service`/`@getCall` in `ndigo-island`,
  `@signal`/`@effect` in `ndigo-todo` — shipped as syntax errors while Vitest
  suites stayed green (Vitest transforms through esbuild). A shared
  `scripts/vite-plugin-lower-decorators.mjs` esbuild pre-transform lowers them
  for app builds; the built bundles are syntax-checked in CI-adjacent tests.
- `ndigo-todo` renders its starter items on every todo route (`/`, `/active`,
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
- `@ndigo/test` `MockHTTP` finalizes interceptor denials exactly like the live
  Node adapter (`401`/`403` problem documents, `302` redirects), so guards are
  testable without writing the response themselves (IN-1).
- `@ndigo/util` `toRegExp` treats plain patterns that merely contain flag
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
- `@ndigo/factory`: `init()` failures now propagate as `FrameworkError`
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
  is documented and wired into the ndigo-api graceful shutdown
  (OP-3, OP-5, OP-6, OP-8, OP-9, OP-10). `/metrics` returns duration
  summaries again (OP-4).
- Resilience: invalid circuit-breaker specs fail loud at weave/invoke time
  instead of silently inverting the policy (OP-7).
- Signals: subclass reactivation limitation documented; the activation error
  names both possible causes (IN-3).
- Demos: ndigo-todo's signals counter renders; ndigo-host nav uses real hash
  links; ndigo-views `/report` loads from a production bundle; ndigo-island's
  documented `dev` flow works (AP-1..AP-4).
- Tooling: `@ndigo/generators` gains `build:lib`; nx legacy project blocks
  removed and `build:todomvc` rewired; scaffold manifests pass the docs
  gate; generated headers use `@module ndigo-<name>`; the dead JSDoc
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
- Reuse: `getErrorMessage` is promoted to `@ndigo/util` and used at all inline
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
  removed; ndigo-api route list + matrix tests (AP-5..AP-9).

### Security

- Disabled or deleted accounts revoke live sessions and JWTs at validation,
  and on-demand user-wide revocation is available through
  `CredentialsAuthAdapter.logoutAll(userId)` +
  `SessionStore.deleteForUser(userId)` (AD-68, SE-7).
- JWT `validate` accepts only access tokens: framework refresh tokens
  (`token_use: 'refresh'`, 7-day TTL) can no longer authenticate an API
  request; a present claim that is not `'access'` fails closed (SE-7).
- ndigo-todo's `todo-item.checked` getter now reflects the value assigned to
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
