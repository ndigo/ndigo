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

- `@blue/log` — dependency-light logging core (Logger contract,
  `getLogger`/`LoggerFactory`, console + OpenTelemetry appenders, severity
  mappings) extracted so framework internals can log without the telemetry
  stack (AD-67).
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

### Changed

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

### Security

- Security headers default-on in `NodeAutoConfiguration` (CSP, HSTS,
  X-Frame-Options, nosniff, …) (AD-25).
- Rate limiting with fixed-window limiter and real client IP behind
  trusted proxies (AD-33, AD-37).
- At-rest secret encryption via `{cipher:...}` markers, AES-256-GCM
  (AD-29).
