# Ndigo Guides

Conceptual and hands-on guides for building applications with Ndigo. These
complement the API reference; they explain the _how_ with runnable patterns
grounded in the demo apps.

The numbering is stable: **00–49** are application guides, **90–91** are
contributor guides. Numbers are reading order within a section.

> **Renumbered 2026-11-08.** Historical records (ADRs, plans, audits) still use
> the old numbers. See the [renumbering map](../reference/2026-11-08_GUIDE_RENUMBERING.md);
> old guide paths redirect here.

## Start here

1. [00 — Core Concepts & Mental Model](00-core-concepts.md) — context/factory/entry,
   dispatcher/route/mapping, views and targets, platform presets, and how the
   packages fit together.
2. [01 — Building a Node API](01-building-a-node-api.md) — the primary server
   workflow end-to-end: DI bootstrap, configuration + entries, controllers,
   request binding, validation, errors, and shutdown. Reference application:
   `apps/05-ndigo-api`.
3. [02 — Building a Browser App](02-building-a-browser-app.md) — the browser
   twin: the `createWebApplication` preset (`@ndigo/platform-web`, ) —
   context bootstrap, hash routing, DOM view targets, router interceptors,
   app-specific tokens, and the `bootWebApp` test harness. Reference
   applications: `apps/08-ndigo-views`, `apps/19-ndigo-hn`.

## Fundamentals

- [03 — Environment & Configuration](03-environment-configuration.md) — the
  configuration pipeline: property sources + precedence, profiles,
  `@configurationProperties` typed binding, placeholders, customizers,
  `@environment` validation, live rebind (`@refreshScope`), at-rest secrets
  (`{cipher:...}` + `NDIGO_SECRET_KEY`), and the remote config source
  (`configServer`, poll → refresh → rebind).
- [43 — Live Configuration, Secrets & Remote Config](43-live-configuration-and-secrets.md)
  — `@refreshScope`, `{cipher:...}` values with `NDIGO_SECRET_KEY`, and the
  remote config server poll loop.
- [04 — Dependency Injection, Scopes & Lifecycle](04-dependency-injection-and-lifecycle.md)
  — factory scopes, aware interfaces, init/destroy/close, smart lifecycle,
  parent/child contexts, and application events.
- [49 — Configuration Layering & Context Composition](49-configuration-layering-and-context-composition.md)
  — profiles vs config layers vs context boundaries: platform config packages,
  static `merge()` layering, parent/child contexts, multiple apps in one process,
  and explicit cross-context events.
- [05 — Routing & Route Conditions](05-routing-and-route-conditions.md) — path
  patterns, query and matrix conditions, method/access conditions, precedence,
  404/405, partitions, and feature routing.
- [06 — Argument Binding](06-argument-binding.md) — the handler binding
  surface: per-source extractors, whole-source data binding (`dataBinderValue`
  — the form/model story), `requestPart` JSON parts, matrix parity,
  missing-value → 400, and registering custom resolvers
  (`registerArgumentResolvers`, `passthroughArgumentValue`).
- [07 — Request Validation](07-request-validation.md) — how validation fits the
  request pipeline: `@parameters` extractor composition, the `validatedBy` /
  `validatedBody` / `validatedQuery` surface, and entity-derived schemas
  (`insertSchemaForEntity`).
- [08 — Errors & Problem Details](08-errors-and-problem-details.md) — RFC 9457,
  error lineage, `@errorMapping`, resolver chains, validation/binding failures,
  and denials.
- [09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md)
  — view contracts, serializing views, HTTP/DOM targets, the placement
  precedence, negotiation, resolvers, EJS and Web Component views, and themes.
- [50 — View Targeting](50-view-targeting.md) — the strategy behind the
  precedence: centralized vs. decentralized placement, the ordered
  `viewTargeters` chain, the name/route/attribute targeters and their safety
  rules, target ownership and teardown, and the platform defaults.

## Web and APIs

- [10 — Static Files](10-static-files.md) — filesystem serving over HTTP: the
  greedy `/static/{*file}` controller, ETag/conditional GET, single-range
  requests, precompressed variants, SPA fallback, directory control, and the
  security model.
