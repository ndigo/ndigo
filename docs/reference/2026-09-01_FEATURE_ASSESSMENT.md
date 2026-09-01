# BlueJS vs. Industry: Feature Assessment

**Created:** 2026-09-01  
**Purpose:** Honest assessment of Blue's completeness against Spring MVC and modern JS/TS frameworks. Decides what to build, what to skip, and what to re-architect.

---

## 1. Production-Ready (✅ 1.0 Quality)

| Area | Details |
|---|---|
| **IoC / DI** | `@blue/context` + `@blue/factory` — context hierarchy, bean lifecycle, scopes, TC39 decorators. Comparable to Spring `ApplicationContext`. |
| **Dispatcher / MVC** | `@blue/dispatcher` — handler mappings, interceptors (pre/post/complete), argument resolvers (6 browser + 6 Node), error dispatch, view resolution. Mirror of Spring MVC's `DispatcherServlet`. |
| **View Layer** | 3 engines: template views (content-negotiated), Web Components, Wicket-style components. `ContentNegotiationViewResolver`. |
| **Auto-Configuration** | `@blue/boot` — `ApplicationBuilder`, `@ConditionalOnBrowser`/`@ConditionalOnNode`, `@ConfigurationProperties`. Comparable to Spring Boot auto-config. |
| **Validation** | `@blue/validate` — group-aware decorator validation, native backend, i18n-ready error formatting. |
| **HTTP Client** | `@blue/http` — interceptor chain (cache, retry, CORS, offline, auth header, error normalization). |
| **Platforms** | Browser (`@blue/platform-web`: `HashRouter`, `BrowserRouter`, `IndexedDB`, `LocalStorage`, argument resolvers) and Node.js (`@blue/platform-node`: `FileSystemRouter`, argument resolvers, environment). |
| **Documentation** | All 27 packages with READMEs, migration guide, architecture doc, style guide, reference docs with sequence diagrams. |

---

## 2. Beta (🟡 MVP Complete, Needs Work)

| Area | Gaps |
|---|---|
| **Auth** | JWT adapter is HMAC-only (RS256/ES256 need `jose`). OIDC adapter has `tokenValidator` hook but no built-in JWKS fetch. No OAuth2 resource server. No CSRF. |
| **ORM / Transactions** | `@transactional` still `@experimental` — `TransactionManager` not wired. Only Drizzle adapter. No Spring Data-style query derivation. |
| **Telemetry** | OpenTelemetry instruments exist but untested in distributed scenarios. No tracing correlation through interceptor chain. |

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

| Feature | Rationale | Approach |
|---|---|---|
| **Micro frontend shell** | Already half-built (`FeatureContextMountManager`, context hierarchy, route partitions). Unique advantage — Spring has nothing equivalent. | Finish lazy loading, add shared dep management, typed contracts. |
| **Type-safe routing** | Modern JS expectation (tRPC, TanStack Router). Blue's routes are stringly-typed (`"users/{id}"`). | Template literal types + zod at route binding. |
| **Partial hydration** | Ship zero JS to browser when possible. Blue's Web Component engine (`@blue/view-webcomponent`) is a natural island boundary. | Islands architecture via `@blue/view-webcomponent` + server render. |
| **Management endpoints** | Ops teams expect `/health`, `/metrics` out of the box. | Actuator-like package (`@blue/actuator` or `@blue/management`). |
| **Dev tooling** | Component inspector, source maps for decorators, performance profiler. | Browser extension + Vite plugin. |

### 3.3 Won't Build (Intentionally Skipped)

| Spring Feature | Why Skip | JS Idiom |
|---|---|---|
| **AOP with pointcuts** | Java needs AOP because it can't intercept methods without bytecode weaving. JS already has first-class interception: higher-order functions, decorators, Proxy, interceptor chains. A pointcut language (`execution(* service.*(..))`) would be an ugly Java import in JS. | Use TC39 decorators, interceptor chains, or a simple `withAround()` utility in `@blue/core`. |
| **SSG / ISR** | Compile-time rendering is a Vite/Next.js concern. Blue is a runtime framework. | Not planned. |
| **Messaging (JMS, RabbitMQ, Kafka)** | Enterprise integration concerns. Spring's messaging abstractions are heavy. JS has excellent native libraries for each broker. | Use `amqplib`, `kafkajs`, `ioredis` directly. |
| **Distributed systems (Cloud, Gateway)** | Spring Cloud solves problems that are less relevant in JS (JVM classloading, EAR deployments). JS has simpler deployment models. | Not planned. |
| **Reactive Web (WebFlux)** | Blue is request-response MVC. Reactive streams add complexity without clear benefit for most apps. | Stick with async/await + Promise-based pipeline. |
| **GraphQL** | Good library ecosystem. No framework integration needed. | Use `graphql-yoga` or `mercurius` directly. |
| **Java-style `@Scheduled` cron** | `node-cron` or `bull` are better JS-native solutions. | Document integration pattern, don't build. |
| **`@Value` property injection** | TypeScript already has `import.meta.env` and `process.env`. An annotation adds ceremony without value. | `@ConfigurationProperties` exists — that's enough. |

### 3.4 Won't Build (Deferred / Ecosystem)

| Feature | Status |
|---|---|
| **Express/Koa adapter** | Useful but not blocking. Nitro/Hono compatibility is more modern. |
| **`@Cacheable`** | HTTP cache interceptor exists. Method-level caching requires AOP (which we're not building). |
| **YAML config** | `fromConfig()` supports JSON. YAML/TOML can be added as a reader plugin. |
| **CLI scaffold (`create-blue`)** | Post-1.0 polish. Generators exist for packages. |
| **OpenAPI generation** | Useful but depends on stable decorator metadata spec. |
| **Configuration profiles** | Environment-based conditional beans (`@ConditionalOnNode`) exist. Spring-style `@Profile` adds little. |

---

## 4. Conclusion

Blue's strongest features (IoC, dispatcher, auto-config, validation) are production-ready. The single biggest architectural investment should be **signals** — it modernizes the reactive layer, unblocks view optimization, and replaces a dated Knockout/Backbone API with the industry-standard pattern. Everything else is either a smaller package or intentionally skipped.

**Immediate priorities:**
1. Signals — rewrite `@blue/reactive` → `@blue/signals`
2. Server-rendered HTML pipeline
3. Testing harness