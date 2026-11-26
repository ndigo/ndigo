# Ndigo Guides

Conceptual and hands-on guides for building applications with Ndigo. These
complement the API reference; they explain the _how_ with runnable patterns
grounded in the demo apps.

Guides are grouped below by topic; the groups are the reading order, not a
number. Each guide's slug is its stable identifier — titles can change without
moving the file.

> Historical records (ADRs, plans, audits) may still cite the old numbered
> guide paths. Those paths no longer resolve; the guide titles are unchanged.

## Start here

1. [Core Concepts & Mental Model](core-concepts.md) — context/factory/entry,
   dispatcher/route/mapping, views and targets, platform presets, and how the
   packages fit together.
2. [Building a Node API](building-a-node-api.md) — the primary server
   workflow end-to-end: DI bootstrap, configuration + entries, controllers,
   request binding, validation, errors, and shutdown. Reference application:
   `apps/05-ndigo-api`.
3. [Building a Browser App](building-a-browser-app.md) — the browser
   twin: the `createWebApplication` preset (`@ndigo/platform-web`, ) —
   context bootstrap, hash routing, DOM view targets, router interceptors,
   app-specific tokens, and the `bootWebApp` test harness. Reference
   applications: `apps/08-ndigo-views`, `apps/19-ndigo-hn`.

## Fundamentals

- [Environment & Configuration](environment-configuration.md) — the
  configuration pipeline: property sources + precedence, profiles,
  `@configurationProperties` typed binding, placeholders, customizers,
  `@environment` validation, live rebind (`@refreshScope`), at-rest secrets
  (`{cipher:...}` + `NDIGO_SECRET_KEY`), and the remote config source
  (`configServer`, poll → refresh → rebind).
- [Live Configuration & Secrets](live-configuration-and-secrets.md)
  — `@refreshScope`, `{cipher:...}` values with `NDIGO_SECRET_KEY`, and the
  remote config server poll loop.
- [Injection & Lifecycle](dependency-injection-and-lifecycle.md)
  — factory scopes, aware interfaces, init/destroy/close, smart lifecycle,
  parent/child contexts, and application events.
- [Config Layering & Contexts](configuration-layering-and-context-composition.md)
  — profiles vs config layers vs context boundaries: platform config packages,
  static `merge()` layering, parent/child contexts, multiple apps in one process,
  and explicit cross-context events.
- [Routing & Route Conditions](routing-and-route-conditions.md) — path
  patterns, query and matrix conditions, method/access conditions, precedence,
  404/405, partitions, and feature routing.
- [Argument Binding](argument-binding.md) — the handler binding
  surface: per-source extractors, whole-source data binding (`dataBinderValue`
  — the form/model story), `requestPart` JSON parts, matrix parity,
  missing-value → 400, and registering custom resolvers
  (`registerArgumentResolvers`, `passthroughArgumentValue`).
- [Request Validation](request-validation.md) — how validation fits the
  request pipeline: `@parameters` extractor composition, the `validatedBy` /
  `validatedBody` / `validatedQuery` surface, and entity-derived schemas
  (`insertSchemaForEntity`).
- [Errors & Problem Details](errors-and-problem-details.md) — RFC 9457,
  error lineage, `@errorMapping`, resolver chains, validation/binding failures,
  and denials.
- [Views & Content Negotiation](views-and-content-negotiation.md)
  — view contracts, serializing views, HTTP/DOM targets, the placement
  precedence, negotiation, resolvers, EJS and Web Component views, and themes.
- [View Targeting](view-targeting.md) — the strategy behind the
  precedence: centralized vs. decentralized placement, the ordered
  `viewTargeters` chain, the name/route/attribute targeters and their safety
  rules, target ownership and teardown, and the platform defaults.

## Web and APIs

- [Static Files](static-files.md) — filesystem serving over HTTP: the
  greedy `/static/{*file}` controller, ETag/conditional GET, single-range
  requests, precompressed variants, SPA fallback, directory control, and the
  security model.
- [The HTTP Client](http-client.md) — `@ndigo/http`: `HTTP.create`
  settings, the verb surface, the interceptor lifecycle hooks and built-ins,
  body transform pipelines, and the `QueryString`/`MatrixString` parsers.