- [11 — The HTTP Client](11-http-client.md) — `@ndigo/http`: `HTTP.create`
  settings, the verb surface, the interceptor lifecycle hooks and built-ins,
  body transform pipelines, and the `QueryString`/`MatrixString` parsers.
- [12 — OpenAPI & API Docs](12-openapi-and-api-docs.md) — the generated
  OpenAPI 3.0.3 spec from dispatch metadata, Swagger UI serving, `@apiDocs`
  metadata, and the `x-ndigo-*` extension surface.
- [13 — DTO & Conversion](13-dto-conversion.md) — `ConversionService` schema
  targets: entity-derived DTOs, fail-fast semantics, and the OpenAPI response
  contract (`@apiDocs({ responses })`).
- [14 — Multipart & File Upload](14-multipart-and-file-upload.md) — server-side
  acceptance of `multipart/form-data`: the `MultipartFile` contract,
  `fileValue` binding, threshold-to-disk streaming, limits → 413, and
  filename-safety.
- [15 — WebSockets](15-websockets.md) — the `@socketMapping` contract, the
  session registry (`SocketSessionRegistry` entry: rooms, broadcast, heartbeat),
  the isomorphic client, and STOMP destinations/subscriptions/receipts.
- [42 — STOMP & Cross-Node Fan-Out](42-stomp.md) — STOMP destinations,
  transactions, ack modes, `/user` and `/queue` semantics, resource caps, and
  the Redis fan-out.
- [16 — Typed Service Clients & SSE](16-typed-service-clients-and-sse.md) —
  `@ndigo/service`: `serviceClient`, call decorators, schema-validated JSON,
  `{ stream: true }`, and the SSE parser.
- [17 — Internationalization & Content](17-i18n-and-content.md) — the message
  source contract, i18next resources, server negotiation (`Accept-Language`),
  EJS `t`/formatter helpers, and island locale propagation.
- [18 — Forms End-to-End](18-forms-end-to-end.md) — server-rendered forms,
  validation re-render, CSRF/PRG, browser error-envelope mapping, and FACE
  controls.
- [19 — Caching](19-caching.md) — the `@ndigo/cache` store (TTL + LRU/FIFO
  eviction), the `@cached` decorator for server methods, and `memoize` for
  client functions — the same semantics on both sides.

## Data and async work

- [20 — ORM & Migrations](20-orm-and-migrations.md) — the journaled migration
  lifecycle : decorator entities as the schema source,
  `ndigo db generate` (committed snapshot + freshness gate), `ndigo db
   migrate`/`db:status`, `migrations.runOnBoot`, and the fidelity ceiling (what
  stays hand-written). Reference application: `apps/05-ndigo-api`.
- [21 — Persistence & Shared Stores](21-persistence-and-shared-stores.md) — the
  memory-first doctrine, durable LibSQL sessions, the shared Redis cache, and
  the ownership/lifecycle rules behind external backends.
- [22 — Jobs & the Transactional Outbox](22-jobs-and-outbox.md) —
  `@ndigo/jobs`: the `JobDriver` SPI (at-least-once lease-based delivery),
  `@jobHandler` discovery, retries/timeouts/spans, the durable libSQL and Redis
  drivers, and the outbox that commits side effects with the data.
- [23 — Scheduling](23-scheduling.md) — the `@scheduled` decorator, zero-wiring
  discovery, single-flight/error-isolation semantics, per-run OTel spans, and
  the Node-only guardrails.
- [24 — Distributed Locks](24-distributed-locks.md) — `@ndigo/locks` :
  leases + fencing tokens, the in-process and Redis drivers, and the
  `@scheduled({ lock })` single-executor contract across nodes.
- [25 — Clustering](25-clustering.md) — `@ndigo/cluster` : the process
  supervisor — replicated worker slots, `SIGINT`/`SIGTERM` relay into each
  child's own graceful shutdown, bounded-backoff restarts, and the fail-closed
  crash-loop guard.

## Security

- [26 — Authentication & Sessions](26-authentication-and-sessions.md) —
  credentials + session storage, the auth decorators, JWT issuance/refresh and
  revocation, and the admin-store workflow.
