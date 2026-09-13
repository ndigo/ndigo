# BlueJS vs. Industry: Feature Assessment

**Created:** 2026-09-01  
**Purpose:** Honest assessment of Blue's completeness against Spring MVC and modern JS/TS frameworks. Decides what to build, what to skip, and what to re-architect.

---

## Status refresh (2026-09-13)

What changed since this assessment was written:

| Assessment item                                    | Status now                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Signals** (rewrite, high priority)               | ✅ Landed — `@blue/signals` (signals plan); demoed in `blue-island` (SSE push → `streamToSignal` → re-render) and `blue-todo` (counter view)                                                                                                                                                                             |
| **Server-rendered HTML pipeline**                  | ✅ Landed — `blue-island`: EJS whole-page shell + island SSR on Node (`@blue/view-ejs`), the Spring+Thymeleaf-style posture                                                                                                                                                                                              |
| **Testing harness**                                | ✅ Landed — `@blue/test` (`bootApp`, `MockHTTP`, `bootBrowserApp`/`BrowserMockClient`, `MemoryViewTarget`); integration suites in `blue-api`, `blue-island`, `blue-todo`, `blue-views`                                                                                                                                   |
| **Micro frontend shell**                           | ✅ Landed — `@blue/host` `HostManager` (AD-18): one-call registration, lazy chunks, shared-dependency validation; both demo hosts migrated                                                                                                                                                                               |
| **Partial hydration**                              | ✅ Landed — islands SSR + `hydrateIslands()`; reactive half via SSE (AD-9)                                                                                                                                                                                                                                               |
| **Management endpoints**                           | ✅ Demoed in `blue-api` (`/health`, `/metrics` through `ManagementAutoConfiguration` — the mapping-collection shadowing defect is fixed; blue-api boots it directly)                                                                                                                                                     |
| **Type-safe routing**                              | 🟡 Partial — `RouteRegistry`/`RouteDefinition` exist; **blue-todo now derives account route defs from `@routeMapping` metadata via `RouteRegistry.scanSources`** (typed authoring demo, with manual fallbacks for feature partitions)                                                                                    |
| **Auth gaps** (RS256/JWKS, OAuth2 resource server) | Unchanged — HMAC JWT + mock-validator OIDC in demos                                                                                                                                                                                                                                                                      |
| **`@transactional` / Transactions**                | Unchanged — still `@experimental`                                                                                                                                                                                                                                                                                        |
| **Telemetry (distributed/OTel)**                   | ✅ Landed — browser→server journey pattern: `configureBrowserTelemetry` (W3C propagator + OTLP trace export option) + `TraceHeaderInterceptor` inject `traceparent` from a client span; `HTTPServerInstrumentation` extracts and CONTINUES the trace server-side (same traceId, parent = client span; continuation spec) |

New demo coverage since 2026-09-01 (Wave A + B + telemetry): management endpoints, `Accept-Language`-aware content (`@blue/content` + `ContentSource`), `@configurationProperties` binding + AD-14 profile activation (`blue-api` full-bootstrap spec); localized footer + theme resolution and the `@blue/http` client chain — headers, **cache-hit refresh**, offline queueing/replay (`blue-views` `/client`); **header-driven content negotiation** — `Accept: text/csv` serves the same `report` view as CSV without the `.csv` extension (Accept → `mediaTypeHint` bridge in the negotiation manager + path-extension fallback; `blue-api` tests); **browser→server distributed tracing** — the visitor journey pattern: `blue-views` starts a client span per request, `TraceHeaderInterceptor` carries it as `traceparent`, `blue-api`'s `HTTPServerInstrumentation` extracts it and continues the SAME trace (continuation spec in `blue-telemetry-node`; collector export via `OTEL_EXPORTER_OTLP_ENDPOINT` in `blue-api`).

**Pre-existing (not caused by this work):** `blue-telemetry-node`'s server-sent-event-view spec fails in this environment (harness/timing) with and without these changes.

Framework defects surfaced by the Wave-A work — **all resolved 2026-09-13**:

