# 2026-06-18 Client-First Roadmap

**Status:** Active  
**Horizon:** 6–12 months (10+ waves)  
**Demo gate:** Every milestone must land a working flow in `blue-demo`  
**Legacy policy:** Port and integrate `.legacy.js` files as modern TypeScript; delete originals

---

## Priority Matrix (Client-First Lens)

| Priority | Feature | Impact | Wave |
|---|---|---|---|
| **P0** | JSON config loading + type-safe binding | Bootstrapping client apps | Wave 6 |
| **P0** | Conditional auto-configuration (`@ConditionalOnBrowser/Node`) | Foundation for all auto-config | Wave 6 |
| **P1** | IndexedDB/LocalStorage persistence | Offline support | Wave 4.5 |
| **P1** | Service worker integration | PWA support | Wave 4.5 |
| **P2** | Client-side caching | Performance | Wave 4.5 |
| **P2** | Global error handler | User experience | Wave 3 |
| **P2** | CORS handling | API integration | Wave 4.5 |
| **P3** | Client health indicators | Production readiness | Deferred |
| **P3** | Client testing utilities | Developer productivity | Future |
| **P3** | Client diagnostics / monitoring | Observability | Wave 7 |

---

## Client-First Architecture Principles

BlueJS is a **client-first, isomorphic framework**. The primary runtime is the browser;
Node.js is a secondary runtime for API servers or SSR. All features should be evaluated
against these principles:

1. **JSON over YAML**: Browser cannot parse YAML natively. Client config is JSON.
   YAML support, if added, would be server-side only (`@blue/platform-node`).

2. **Client-side persistence**: IndexedDB/LocalStorage for offline support, not databases.
   Database concerns are handled by `@blue/orm` on the server side.

3. **Service worker support**: PWA capabilities are first-class, not an afterthought.
   Service worker registration and management belong in `@blue/platform-web`.

4. **No embedded servers**: BlueJS does not embed Tomcat/Jetty. Node platform is for
   serving APIs, not hosting the full app (unless explicitly chosen for SSR).

5. **Isomorphic core purity**: Isomorphic packages (`@blue/core`, `@blue/context`,
   `@blue/dispatcher`, `@blue/http`) must contain zero platform-specific code.
   Browser/Node APIs belong exclusively in platform packages.

6. **Explicit route config first**: File-system convention can come later as a generator
   layer. Start with explicit config for flexibility and testability.

7. **Spring MVC-inspired OOP**: BlueJS follows Spring's `@Configuration` + `@Bean` pattern
   via `@configuration` + `@entry`. Factory classes add lifecycle management and platform
   selection, but should be registered via `@configuration` + `@entry` for consistency.

---

## Locked Architectural Decisions

The following decisions govern all subsequent wave work.

### AD-1: `@blue/http` vs `@blue/service` Boundary

**Decision:** Push CSRF, retry, error normalization, cache, and offline-detection into `@blue/http` as
interceptors. `@blue/service` remains a thin domain-aware façade: service registry, service-call telemetry,
request-id correlation, and app-reset coordination.

**Rationale:** `@blue/http` already has a mature interceptor + transform pipeline. The legacy service
interceptors (`header`, `error`, `cache`, `retryOnError`, `offline`, `status`, `appReset`) are HTTP
cross-cutting concerns, not business logic.

**Affects:** Wave 4.

---

### AD-2: `@blue/domain` vs `@blue/model` Reconciliation

**Decision:** `@blue/domain` is an optional MVVM layer that depends on `@blue/model` for validation and
`@blue/context` for event emission. `@blue/model` stays pure (validation/data shape). A domain component is
"model + actions + lifecycle." For Web Components, view-models project from domain. Future adapters (React,
Lit) back against the same domain component.

**Rationale:** `GenericDomainComponent.validate()` throws `Method not implemented`—it explicitly awaits this
decision. Reusing `@blue/model` avoids duplicating constraint logic.

**Affects:** Wave 5.

---

### AD-3: Minimal Viable `Site` Model

**Decision:** Defer `Site` to post-1.0. Ship a single-`Application` model first. `SiteBuilder` remains in
`@blue/boot` marked `@experimental` but is not on the critical path.

**Rationale:** History shows one main app accumulated all complexity. YAGNI applies.