- [27 — Browser Authentication & OIDC](27-browser-authentication-and-oidc.md) —
  `AuthClient`, `ClientAuthGuard`, and the OIDC authorization-code + PKCE
  adapter.
- [28 — Security Hardening](28-security-hardening.md) — CORS, CSRF, security
  headers/CSP, rate limiting, trusted proxies, cookie/session flags, and
  management exposure.

## Browser and UI

- [29 — Signals & Islands](29-signals-and-islands.md) — reactive state with
  `@ndigo/signals` (`signal`/`computed`/`effect`, the `@reactive` decorators,
  stream and event bridges) and the island lifecycle: `IslandView` marker →
  `hydrateIslands` → SSE-driven re-render.
- [30 — UI Libraries & Component Integration](30-component-integration.md) —
  ndigo-ui (tokens, the `ndigo ui`/shadcn registry, the `/ui` catalogue, MCP
  discovery, copy-in ownership) as the optional default, plus third-party Web
  Component libraries (Web Awesome): the vetting checklist, per-component
  imports without wrappers, first-paint fallback, form participation, theming,
  i18n, and CSP. The framework depends on none of them. Reference application:
  `apps/20-ndigo-ui-lab`; `apps/07-ndigo-island` is the migrated island example.
- [31 — Micro Frontends with `@ndigo/host`](31-micro-frontends.md) —
  `HostManager`, feature contexts, lazy chunks, shared-dependency validation,
  event relay, and feature routing.

- [41 — Custom View Engines](41-custom-view-engines.md) — implement `View` /
  `ProducerView` for React, Vue, or a bespoke renderer; resolver registration,
  hydration, assets, CSP, streaming, and testing.
- [45 — Performance & Scaling](45-performance-and-scaling.md) — measure-first
  budgets, request/render/network/data/runtime levers, and the benchmark lanes.
- [44 — Accessibility](44-accessibility.md) — landmarks, keyboard/focus, FACE
  forms, reduced motion/RTL, SSR focus, library vetting, and axe testing.

## Cross-cutting

- [32 — Telemetry](32-telemetry.md) — logging, the OTel span/trace surface,
  metric counters, and the Node/browser wiring.
- [33 — Management Endpoints](33-management-endpoints.md) — the actuator-parity
  surface : `/health` groups and component reads, `/loggers` level
  inspection + live changes, `/env` with source origins and redaction,
  `/configprops` (declared keys, never values), and the opt-in exposure model.
  Reference application: `apps/05-ndigo-api`.
- [47 — AI Agents, Model Loops & Streaming](47-ai-agents.md) — `@ndigo/ai` + `@ndigo/ai-sdk`: a provider-neutral tool loop over the MCP registry, structured output and the adapter contract, SSE streaming, GenAI spans, rate limits, rollout flags, and secrets.
- [48 — Agent-Facing Surfaces](48-agent-facing-surfaces.md) — the app→agent
  direction: `@toolMapping`, MCP over stdio and Streamable HTTP, MCP Apps
  `ui://` resources, A2UI through content negotiation, WebMCP browser tools,
  and the OpenAPI ↔ `tools/list` parity proof.
- [34 — Feature Flags](34-feature-flags.md) — `@ndigo/flags` : the
  never-throw `FlagEvaluator` SPI, the zero-config property provider
  (`feature.*`, live refresh), `@whenFeature` route gates (404 when off), the
  OpenFeature bridge for vendor flagging, and the targeting-context resolver.
  Reference application: `apps/05-ndigo-api` (`/gated-report`).
- [35 — Method Interception & Resilience](35-method-interception-and-resilience.md)
  — metadata annotations, the interceptor chain (`@ndigo/proxy`), registration
  paths, weaving semantics, and retry + circuit breaking (`@ndigo/resilience`).
- [36 — Testing with `@ndigo/test`](36-testing.md) — the in-process harness
  : `bootNodeApp`/`cachedBootNodeApp`, the `MockHTTP` request builder and
  `MockResult`, browser apps via `MockWebClient` + `MemoryViewTarget`, and
  what the harness deliberately is not.