1. ~~`ApplicationBuilder.properties()` — the `'boot'` property source does not resolve~~ — **Fixed**: property sources normalize dotted keys (`server.port`) into nested objects at registration, so builder/env/file sources resolve through the context environment.
2. ~~`@configurationProperties` numeric `@defaultValue` conversion returns the raw string~~ — **Fixed**: the `@property` decorator no longer nulls fields, so the binder infers the declared initializer type and converts numerically.
3. ~~`@profile`-gated entry methods skipped~~ — **Fixed**: `ConfigurationParser` is created lazily per use, evaluating gates against the prepared environment (builder profiles).
4. ~~`ManagementAutoConfiguration.handlerMappings` shadows other app routes~~ — **Fixed**: a `handlerMappings` collection now _supplements_ the platform `handlerMapping` (appended as final fallback in the mapping strategy); blue-api boots the auto-config directly.
5. ~~relative `baseURL` / relative `Request` URL throws "Invalid URL"~~ — **Fixed**: the HTTP client only trusts absolute base URLs; the demo uses a same-origin absolute endpoint.
6. View-engine contract: components render via the `model` setter — **Documented** in `WebComponentView` TSDoc + the `blue-views` client demo.
7. **New (Wave B):** `CacheInterceptor`/`RetryOnOfflineInterceptor` `new Request(response.url)` on empty stub URLs → 418 — **Fixed**: unkeyable responses (`!response.url`) are skipped, not replayed/cached.
8. **New (Wave B):** Accept-header negotiation was never plumbed — the strategies read a `mediaTypeHint` nobody set, and `PathExtensionContentNegotiationStrategy` claimed a `super.resolveMediaTypes` it doesn't inherit — **Fixed**: the manager bridges `Accept` → hint from Node request headers (dispatcher), and the strategy falls back to the hint filter when no extension matches.

**Still open (demo slices, not defects):** telemetry-depth demo (request-id correlation across the chain, OTLP/span export — needs an exporter seam or collector; the correlation utility exists in `@blue/service`); CSRF/CORS interceptor wiring demo (lowest value).

---

## 1. Production-Ready (✅ 1.0 Quality)

| Area                   | Details                                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IoC / DI**           | `@blue/context` + `@blue/factory` — context hierarchy, bean lifecycle, scopes, TC39 decorators. Comparable to Spring `ApplicationContext`.                                                               |
| **Dispatcher / MVC**   | `@blue/dispatcher` — handler mappings, interceptors (pre/post/complete), argument resolvers (6 browser + 6 Node), error dispatch, view resolution. Mirror of Spring MVC's `DispatcherServlet`.           |
| **View Layer**         | 2 engines: template views (content-negotiated) and Web Components. `ContentNegotiationViewResolver`.                                                                                                     |
| **Auto-Configuration** | `@blue/boot` — `ApplicationBuilder`, `@ConditionalOnBrowser`/`@ConditionalOnNode`, `@ConfigurationProperties`. Comparable to Spring Boot auto-config.                                                    |
| **Validation**         | Zod schemas (AD-7) — `@blue/orm` entity `@column({ schema })` derivation, dispatcher `validatedBy` for route params, `@blue/service` response schemas.                                                   |
| **HTTP Client**        | `@blue/http` — interceptor chain (cache, retry, CORS, offline, auth header, error normalization).                                                                                                        |
| **Platforms**          | Browser (`@blue/platform-web`: `HashRouter`, `BrowserRouter`, `IndexedDB`, `LocalStorage`, argument resolvers) and Node.js (`@blue/platform-node`: `FileSystemRouter`, argument resolvers, environment). |
| **Documentation**      | All 27 packages with READMEs, migration guide, architecture doc, style guide, reference docs with sequence diagrams.                                                                                     |

---

## 2. Beta (🟡 MVP Complete, Needs Work)

| Area                   | Gaps                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**               | JWT adapter is HMAC-only (RS256/ES256 need `jose`). OIDC adapter has `tokenValidator` hook but no built-in JWKS fetch. No OAuth2 resource server. No CSRF. |
| **ORM / Transactions** | `@transactional` still `@experimental` — `TransactionManager` not wired. Only Drizzle adapter. No Spring Data-style query derivation.                      |
| **Telemetry**          | OpenTelemetry instruments exist but untested in distributed scenarios. No tracing correlation through interceptor chain.                                   |

---

## 3. Gaps & Decisions

### 3.1 Should Build (High Priority)

#### Signals (Rewrite `@blue/reactive` → `@blue/signals`)

Current `@blue/reactive` uses a **pull-based** observable pattern (Knockout-style `get()`/`subscribe()`). The industry standard has moved to **signals** — a **push-based** model with automatic dependency tracking.

**Drivers:** Signals are strictly better: no manual `.subscribe()`/`.unsubscribe()`, no memory leaks, automatic granular updates, better performance (no diffing), simpler mental model. Every major framework has adopted them (Solid, Preact, Angular 17+, Vue 3, Qwik).

**Plan:** `docs/plans/2026-09-01_SIGNALS.md`

#### Server-Rendered HTML Pipeline

Blue can render views on the server (it has the pieces — `ContentNegotiationViewResolver`, `@blue/platform-node`), but there's no clear SSR pipeline. The goal is not Next.js-style SSR/SSG (compile-time + Vite). The goal is **Spring + Thymeleaf-style**: request → dispatcher → view resolver → template render → HTML response.

**Why:** Blue is a backend framework first. Sending HTML from the server is the primary interaction model. The current architecture supports this but the pipeline isn't wired end-to-end through `@blue/platform-node`.

**Not planned:** SSG / ISR / Streaming SSR — those are Vite/Next.js territory and conflict with Blue's runtime-first architecture.