- [OpenAPI & API Docs](openapi-and-api-docs.md) — the generated
  OpenAPI 3.0.3 spec from dispatch metadata, Swagger UI serving, `@apiDocs`
  metadata, and the `x-ndigo-*` extension surface.
- [DTO & Conversion](dto-conversion.md) — `ConversionService` schema
  targets: entity-derived DTOs, fail-fast semantics, and the OpenAPI response
  contract (`@apiDocs({ responses })`).
- [Multipart & File Upload](multipart-and-file-upload.md) — server-side
  acceptance of `multipart/form-data`: the `MultipartFile` contract,
  `fileValue` binding, threshold-to-disk streaming, limits → 413, and
  filename-safety.
- [WebSockets](websockets.md) — the `@socketMapping` contract, the
  session registry (`SocketSessionRegistry` entry: rooms, broadcast, heartbeat),
  the isomorphic client, and STOMP destinations/subscriptions/receipts.
- [STOMP & Cross-Node Fan-Out](stomp.md) — STOMP destinations,
  transactions, ack modes, `/user` and `/queue` semantics, resource caps, and
  the Redis fan-out.
- [Typed Service Clients & SSE](typed-service-clients-and-sse.md) —
  `@ndigo/service`: `serviceClient`, call decorators, schema-validated JSON,
  `{ stream: true }`, and the SSE parser.
- [Internationalization & Content](i18n-and-content.md) — the message
  source contract, i18next resources, server negotiation (`Accept-Language`),
  EJS `t`/formatter helpers, and island locale propagation.
- [Forms End-to-End](forms-end-to-end.md) — server-rendered forms,
  validation re-render, CSRF/PRG, browser error-envelope mapping, and FACE
  controls.
- [Caching](caching.md) — the `@ndigo/cache` store (TTL + LRU/FIFO
  eviction), the `@cached` decorator for server methods, and `memoize` for
  client functions — the same semantics on both sides.

## Data and async work

- [ORM & Migrations](orm-and-migrations.md) — the journaled migration
  lifecycle : decorator entities as the schema source,
  `ndigo db generate` (committed snapshot + freshness gate), `ndigo db
   migrate`/`db:status`, `migrations.runOnBoot`, and the fidelity ceiling (what
  stays hand-written). Reference application: `apps/05-ndigo-api`.
- [Persistence & Shared Stores](persistence-and-shared-stores.md) — the
  memory-first doctrine, durable LibSQL sessions, the shared Redis cache, and
  the ownership/lifecycle rules behind external backends.
- [Background Jobs](jobs-and-outbox.md) —
  `@ndigo/jobs`: the `JobDriver` SPI (at-least-once lease-based delivery),
  `@jobHandler` discovery, retries/timeouts/spans, the durable libSQL and Redis
  drivers, and the outbox that commits side effects with the data.
- [Scheduling](scheduling.md) — the `@scheduled` decorator, zero-wiring
  discovery, single-flight/error-isolation semantics, per-run OTel spans, and
  the Node-only guardrails.
- [Distributed Locks](distributed-locks.md) — `@ndigo/locks` :
  leases + fencing tokens, the in-process and Redis drivers, and the
  `@scheduled({ lock })` single-executor contract across nodes.
- [Clustering](clustering.md) — `@ndigo/cluster` : the process
  supervisor — replicated worker slots, `SIGINT`/`SIGTERM` relay into each
  child's own graceful shutdown, bounded-backoff restarts, and the fail-closed
  crash-loop guard.

## Security

- [Authentication & Sessions](authentication-and-sessions.md) —
  credentials + session storage, the auth decorators, JWT issuance/refresh and
  revocation, and the admin-store workflow.
- [Browser Authentication & OIDC](browser-authentication-and-oidc.md) —
  `AuthClient`, `ClientAuthGuard`, and the OIDC authorization-code + PKCE
  adapter.
- [Security Hardening](security-hardening.md) — CORS, CSRF, security
  headers/CSP, rate limiting, trusted proxies, cookie/session flags, and
  management exposure.

## Browser and UI

- [Signals & Islands](signals-and-islands.md) — reactive state with
  `@ndigo/signals` (`signal`/`computed`/`effect`, the `@reactive` decorators,
  stream and event bridges) and the island lifecycle: `IslandView` marker →
  `hydrateIslands` → SSE-driven re-render.
