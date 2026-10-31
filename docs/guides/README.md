# BlueJS Guides

Conceptual and hands-on guides for building applications with BlueJS. These complement the API reference (generated from JSDoc via `pnpm doc`); they explain the _how_ with runnable patterns grounded in the demo apps.

## Available Guides

1. [01 — Building a Node API](01-building-a-node-api.md) — the primary workflow end-to-end: DI bootstrap, configuration + entries, controllers, request binding, validation, errors, and shutdown. Reference application: `apps/04-blue-api`.
2. [02 — Request Validation](02-request-validation.md) — how validation fits the request pipeline: `@parameters` extractor composition, the `validatedBy` / `validatedBody` / `validatedQuery` surface, and entity-derived schemas (`insertSchemaForEntity`).
3. [03 — Environment & Configuration](03-environment-configuration.md) — the configuration pipeline: property sources + precedence, profiles, `@configurationProperties` typed binding, placeholders, customizers, `@environment` validation, live rebind (`@refreshScope`), at-rest secrets (`{cipher:...}` + `BLUE_SECRET_KEY`), and the remote config source (`configServer`, poll → refresh → rebind).
4. [04 — Content, i18n, and Locale](04-i18n-and-content.md) — the message source contract, i18next resources, server negotiation (`Accept-Language`), EJS `t()`/formatter helpers, and island locale propagation.
5. [05 — Scheduling](05-scheduling.md) — the `@scheduled` decorator, zero-wiring discovery, single-flight/error-isolation semantics, per-run OTel spans, and the Node-only guardrails.
6. [06 — WebSockets](06-websockets.md) — the `@socketMapping` contract, the session registry (`SocketSessionRegistry` bean: rooms, broadcast, heartbeat), the isomorphic client, and STOMP destinations/subscriptions/receipts.
7. [07 — Caching](07-caching.md) — the `@blue/cache` store (TTL + LRU/FIFO eviction), the `@cached` decorator for server methods, and `memoize` for client functions — the same semantics on both sides.
8. [08 — Multipart & File Upload](08-multipart-and-file-upload.md) — server-side acceptance of `multipart/form-data`: the `MultipartFile` contract, `fileValue()` binding, threshold-to-disk streaming, limits → 413, and filename-safety.
9. [09 — Argument Binding](09-argument-binding.md) — the handler binding surface: per-source extractors, whole-source data binding (`dataBinderValue` — the form/model story), `requestPart` JSON parts, matrix parity, missing-value → 400, and registering custom resolvers (`registerArgumentResolvers`, `passthroughArgumentValue`).
10. [10 — Telemetry](10-telemetry.md) — logging, the OTel span/trace surface, metric counters, and the Node/browser wiring.
11. [11 — Authentication & Sessions](11-authentication-and-sessions.md) — credentials + session storage, the auth decorators, and the admin-store workflow.
12. [12 — Package Documentation](12-package-documentation.md) — the documentation standard every package must meet: README template, metadata fields, generated API references (`pnpm doc:api`), and CI freshness enforcement.
13. [13 — OpenAPI & API Docs](13-openapi-and-api-docs.md) — the generated OpenAPI 3.0.3 spec from dispatch metadata, Swagger UI serving, `@apiDocs` metadata, and the `x-blue-*` extension surface.
14. [14 — DTO & Conversion](14-dto-conversion.md) — `ConversionService` schema targets: entity-derived DTOs, fail-fast semantics, and the OpenAPI response contract (`@apiDocs({ responses })`).
15. [15 — Method Interception & Resilience](15-method-interception.md) — metadata annotations, the interceptor chain (`@blue/proxy`), registration paths, weaving semantics, and retry + circuit breaking (`@blue/resilience`).
16. [16 — Persistence & Distributed Backends](16-persistence-and-distributed-backends.md) — the memory-first doctrine, durable LibSQL sessions, the shared Redis cache, cross-node WebSocket/STOMP fan-out, shutdown ordering, and the deferred items (distributed scheduling).
17. [17 — Static Files](17-static-files.md) — filesystem serving over HTTP: the greedy `/static/{*file}` controller, ETag/conditional GET, single-range requests, precompressed variants, SPA fallback, directory control, and the security model.
18. [18 — Signals & Islands](18-signals-and-islands.md) — reactive state with `@blue/signals` (`signal`/`computed`/`effect`, the `@reactive` decorators, stream and event bridges) and the island lifecycle: `IslandView` marker → `hydrateIslands()` → SSE-driven re-render.
19. [19 — Testing with `@blue/test`](19-testing.md) — the in-process harness (AD-63): `bootApp`/`cachedBootApp`, the `MockHTTP` request builder and `MockResult`, browser apps via `BrowserMockClient` + `MemoryViewTarget`, and what the harness deliberately is not.
20. [20 — The HTTP Client](20-http-client.md) — `@blue/http`: `HTTP.create` settings, the verb surface, the interceptor lifecycle hooks and built-ins, body transform pipelines, and the `QueryString`/`MatrixString` parsers.
21. [21 — Component Integration](21-component-integration.md) — adopting a Web Component library: the AD-69 vetting checklist, per-component imports without wrappers, the server-fallback pattern for first paint, FACE form submission into the existing binding/Zod path, token theming, and i18n wiring. Reference application: `apps/06-blue-island` (AD-71 — Web Awesome).
22. [22 — Jobs and the Transactional Outbox](22-jobs-and-outbox.md) — `@blue/jobs`: the `JobDriver` SPI (at-least-once lease-based delivery), `@jobHandler` discovery, retries/timeouts/spans, the durable libSQL and Redis drivers, and the outbox that commits side effects with the data.
23. [23 — Distributed Locks](23-distributed-locks.md) — `@blue/locks` (AD-73): leases + fencing tokens, the in-process and Redis drivers, and the `@scheduled({ lock })` single-executor contract across nodes.
24. [24 — Clustering](24-clustering.md) — `@blue/cluster` (AD-74): the process supervisor — replicated worker slots, `SIGINT`/`SIGTERM` relay into each child's own graceful shutdown, bounded-backoff restarts, and the fail-closed crash-loop guard.
25. [25 — The `blue` CLI](25-blue-cli.md) — `@blue/cli` (AD-75): serve (with the `--cluster` surface), dev, generate, db, inspect, and doctor — how scripts run shell-free so signals reach the app.
26. [26 — Management Endpoints](26-management-endpoints.md) — the actuator-parity surface (AD-76): `/health` groups and component reads, `/loggers` level inspection + live changes, `/env` with source origins and redaction, `/configprops` (declared keys, never values), and the opt-in exposure model. Reference application: `apps/04-blue-api`.
27. [27 — ORM & Migrations](27-orm-and-migrations.md) — the journaled migration lifecycle (AD-30/AD-78): decorator entities as the schema source, `blue db generate` (committed snapshot + freshness gate), `blue db migrate`/`db:status`, `migrations.runOnBoot`, and the fidelity ceiling (what stays hand-written). Reference application: `apps/04-blue-api`.
28. [28 — Feature Flags](28-feature-flags.md) — `@blue/flags` (AD-82): the never-throw `FlagEvaluator` SPI, the zero-config property provider (`feature.*`, live refresh), `@whenFeature` route gates (404 when off), and the OpenFeature provider seam for vendor flagging. Reference application: `apps/04-blue-api` (`/gated-report`).

## Reading Order

Start with guide 01; it introduces every concept the other guides and the package READMEs assume. Use the API reference when you need the full symbol surface.

## Conventions

- Code snippets are written against the current framework surface and mirror the demo applications — treat `apps/04-blue-api` as the canonical reference.
- API names link to nothing inline; the per-package TypeDoc references are
  generated (`pnpm doc:api` → `packages/<name>/api/`; index
  `api/README.md`) and the package READMEs link them.