**Affects:** Wave 6 (scoped down).

---

### AD-4: Browser-Only Code → `@blue/platform-web`

**Decision:** Audit and migrate browser-only globals (`window`, `document`, `navigator`, `HTMLElement`,
`history`) from isomorphic-core packages (`@blue/router`, `@blue/dispatcher`, `@blue/view`,
`@blue/context`, `@blue/content`) into `@blue/platform-web`. Enforce via a new
`@blue/eslint-plugin/no-browser-globals-in-isomorphic` rule.

**Rationale:** Isomorphic core principle from architecture roadmap §1.

**Current violations found:**
- `@blue/dispatcher/src/language-resolver.ts` — uses `navigator`
- `@blue/view/src/view.ts` — uses `history.pushState`
- `@blue/boot/src/application.ts` — `typeof window !== 'undefined'`

**Affects:** Wave 2.

---

### AD-5: `@blue/platform-node` MVP Scope

**Decision:** MVP includes: server environment binding, Node-side request/response argument resolvers,
server-side cookie/session adapters, and file-system resource loader. Excludes: server-side rendering of
Web Components (deferred to future view adapters) and database concerns (`@blue/orm` handles).

**Rationale:** Mirrors `@blue/platform-web` symmetry; smallest viable enabler for hybrid deployment.

**Affects:** Wave 8.

---

### AD-6: `@blue/factory` Scoping Split

**Decision:** Defer. Leave scoped factory integrated until real non-scoped consumers emerge. Document the
integration point. Revisit at 1.0 checkpoint.

**Rationale:** Premature abstraction risk.

**Affects:** Wave 10 checkpoint only.

---

### AD-7: Router Isomorphism

**Decision:** `@blue/router` core (route matching, params, navigation state) is platform-agnostic.
Platform-specific implementations (`HashRouter`, `BrowserRouter`, `FileSystemRouter`) live in
platform packages. This follows React Router v7's pattern: core in `lib/router/`, bindings in
`lib/dom/` and `lib/server-runtime/`.

**Migration:**
- `HashRouter` moves from `@blue/router` to `@blue/platform-web`
- `BrowserRouter` (History API) added to `@blue/platform-web`
- `FileSystemRouter` added to `@blue/platform-node`
- `@blue/router` exports the core `Router` interface and utilities

**Affects:** Wave 2 (audit), Wave 6 (boot auto-config).

---

### AD-8: Interceptor Lifecycle Pattern