- [UI Components & Integration](component-integration.md) —
  ndigo-ui (tokens, the `ndigo ui`/shadcn registry, the `/ui` catalogue, MCP
  discovery, copy-in ownership) as the optional default, plus third-party Web
  Component libraries (Web Awesome): the vetting checklist, per-component
  imports without wrappers, first-paint fallback, form participation, theming,
  i18n, and CSP. The framework depends on none of them. Reference application:
  `apps/20-ndigo-ui-lab`; `apps/07-ndigo-island` is the migrated island example.
- [Micro Frontends](micro-frontends.md) —
  `HostManager`, feature contexts, lazy chunks, shared-dependency validation,
  event relay, and feature routing.

- [Custom View Engines](custom-view-engines.md) — implement `View` /
  `ProducerView` for React, Vue, or a bespoke renderer; resolver registration,
  hydration, assets, CSP, streaming, and testing.
- [Performance & Scaling](performance-and-scaling.md) — measure-first
  budgets, request/render/network/data/runtime levers, and the benchmark lanes.
- [Accessibility](accessibility.md) — landmarks, keyboard/focus, FACE
  forms, reduced motion/RTL, SSR focus, library vetting, and axe testing.

## Cross-cutting

- [Telemetry](telemetry.md) — logging, the OTel span/trace surface,
  metric counters, and the Node/browser wiring.
- [Management Endpoints](management-endpoints.md) — the actuator-parity
  surface : `/health` groups and component reads, `/loggers` level
  inspection + live changes, `/env` with source origins and redaction,
  `/configprops` (declared keys, never values), and the opt-in exposure model.
  Reference application: `apps/05-ndigo-api`.
- [AI Agents & Streaming](ai-agents.md) — `@ndigo/ai` + `@ndigo/ai-sdk`: a provider-neutral tool loop over the MCP registry, structured output and the adapter contract, SSE streaming, GenAI spans, rate limits, rollout flags, and secrets.
- [Agent-Facing Surfaces](agent-facing-surfaces.md) — the app→agent
  direction: `@toolMapping`, MCP over stdio and Streamable HTTP, MCP Apps
  `ui://` resources, A2UI through content negotiation, WebMCP browser tools,
  and the OpenAPI ↔ `tools/list` parity proof.
- [Capabilities for Authoring Agents](capabilities-for-authoring-agents.md)
  — authoring agents vs runtime agents, the three package categories, what a
  capability is (and is not), the CLI's plan/dry-run/apply contract, what a
  skill may carry, and where facts live.
- [The Agent Operate Contract](agent-operate-contract.md) — one
  vocabulary across the in-page bridge, MCP, WebMCP, and A2UI: tool/entity/
  snapshot/query/act, the safety-hint mapping each host can express, `source:
  agent` attribution, denial as data, and the UI SDK adapter slot.
- [Capability Authoring](capability-authoring.md) — the declared,
  installable unit between a package and a workflow: the entry schema, manifest
  back-reference, template variables, declared checks, and the gates a
  capability passes before it ships.
- [Feature Flags](feature-flags.md) — `@ndigo/flags` : the
  never-throw `FlagEvaluator` SPI, the zero-config property provider
  (`feature.*`, live refresh), `@whenFeature` route gates (404 when off), the
  OpenFeature bridge for vendor flagging, and the targeting-context resolver.
  Reference application: `apps/05-ndigo-api` (`/gated-report`).
- [Resilience & Retries](method-interception-and-resilience.md)
  — metadata annotations, the rule and advice chain (`@ndigo/advice`), registration
  paths, weaving strategies, and retry + circuit breaking (`@ndigo/resilience`).
- [Integration Testing](testing.md) — the in-process harness
  : `bootNodeApp`/`cachedBootNodeApp`, the `MockHTTP` request builder and
  `MockResult`, browser apps via `MockWebClient` + `MemoryViewTarget`, and
  what the harness deliberately is not.
- [The Ndigo CLI](ndigo-cli.md) — `@ndigo/cli`: the app lifecycle
  (`serve`/`dev` — serve replicates across worker slots), scaffolding
  (`new`/`generate`/`add`), db migrations, release-qc fronts, and the
  maintenance/DX tools — how scripts run shell-free so signals reach the app.

## Operations and quality

- [Deployment & Production](deployment-and-production-readiness.md)
  — build artifacts, environment/secrets, process model, graceful shutdown,
  health probes, TLS/HTTP2-3, static assets, containers, and the production
  checklist.