- [37 — The `ndigo` CLI](37-ndigo-cli.md) — `@ndigo/cli`: the app lifecycle
  (`serve`/`dev` — serve replicates across worker slots), scaffolding
  (`new`/`generate`/`add`), db migrations, release-qc fronts, and the
  maintenance/DX tools — how scripts run shell-free so signals reach the app.

## Operations and quality

- [38 — Deployment & Production Readiness](38-deployment-and-production-readiness.md)
  — build artifacts, environment/secrets, process model, graceful shutdown,
  health probes, TLS/HTTP2-3, static assets, containers, and the production
  checklist.
- [39 — Quality Guardrails](39-quality-guardrails.md) — the
  `@ndigo/oxlint-plugin` rules, decorator/architecture conventions,
  `@ndigo/inspect` manifests, and package-surface checks.
- [40 — Troubleshooting & FAQ](40-troubleshooting-and-faq.md) — symptom → cause
  → fix for routing, binding, validation, CORS/CSRF, DI, views, and
  migrations.
- [46 — Upgrading Ndigo](46-upgrading.md) — the freeze/additive policy,
  `ndigo update`, CHANGELOG/migration workflow, rollback, and writing a
  migration guide.

## Reference

- [Package → guide coverage](coverage.md) — the documentation home for every package.
- [Glossary](../reference/GLOSSARY.md) — the vocabulary used across the guides and API.
- [Renumbering map](../reference/2026-11-08_GUIDE_RENUMBERING.md) — old→new guide numbers.

## Contributing

- [90 — Package Documentation](90-package-documentation.md) — the documentation
  standard every package must meet: README template, metadata fields, generated
  API references (`pnpm doc:api`), and CI freshness enforcement.
- [91 — Application Conventions](91-application-conventions.md) — the
  `apps/NN-ndigo-<slug>` ladder, `-web`/`-api` pairing, role-based file suffixes
  (`*-controller`, `*-service`, `*-configuration`, `*.entity.ts`, `*.dto.ts`),
  folder layout, test naming, and the deferred normalization backlog.

## Reading paths

- **Node API:** 01 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 →
  14 → 15 → 16 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 28 → 32 → 33 → 38.
- **Browser app:** 02 → 29 → 30 → 31 → 27 → 28 → 36.
- **Full-stack / islands:** 01 + 02 → 09 → 17 → 18 → 29 → 30 → 31.

Start with [**00 — Core Concepts**](00-core-concepts.md), then guide 01 for a
Node app or guide 02 for a browser app. Guide 01 introduces the concepts the rest
of the guides and package READMEs assume. Use the API reference when you need
the full symbol surface.

## Guide contract

Every published guide follows the same shape. `pnpm guides:check` enforces the
contract in CI; redirect stubs (`<!-- guide-redirect -->`) are excluded.

```markdown
# Guide NN — Title

One paragraph: the problem, the outcome, and the reference implementation.

**Audience:** Node / browser / both · **Prerequisites:** guide or setup · **Reference app:** `apps/NN-ndigo-slug`

## What you'll learn

- 3–6 concrete outcomes.

## 1. ...

## See also

- Package README/API, related guides, ADRs, and the demo app.
```

Rules:

- The H1 number matches the filename number.
- Use `**Reference app:**` or `**Reference package:**`; every backticked
  `apps/…` / `packages/…` path must exist.
- TypeScript fences must parse. Fragments are wrapped in a class/function for
  the check, so method and decorator snippets are allowed; `…` is treated as a
  placeholder.
- Keep the body task-shaped. Target ~300 lines; the check warns above 400 and
  recommends splitting or moving option tables to the package reference.
- Link the guide from this index. Planned guides stay unlinked until their file
  lands.

## Conventions

- Code snippets are written against the current framework surface and mirror the
  demo applications — treat `apps/05-ndigo-api` as the canonical reference.
- API names link to nothing inline; the per-package TypeDoc references are
  generated (`pnpm doc:api` → `packages/<name>/api/`; index `API.md`) and the
  package READMEs link them.
- Each guide states its audience, prerequisites, and reference app, and closes
  with related guides/ADRs.