**Decision:** Adopt Spring MVC's `HandlerInterceptor` lifecycle pattern for route handlers:
`preHandle()` → `postHandle()` → `afterCompletion()`. Add `interceptorIndex` tracking for
partial-chain cleanup (if interceptor #3's `preHandle()` fails, only #0-#2 get `afterCompletion()`).

**Rationale:** Spring's pattern is more robust than BlueJS's current interceptor implementation.
It ensures proper cleanup on partial-chain failures.

**Affects:** Wave 3 (dispatcher stabilization).

---

## Package Maturity Baseline (2026-06-18)

| Layer              | Package                   | Baseline | Target |
| :----------------- | :------------------------ | :------- | :----- |
| Integration        | `@blue/util`              | ✅ 100%  | —      |
| Integration        | `@blue/parser`            | ✅ 100%  | —      |
| Integration        | `@blue/model`             | ✅ 100%  | —      |
| Foundation         | `@blue/core`              | ✅ 100%  | —      |
| Web Infra          | `@blue/http`              | ✅ 100%  | —      |
| Observability      | `@blue/telemetry`         | ✅ 100%  | —      |
| Tooling            | `@blue/print`             | ✅ 100%  | —      |
| Tooling            | `@blue/eslint-plugin`     | ✅ 100%  | —      |
| Context            | `@blue/context`           | 🟡 85%   | 95%    |
| Request Processing | `@blue/dispatcher`        | 🟡 65%   | 90%    |
| Web Infra          | `@blue/router`            | 🟡 50%   | 80%    |
| Infrastructure     | `@blue/content`           | 🟡 45%   | 85%    |
| Application        | `@blue/platform-web`      | 🟡 45%   | 90%    |
| Request Processing | `@blue/view`              | 🟡 40%   | 85%    |
| Bootstrap          | `@blue/boot`              | 🟡 40%   | 85%    |
| Infrastructure     | `@blue/validate`          | 🟡 adv.  | 90%    |
| Infrastructure     | `@blue/factory`           | 🟡 adv.  | 90%    |
| Application        | `@blue/service`           | 🟡 30%   | 80%    |
| Request Processing | `@blue/view-webcomponent` | 🟡 25%   | 80%    |
| Application        | `@blue/domain`            | 🔴 15%   | 75%    |
| Persistence        | `@blue/orm`               | 🟡 MVP   | 70%    |
| Application        | `@blue/auth`              | ⬜ 0%    | MVP    |
| Platform           | `@blue/platform-node`     | ⬜ 0%    | MVP    |
| Demo               | `blue-demo`               | 🟡 core  | Full   |

---

## Wave Plan

### Wave 1 — Foundation Cleanup (1–2 weeks)

**Goal:** Remove legacy debt, lock conventions, finish pnpm 11 migration.

#### Tasks

- [ ] Complete pnpm 11 upgrade (resolve `ERR_PNPM_IGNORED_BUILDS` via `pnpm approve-builds`)
- [ ] Rename `2025-05-27_PNPM_9_UPGRADE.md` → `2026-05-27_PNPM_11_UPGRADE.md` with full content update
- [ ] Delete `packages/blue-util/bench/like.test.ts` (obsolete benchmark variant)
- [ ] Delete `packages/blue-util/src/type/_like-is.ts` (merged into `like.ts`)
- [ ] Delete `packages/blue-context/src/event-emitter.old.ts.txt` (superseded)
- [ ] Audit and delete `blue-view/test/*.js` (Chai/Mocha shared spec factories; not referenced by any `.spec.ts`)
- [ ] Audit all 9 `.legacy.js` files → produce port-or-delete decisions in Wave 4 spec
- [ ] Verify `pnpm build && pnpm test && pnpm lint` clean

**Demo gate:** Existing demo still runs.

#### Legacy File Inventory

| File | Location | Decision |
| :--- | :------- | :------- |
| `old-service.legacy.js` | `blue-service/src/` | Port in Wave 4 |
| `appReset.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `cache.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `error.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `header.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `offline.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/platform-web` in Wave 4 |
| `retryOnError.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `status.legacy.js` | `blue-service/src/interceptor/` | Port to `@blue/http` in Wave 4 |
| `old-http.legacy.js` | `blue-http/src/` | Read → document what's superseded |
| `old-fetch.legacy.js` | `blue-http/src/` | Read → document what's superseded |
| `old-component.legacy.js` | `blue-domain/src/` | Port in Wave 5 |
| `event-emitter.old.ts.txt` | `blue-context/src/` | Delete (event-emitter.ts supersedes it) |

---

### Wave 2 — Isomorphic Core Audit (2 weeks)

**Goal:** Apply AD-4 and AD-7. Enforce browser-only code boundary and router isomorphism.

#### Tasks

- [ ] Scan `@blue/router`, `@blue/dispatcher`, `@blue/view`, `@blue/context`, `@blue/content` for
  `window`, `document`, `navigator`, `HTMLElement`, `history`, `location`
- [ ] Migrate each offending usage: move to `@blue/platform-web` or behind an abstraction
- [ ] Fix `RerouteView._renderView` in `@blue/view` — replace `history.pushState` with router integration
- [ ] Audit `@blue/router` for platform-specific code — move `HashRouter` to `@blue/platform-web`, keep core interface in `@blue/router`
- [ ] Create `FileSystemRouter` stub in `@blue/platform-node` (server-side file-system routing)
- [ ] Add `no-browser-globals-in-isomorphic` lint rule to `@blue/eslint-plugin` for isomorphic-core packages
- [ ] Verify isomorphic packages build cleanly without `"lib": ["DOM"]` in tsconfig

**Demo gate:** Demo unchanged; new lint rule passes cleanly.

---

### Wave 3 — Stabilize Runtime Path (3–4 weeks)

**Goal:** Complete the dispatcher → view-webcomponent → platform-web integration path (roadmap §8, priority 1).

#### Tasks

**`@blue/view` (~40% → 85%)**

- [ ] Implement rendering for `AbstractTemplateView` subclass (non-DOM template rendering)
- [ ] Add view model projection hooks
- [ ] Integration tests: `view.render()` end-to-end

**`@blue/view-webcomponent` (~25% → 80%)**

- [ ] Complete view registration/discovery helpers (tag mapping to custom element registry)
- [ ] Finalize public export surface (`index.ts`)
- [ ] Integration tests: `WebComponentViewEngine.render()` into a real `DOMElementViewTarget`

**`@blue/dispatcher` (~65% → 90%)**

- [ ] Complete view negotiation flow (media type → resolver → view → render)
- [ ] Error view dispatch (configurable error route)
- [ ] Redirect handling via `RerouteView`
- [ ] **AD-8:** Adopt Spring MVC `HandlerInterceptor` lifecycle: `preHandle()` → `postHandle()` → `afterCompletion()`
- [ ] **AD-8:** Add `interceptorIndex` tracking for partial-chain cleanup

**`@blue/router` (~50% → 80%)**

- [ ] Complete `TransactionManager` (route transaction commit/rollback)
- [ ] Document deferred features (named routes, route generation)

**`@blue/platform-web` (~45% → 80%)**

- [ ] Wire all argument resolvers into `configure-argument-resolvers.ts`
- [ ] Integration tests covering each resolver

**Demo gate:** `blue-demo` navigates between ≥3 routes, each rendering distinct Web Component views,
with correct transaction lifecycle (start → commit/rollback).

---

### Wave 4 — Service Layer Boundary (2–3 weeks)

**Goal:** Apply AD-1. Port legacy service interceptors into `@blue/http` and `@blue/platform-web`.

#### Tasks

**Port to `@blue/http/interceptor/`**

- [ ] `header.legacy.js` → `header.ts` (CSRF token, channel-id, client-request-id headers)
- [ ] `error.legacy.js` → `error-normalization.ts` (standardise error shape from HTTP responses)
- [ ] `cache.legacy.js` → `cache.ts` (response caching strategy)
- [ ] `retryOnError.legacy.js` → `retry.ts` (configurable retry with backoff)
- [ ] `status.legacy.js` → `status.ts` (HTTP status code normalisation)
- [ ] `appReset.legacy.js` → `app-reset.ts` (application reset on specific status codes)

**Port to `@blue/platform-web/`**

- [ ] `offline.legacy.js` → `offline-interceptor.ts` (browser offline detection)

**`@blue/service` (30% → 80%)**

- [ ] Keep existing `app-reset-interceptor.ts`
- [ ] Add service registry (maps service tokens to HTTP endpoints)
- [ ] Add telemetry hooks (emit span per service call via `@blue/telemetry`)
- [ ] Add request-id correlation header injection
- [ ] Audit and document `old-service.legacy.js`; extract any remaining concerns

**Cleanup**

- [ ] Delete all `.legacy.js` files from `blue-service/src/` and `blue-http/src/`

**Demo gate:** Demo makes an HTTP call with CSRF header, retry, and telemetry trace correlation visible
in console/OTel span.

---

### Wave 4.5 — Client-Side Infrastructure (2–3 weeks)

**Goal:** Add client-first features that have no server equivalent.

**`@blue/platform-web` (~45% → 85%)**

- [ ] `IndexedDBResourceLoader`: client-side persistent storage adapter
- [ ] `LocalStorageResourceLoader`: lightweight key-value storage
- [ ] `ServiceWorkerRegistration`: automatic service worker registration helper
- [ ] `OfflineDetector`: `Navigator.onLine` + heartbeat-based offline detection
- [ ] `CacheStorageManager`: HTTP cache integration via `Cache` API
- [ ] `HashRouter`: move from `@blue/router` (completed in Wave 2)
- [ ] `BrowserRouter`: History API-based routing (new)

**`@blue/http` (~100% → 100%)**

- [ ] `CacheInterceptor`: response caching with TTL, cache-busting
- [ ] `CORSInterceptor`: automatic preflight handling
- [ ] `RetryOnOfflineInterceptor`: queue requests when offline, replay when online

**Demo gate:** Demo works fully offline (cached views, queued requests, replay on reconnection).

---

### Wave 5 — Domain/Model Reconciliation (3 weeks)

**Goal:** Apply AD-2. Bring `@blue/domain` to production-ready state.

#### Tasks

- [ ] Implement `GenericDomainComponent.validate()` via `@blue/validate` integration
- [ ] Implement `GenericDomainComponent.destroy()` lifecycle (emit destroy event, release listeners)
- [ ] Port `old-component.legacy.js` patterns → modern TC39 decorators
- [ ] Add `@domainComponent` class decorator (registers component in factory)
- [ ] Add `@domainAction` method decorator (marks methods as dispatchable actions)
- [ ] Add `@domainData` property decorator (mirrors data onto `model`)
- [ ] Document domain ↔ view-model projection pattern for Web Components
- [ ] Delete `old-component.legacy.js`

**Demo gate:** Demo has a domain component backing a Web Component view with validated state and
a working action that mutates the model and re-renders.

---

### Wave 6 — Boot & Auto-Configuration (3–4 weeks)

**Goal:** Apply AD-3 (single-app focus). Complete `@blue/boot` lifecycle.

#### Tasks

**`@blue/boot` (~40% → 85%)**

- [ ] `ApplicationBuilder`: finish web auto-configuration; document all extension points
- [ ] `Application.run()`: complete lifecycle (init → start → ready → close → destroy)
- [ ] `Application`: expose lifecycle event hooks (for telemetry, testing)
- [ ] Mark `SiteBuilder` as `@experimental` with clear documentation; remove from primary docs
- [ ] Integration tests covering full boot and controlled shutdown
- [ ] Update `web-auto-configuration.ts` to wire Wave 3–5 packages automatically

**Auto-Configuration (new)**

- [ ] Implement `@ConditionalOnBrowser` / `@ConditionalOnNode` decorators
- [ ] `WebAutoConfiguration` uses `@ConditionalOnBrowser`
- [ ] `NodeAutoConfiguration` uses `@ConditionalOnNode`
- [ ] `@ConfigurationProperties` type-safe binding with JSON config
- [ ] JSON config loading: `ApplicationBuilder.fromConfig(url)` loads config from URL
- [ ] SPI-like discovery deferred until framework is stable (not in Wave 6)

**Router Integration (new)**

- [ ] `HashRouter` in `@blue/platform-web` (moved from `@blue/router`)
- [ ] `BrowserRouter` in `@blue/platform-web` (new)
- [ ] `FileSystemRouter` in `@blue/platform-node` (new)
- [ ] `@blue/router` exports the `Router` interface and utilities only
- [ ] Users import routers from platform packages and register via `@entry`

**Demo gate:** `blue-demo` boots entirely via `ApplicationBuilder` with declarative configuration;
no manual wiring required in demo source.

---

### Wave 7 — Content, Validate, Context Polish (2 weeks)

**Goal:** Bring mid-tier packages to 85%+.

#### Tasks

**`@blue/content` (~45% → 85%)**

- [ ] Dynamic content sources (async loading, TTL-based caching)
- [ ] Theme composition (multiple theme sources merged in priority order)
- [ ] Content negotiation hooks for dispatcher integration

**`@blue/validate`**

- [ ] Finalize group-aware decorator symmetry between `native` and `zod` backends
- [ ] Add `@blue/orm` integration: validate on entity persist
- [ ] Improve error message formatting and i18n-readiness

**`@blue/context` (~85% → 95%)**

- [ ] Finalize tree event propagation edge cases (parent/child context event bubbling)
- [ ] Document refresh/close semantics with sequence diagrams
- [ ] Cover remaining branch paths in tests

**Demo gate:** Demo uses content negotiation for localised strings, validates a form route input,
and demonstrates context refresh on navigation.

---

### Wave 8 — Platform Expansion: `@blue/platform-node` (3–4 weeks)

**Goal:** Apply AD-5. Enable hybrid (browser + Node) deployment topology.

#### Tasks

- [ ] Create new package `packages/blue-platform-node/`
- [ ] `NodeEnvironment`: implements `Environment` interface (process.env binding)
- [ ] `NodeArgumentResolvers`: body, header, query, path argument resolvers for Node HTTP
- [ ] `NodeCookieArgumentResolver`: server-side cookie parsing
- [ ] `NodeSessionArgumentResolver`: server-side session abstraction
- [ ] `FileSystemResourceLoader`: loads resource files from disk (implements `@blue/context` resource contract)
- [ ] Argument resolver auto-configuration helper (mirrors `@blue/platform-web` pattern)
- [ ] Full unit + integration test coverage
- [ ] Build and lint config matching existing platform package patterns

**Demo gate:** New `blue-demo-node` example (or `blue-demo` `--node` flag) runs the dispatch pipeline
server-side in Node, rendering a route and returning the view model as JSON.

---

### Wave 9 — Ecosystem Packages (4–6 weeks)

#### 9a. `@blue/auth` (new package)

- [ ] Spec doc: `docs/plans/YYYY-MM-DD_AUTH_DESIGN.md`
- [ ] `AuthenticationStrategy` interface + provider registry
- [ ] `Principal` and `Session` abstractions
- [ ] `@authenticated` and `@authorized(role)` decorators
- [ ] Integration: `@blue/http` auth-header interceptor
- [ ] Integration: `@blue/dispatcher` route guard support

#### 9b. `@blue/orm` post-MVP

- [ ] Relation decorators: `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`
- [ ] Entity lifecycle hooks: `@prePersist`, `@postLoad`, `@preUpdate`, `@postRemove`
- [ ] `@transactional` method decorator
- [ ] `@blue/validate` integration on entity persist
- [ ] `@blue/orm-drizzle` adapter (ESM-first SQL backing store)

**Demo gate:** Demo has a login flow (via `@blue/auth`) and a persisted entity round-trip
(via `@blue/orm` + drizzle adapter).

---

### Wave 10 — 1.0 Checkpoint (2 weeks)

**Goal:** Final polish, audit, and public API stability commitment.

#### Tasks

- [ ] Revisit AD-6 (`@blue/factory` scoping split decision)
- [ ] Full architectural audit (architecture-reviewer)
- [ ] Security review (security-reviewer)
- [ ] Documentation completeness pass (all packages have README + TSDoc on public APIs)
- [ ] Migration guide: current state → 1.0
- [ ] Public API stability commitment (mark unstable APIs `@experimental` or `@internal`)
- [ ] Performance benchmark baselines (Vitest bench suite covering hot paths)

**Demo gate:** `blue-demo` demonstrates the full feature surface across all completed waves.

---

## Cross-Cutting Workstreams (Parallel)

### CC-1: Documentation Discipline

- Every wave: spec doc in `docs/plans/`, migration doc in `docs/migrations/` when breaking
- Maintain `docs/audits/` snapshot per wave
- All public APIs have TSDoc before wave PR merges

### CC-2: Test Coverage Targets

- New code: ≥85% line coverage
- Ported legacy: contract-based coverage (recover test cases from legacy when possible)
- Demo flows: integration tests, not just unit

### CC-3: ESLint Plugin Growth

- Wave 2 adds: `no-browser-globals-in-isomorphic`
- Future candidates: `require-tsdoc-on-public-api`, `enforce-internal-file-naming`
- Each enforceable architectural decision → new rule

### CC-4: Performance Tracking

- Vitest benchmarks for hot paths (currently: `like()`)
- Expand to: dispatcher routing, view resolution, router matching
- Regressions block merge

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--------- | :----- | :--------- |
| Legacy port loses subtle behavior | High | Medium | Write characterization tests before porting |
| Architectural decision proves wrong mid-wave | Medium | High | ADR per decision; explicit reversal record allowed |
| Demo integration drift | High | Medium | Demo is wave acceptance gate (enforced) |
| Wave 8 platform-node scope creep | Medium | Medium | Hold strict MVP line per AD-5 |
| Wave 5 domain blocked on view-engine ambiguity | Medium | High | AD-2 locked before Wave 5 starts |
| pnpm 11 build approval friction recurring | Low | Low | One-time `pnpm approve-builds` resolves |

---

## References

- [Architecture Roadmap](../reference/2026-03-08_ARCHITECTURE_ROADMAP.md)
- [Package Roadmap](2026-03-08_PACKAGE_ROADMAP.md)
- [pnpm 11 Migration](../migrations/2026-05-27_PNPM_11_UPGRADE.md)
- [ORM MVP Design](2026-03-30_ORM_MVP.md)
- [View Event Architecture](2026-03-22_VIEW_EVENT_ARCHITECTURE.md)
- [Scale 2 Context + Routing Architecture](2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md)