- [Quality Guardrails](quality-guardrails.md) — the
  `@ndigo/oxlint-plugin` rules, decorator/architecture conventions,
  `@ndigo/inspect` manifests, and package-surface checks.
- [Troubleshooting & FAQ](troubleshooting-and-faq.md) — symptom → cause
  → fix for routing, binding, validation, CORS/CSRF, DI, views, and
  migrations.
- [Upgrading Ndigo](upgrading.md) — the freeze/additive policy,
  `ndigo update`, CHANGELOG/migration workflow, rollback, and reading migration
  guides.

## Reference

- [Package → guide coverage](coverage.md) — the documentation home for every package.
- Glossary — the vocabulary used across the guides and API.

## Contributing

- [Package Documentation](package-documentation.md) — the documentation
  standard every package must meet: README template, metadata fields, generated
  API references (`pnpm doc:api`), CI freshness enforcement, and the
  migration-guide template.
- [Application Conventions](application-conventions.md) — the
  `apps/NN-ndigo-<slug>` ladder, `-web`/`-api` pairing, role-based file suffixes
  (`*-controller`, `*-service`, `*-configuration`, `*.entity.ts`, `*.dto.ts`),
  folder layout, test naming, and the deferred normalization backlog.

## Reading paths

- **Node API:** follow the Foundations, Core application model, HTTP &
  integration, Data, jobs & runtime, Security, and Operate & ship groups in
  order.
- **Browser app:** start with Building a Browser App, then the Browser & UI
  group, and the Security group.
- **Full-stack / islands:** Building a Node API + Building a Browser App, then
  Views & Content Negotiation, Internationalization & Content, Forms
  End-to-End, Signals & Islands, UI Components & Integration, and
  Micro Frontends.

Start with [**Core Concepts & Mental Model**](core-concepts.md), then
[Building a Node API](building-a-node-api.md) for a server app or
[Building a Browser App](building-a-browser-app.md) for a browser app. The
first guide introduces the concepts the rest of the guides and package READMEs
assume. Use the API reference when you need the full symbol surface.

## Guide contract

Every published guide follows the same shape. `pnpm guides:check` enforces the
contract in CI; redirect stubs (`<!-- guide-redirect -->`) are excluded.

```markdown
# Title

One paragraph: the problem, the outcome, and when to use it. Package names and
contracts belong in the next paragraph.

**Use for:** concrete tasks this guide helps with.
**Not for:** the cases it does not cover, with links to the alternative.

**Audience:** Node / browser / both · **Prerequisites:** guide or setup · **Reference app:** `apps/NN-ndigo-slug`

## What you'll learn

- 3–6 concrete outcomes.

## 1. ...

## See also

- Package README/API, related guides, ADRs, and the demo app.
```

Rules:

- The H1 number matches the filename number.
- The title is at most 30 characters, contains no module name (`@ndigo/...`),
  and no backticks. Use the user-facing capability, not the implementation.
- The opening paragraph starts with the problem or outcome in user language —
  no package, decorator, or "How X works in Ndigo" opener.
- Every guide has a `**Use for:**` and a `**Not for:**` line before
  `**Audience:**`.
- `**Audience:**`, `**Prerequisites:**`, and `**Reference app:**` (or
  `**Reference package:**`) are required.
- Use `**Reference app:**` or `**Reference package:**`; every backticked
  `apps/…` / `packages/…` path must exist.
- TypeScript fences must parse. Fragments are wrapped in a class/function for
  the check, so method and decorator snippets are allowed; `…` is treated as a
  placeholder.
- Keep the body task-shaped. Target ~300 lines; the check warns above 400 and
  recommends splitting or moving option tables to the package reference.
- Link the guide from this index. Planned guides stay unlinked until their file
  lands.
- In `## See also`, give each guide, package, app, or external concept its own
  bullet with a link; do not group multiple guides in one bullet.

## Conventions

- Code snippets are written against the current framework surface and mirror the
  demo applications — treat `apps/05-ndigo-api` as the canonical reference.
- API names link to nothing inline; the per-package TypeDoc references are
  generated on demand (`pnpm doc:api` → `packages/<name>/api/`; index `API.md`)
  and are not committed.
- Each guide states its audience, prerequisites, and reference app, and closes
  with related guides/ADRs.
