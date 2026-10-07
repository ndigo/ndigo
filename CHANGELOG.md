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

### Changed

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