#### Testing Harness (`@blue/test`)

No integration test support. Every package tests in isolation via Vitest. No equivalent of `@SpringBootTest`, `MockMvc`, or test context caching.

**Why:** Critical for adoption. Developers need to test their Blue applications, not just library internals.

### 3.2 Should Build (Medium Priority)

| Feature                      | Rationale                                                                                                                                 | Approach                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Micro frontend shell**     | Already half-built (`FeatureContextMountManager`, context hierarchy, route partitions). Unique advantage — Spring has nothing equivalent. | Finish lazy loading, add shared dep management, typed contracts.                                                                                                            |
| **Type-safe routing**        | Modern JS expectation (tRPC, TanStack Router). Blue's routes are stringly-typed (`"users/{id}"`).                                         | Template literal types + zod at route binding.                                                                                                                              |
| ~~**Partial hydration**~~ ✅ | Ship zero JS to browser when possible. Blue's Web Component engine (`@blue/view-webcomponent`) is a natural island boundary.              | `IslandView` (server, `@blue/view`) emits `<tag data-blue-island data-blue-model>`; `hydrateIslands()` (client, `@blue/view-webcomponent`) hydrates only marked components. |
| **Management endpoints**     | Ops teams expect `/health`, `/metrics` out of the box.                                                                                    | Actuator-like package (`@blue/actuator` or `@blue/management`).                                                                                                             |
| **Dev tooling**              | Component inspector, source maps for decorators, performance profiler.                                                                    | Browser extension + Vite plugin.                                                                                                                                            |

### 3.3 Won't Build (Intentionally Skipped)

| Spring Feature                           | Why Skip                                                                                                                                                                                                                                                                   | JS Idiom                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **AOP with pointcuts**                   | Java needs AOP because it can't intercept methods without bytecode weaving. JS already has first-class interception: higher-order functions, decorators, Proxy, interceptor chains. A pointcut language (`execution(* service.*(..))`) would be an ugly Java import in JS. | Use TC39 decorators, interceptor chains, or a simple `withAround()` utility in `@blue/core`. |
| **SSG / ISR**                            | Compile-time rendering is a Vite/Next.js concern. Blue is a runtime framework.                                                                                                                                                                                             | Not planned.                                                                                 |
| **Messaging (JMS, RabbitMQ, Kafka)**     | Enterprise integration concerns. Spring's messaging abstractions are heavy. JS has excellent native libraries for each broker.                                                                                                                                             | Use `amqplib`, `kafkajs`, `ioredis` directly.                                                |
| **Distributed systems (Cloud, Gateway)** | Spring Cloud solves problems that are less relevant in JS (JVM classloading, EAR deployments). JS has simpler deployment models.                                                                                                                                           | Not planned.                                                                                 |
| **Reactive Web (WebFlux)**               | Blue is request-response MVC. Reactive streams add complexity without clear benefit for most apps.                                                                                                                                                                         | Stick with async/await + Promise-based pipeline.                                             |
| **GraphQL**                              | Good library ecosystem. No framework integration needed.                                                                                                                                                                                                                   | Use `graphql-yoga` or `mercurius` directly.                                                  |
| **Java-style `@Scheduled` cron**         | `node-cron` or `bull` are better JS-native solutions.                                                                                                                                                                                                                      | Document integration pattern, don't build.                                                   |
| **`@Value` property injection**          | TypeScript already has `import.meta.env` and `process.env`. An annotation adds ceremony without value.                                                                                                                                                                     | `@ConfigurationProperties` exists — that's enough.                                           |

### 3.4 Won't Build (Deferred / Ecosystem)

| Feature                          | Status                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Express/Koa adapter**          | Useful but not blocking. Nitro/Hono compatibility is more modern.                                      |
| **`@Cacheable`**                 | HTTP cache interceptor exists. Method-level caching requires AOP (which we're not building).           |
| **YAML config**                  | `fromConfig()` supports JSON. YAML/TOML can be added as a reader plugin.                               |
| **CLI scaffold (`create-blue`)** | Post-1.0 polish. Generators exist for packages.                                                        |
| **OpenAPI generation**           | Useful but depends on stable decorator metadata spec.                                                  |
| **Configuration profiles**       | Environment-based conditional beans (`@ConditionalOnNode`) exist. Spring-style `@Profile` adds little. |

---

## 4. Conclusion

Blue's strongest features (IoC, dispatcher, auto-config, validation) are production-ready. The single biggest architectural investment should be **signals** — it modernizes the reactive layer, unblocks view optimization, and replaces a dated Knockout/Backbone API with the industry-standard pattern. Everything else is either a smaller package or intentionally skipped.

**Immediate priorities:**

1. Signals — rewrite `@blue/reactive` → `@blue/signals`
2. Server-rendered HTML pipeline
3. Testing harness
