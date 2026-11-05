# 2026-06-18 Client-First Roadmap

**Status:** Active  
**Horizon:** 6–12 months (10+ waves)  
**Demo gate:** Every milestone must land a working flow in `ndigo-demo`  
**Legacy policy:** Port and integrate `.legacy.js` files as modern TypeScript; delete originals

---

## Package Maturity Baseline (2026-06-18)

| Layer              | Package                    | Baseline | Target | Current |
| :----------------- | :------------------------- | :------- | :----- | :------ |
| Integration        | `@ndigo/util`              | ✅ 100%  | —      | ✅ 100% |
| Integration        | `@ndigo/parser`            | ✅ 100%  | —      | ✅ 100% |
| Integration        | `@ndigo/model`             | ✅ 100%  | —      | ✅ 100% |
| Foundation         | `@ndigo/core`              | ✅ 100%  | —      | ✅ 100% |
| Web Infra          | `@ndigo/http`              | ✅ 100%  | —      | ✅ 100% |
| Observability      | `@ndigo/telemetry`         | ✅ 100%  | —      | ✅ 100% |
| Tooling            | `@ndigo/print`             | ✅ 100%  | —      | ✅ 100% |
| Tooling            | `@ndigo/eslint-plugin`     | ✅ 100%  | —      | ✅ 100% |
| Context            | `@ndigo/context`           | 🟡 85%   | 95%    | 🟢 95%  |
| Request Processing | `@ndigo/dispatcher`        | 🟡 65%   | 90%    | 🟢 90%  |
| Web Infra          | `@ndigo/router`            | 🟡 50%   | 80%    | 🟡 80%  |
| Infrastructure     | `@ndigo/content`           | 🟡 45%   | 85%    | 🟢 85%  |
| Application        | `@ndigo/platform-web`      | 🟡 45%   | 90%    | 🟢 90%  |
| Request Processing | `@ndigo/view`              | 🟡 40%   | 85%    | 🟢 85%  |
| Bootstrap          | `@ndigo/boot`              | 🟡 40%   | 85%    | 🟢 85%  |
| Infrastructure     | `@ndigo/validate`          | 🟡 adv.  | 90%    | 🟢 90%  |
| Infrastructure     | `@ndigo/factory`           | 🟡 adv.  | 90%    | 🟡 adv. |
| Application        | `@ndigo/service`           | 🟡 30%   | 80%    | 🟢 80%  |
| Request Processing | `@ndigo/view-webcomponent` | 🟡 25%   | 80%    | 🟢 80%  |
| Application        | `@ndigo/domain`            | 🔴 15%   | 75%    | 🟢 75%  |
| Persistence        | `@ndigo/orm`               | 🟡 MVP   | 70%    | 🟢 70%  |
| Application        | `@ndigo/auth`              | ⬜ 0%    | MVP    | 🟢 MVP  |
| Platform           | `@ndigo/platform-node`     | ⬜ 0%    | MVP    | 🟢 MVP  |
| Demo               | `ndigo-demo`               | 🟡 core  | Full   | 🟡 core |

---

## Wave Plan

### Wave 1 — Foundation Cleanup (1–2 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] Delete `packages/ndigo-util/bench/like.test.ts` (obsolete benchmark variant)
- [x] Delete `packages/ndigo-util/src/type/_like-is.ts` (merged into `like.ts`)
- [x] Delete `packages/ndigo-context/src/event-emitter.old.ts.txt` (superseded)
- [x] Audit all `.legacy.js` files → ported or deleted in Wave 4
- [x] Verify `pnpm build && pnpm test && pnpm lint` clean

**Not applicable / deferred:**

- pnpm 11 upgrade completed before roadmap was written; no `ERR_PNPM_IGNORED_BUILDS` present
- `ndigo-view/test/*.js` — no such files exist
- Migration doc naming — low priority cosmetic

---

### Wave 2 — Isomorphic Core Audit (2 weeks)

**Status:** ✅ Complete (pre-existing + OXC Phase 1)

- [x] Scan isomorphic packages for browser globals — clean
- [x] Fix `RerouteView._renderView` — `history.pushState` is guarded with `typeof history` and prefers `router.navigate()`
- [x] Move `HashRouter` to `@ndigo/platform-web` — already done, not exported from `@ndigo/router`
- [x] Create `FileSystemRouter` stub in `@ndigo/platform-node` — exists with navigate/refresh
- [x] Add `no-browser-globals-in-isomorphic` lint rule — done, 14 tests pass
- [x] Verify isomorphic packages build without DOM lib — clean

---

### Wave 3 — Stabilize Runtime Path (3–4 weeks)

**Status:** ✅ Substantially complete (this session)

- [x] `@ndigo/view`: `StringTemplateView` extends `AbstractTemplateView`, `_projectViewModel` hook, 18 tests including end-to-end `view.render()` pipeline
- [x] `@ndigo/view-webcomponent`: `TagMapping`/`ViewMapping` decorators, `DOMElementViewTarget`, `WebComponentViewEngine`, 63 tests
- [x] `@ndigo/dispatcher`: AD-08 `HandlerInterceptor` lifecycle (`interceptorIndex`, `preHandle`/`postHandle`/`completeHandle`), error view dispatch tests
- [x] `@ndigo/router`: `TransactionManager` + `DefaultRouteTransactionManager` + `DefaultRouteTransactionStatus` — 5 tests
- [x] `@ndigo/platform-web`: 5 argument resolvers wired in `configure-argument-resolvers.ts`, 117 tests

**Remaining:**

- [x] View negotiation flow (media type → resolver → view → render) — tested with ContentNegotiationViewResolver pipeline
- [x] `RerouteView` redirect handling end-to-end test — delegating to `router.navigate()` and `history.pushState` fallback
- [x] `TransactionManager` commit/rollback lifecycle — full lifecycle integration tests

---

### Wave 4 — Service Layer Boundary (2–3 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] All legacy interceptors ported to `@ndigo/http/interceptors/` — `header`, `error-normalization`, `cache`, `retry`, `status`, `app-reset`
- [x] `offline-interceptor` in `@ndigo/platform-web`
- [x] All `.legacy.js` files deleted from `ndigo-service/` and `ndigo-http/`
- [x] `@ndigo/service`: service registry, telemetry hooks, request-id correlation — 33 tests

---

### Wave 4.5 — Client-Side Infrastructure (2–3 weeks)

**Status:** ✅ Complete

- [x] `CacheInterceptor` — response caching with TTL, cache-busting (fixed LRU eviction)
- [x] `OfflineDetector` — `offline-interceptor.ts`
- [x] `HashRouter` — in `@ndigo/platform-web`
- [x] `BrowserRouter` — History API-based routing with `pushState`/`popstate`
- [x] `CORSInterceptor` — automatic preflight handling
- [x] `RetryOnOfflineInterceptor` — queue requests when offline, replay when online
- [x] `LocalStorageResourceLoader` — lightweight key-value storage
- [x] `IndexedDBResourceLoader` — client-side persistent storage adapter

**Deferred (not in scope):**

- `ServiceWorkerRegistration` — automatic SW registration helper (platform-specific, low priority)
- `CacheStorageManager` — HTTP cache integration via `Cache` API (depends on SW registration)

---

### Wave 5 — Domain/Model Reconciliation (3 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] `GenericDomainComponent.validate()` via `@ndigo/validate` integration
- [x] `GenericDomainComponent.destroy()` lifecycle (emit destroy event, release listeners)
- [x] `@domainComponent` class decorator
- [x] `@domainAction` method decorator
- [x] `@domainData` property decorator
- [x] `old-component.legacy.js` deleted
- [x] 26 tests pass, build clean

---

### Wave 6 — Boot & Auto-Configuration (3–4 weeks)

**Status:** ✅ Complete (this session)

- [x] `ApplicationBuilder.fromConfig(url)` — JSON config loading
- [x] `@ConditionalOnBrowser` / `@ConditionalOnNode` decorators
- [x] `WebAutoConfiguration` uses `@ConditionalOnBrowser`
- [x] `NodeAutoConfiguration` uses `@ConditionalOnNode` metadata
- [x] `@ConfigurationProperties` + `resolveConfigurationProperties()` — type-safe binding
- [x] `SiteBuilder` marked `@experimental`
- [x] Property source reassignment bug fix
- [x] 46 tests, build clean

**Deferred (per roadmap):**

- Router integration (`HashRouter`/`BrowserRouter`/`FileSystemRouter` moved to Wave 4.5)
- SPI-like discovery — deferred until framework stable

---

### Wave 7 — Content, Validate, Context Polish (2 weeks)

**Status:** 🟡 Partially complete (this session)

**`@ndigo/context` (~85% → 95%) ✅**

- [x] Finalize tree event propagation edge cases — 6 new tests covering root bubble, leaf broadcast, deep bubble chains, close on never-refreshed context, removeChild miss, repeated close no-op
- [x] Cover remaining branch paths in tests — 158 total

**Open:**

- [x] Document refresh/close semantics with sequence diagrams — `docs/reference/2026-08-22_CONTEXT_LIFECYCLE.md`

**`@ndigo/content` (~45% → 85%) — COMPLETE** ✅

- [x] Dynamic content sources (async loading, TTL-based caching) — `TtlContentSource` with 7 tests
- [x] Theme composition (multiple theme sources merged in priority order) — `CompositeThemeResolver`, `PriorityContentSource` with 5 tests
- [x] Content negotiation hooks for dispatcher integration — `NegotiatingContentSource` with Accept-Language parsing, 8 tests

**`@ndigo/validate` — COMPLETE** ✅

- [x] Finalize group-aware decorator symmetry between `native` and `zod` backends — `@validated` now accepts `backend` option; groups are preserved through `createConstraintDecorator`; both backends use the same group filtering
- [x] Improve error message formatting and i18n-readiness — `formatErrorMessage()` includes rejected value; `setErrorMessageFormatter()` for custom/i18n formatting

---

### Wave 8 — Platform Expansion: `@ndigo/platform-node` (3–4 weeks)

**Status:** ✅ Complete

- [x] Package exists at `packages/ndigo-platform-node/`
- [x] `NodeEnvironment` — implements `Environment` interface
- [x] `NodeArgumentResolvers`: body, header, query, path, cookie, session — 6 resolvers
- [x] `FileSystemResourceLoader`
- [x] `NodeAutoConfiguration` with `@ConditionalOnNode` metadata
- [x] `FileSystemRouter` with navigate/refresh
- [x] Build and lint config matching existing platform package patterns
- [x] 105 tests across 13 test files — all source files covered

---

### Wave 9 — Ecosystem Packages (4–6 weeks)

**Status:** ⬜ Not started

#### 9a. `@ndigo/auth` (new package)

- [x] Spec doc: `docs/plans/2026-05-28_AUTH_DESIGN.md`
- [x] `AuthenticationStrategy` interface + provider registry — `AuthAdapter` + `AuthRegistry`
- [x] `Principal` and `Session` abstractions — `Principal`, `AnonymousPrincipal`, `Session`, `DefaultSession`
- [x] `@authenticated` and `@authorized(role)` decorators
- [x] Integration: `@ndigo/http` auth-header interceptor — `AuthHeaderInterceptor`
- [x] Integration: `@ndigo/dispatcher` route guard support — `AuthRouteGuard`
- [x] `AuthClient` — client-side auth manager
- [x] `ClientAuthGuard` — client-side route guard
- [x] `OIDCAdapter` — OIDC/OAuth reference implementation
- [x] `JWTAdapter` — JWT validation for `@ndigo/auth-server`

#### 9b. `@ndigo/orm` post-MVP

- [x] Relation decorators: `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`
- [x] Entity lifecycle hooks: `@prePersist`, `@postLoad`, `@preUpdate`, `@postRemove`
- [x] `@transactional` method decorator
- [x] `@ndigo/validate` integration on entity persist — `EntityManager.persist()` calls `entity.validate()` when present
- [x] `@ndigo/orm-drizzle` adapter (ESM-first SQL backing store) — `DrizzleDataSource`, `DrizzleEntityManager`, 5 CRUD tests

---

### Wave 10 — 1.0 Checkpoint (2 weeks)

**Status:** ✅ Complete

- [x] Revisit AD-06 (`@ndigo/factory` scoping split decision) — resolved: no split needed, documented in `docs/decisions/2026-08-22_AD06_FACTORY_SCOPING_SPLIT.md`
- [x] Full architectural audit — no layer violations found
- [x] Documentation completeness pass — all 27 packages now have README.md
- [x] Migration guide: current → 1.0 — `docs/migrations/2026-08-22_MIGRATION_TO_1.0.md`
- [x] Public API stability — `SiteBuilder` marked `@experimental`, `@internal` on factory internals
- [x] Performance benchmark baselines — `like()`, error construction, object merge baselines in `packages/ndigo-core/test/benchmarks/`

---

## Cross-Cutting Workstreams (Parallel)

### CC-3: ESLint Plugin Growth

- [x] Wave 2: `no-browser-globals-in-isomorphic` — done, 14 tests
- [ ] Future: `require-tsdoc-on-public-api`, `enforce-internal-file-naming`

---

## Remaining Work Summary

| Priority | Wave                                                                                   | Area                                                                                      | Effort Estimate |
| -------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| **P1**   | 7                                                                                      | `@ndigo/content` — dynamic content sources, theme composition, negotiation hooks          | ✅ Done         |
| **P1**   | 7                                                                                      | `@ndigo/validate` — group symmetry, error messages                                        | ✅ Done         |
| **Done** | 4.5                                                                                    | Client infra — BrowserRouter, CORS, offline retry, IndexedDB, LocalStorage                | ✅ Done         |
| **Done** | 8                                                                                      | `@ndigo/platform-node` — test coverage + integration                                      | ✅ Done         |
| **Done** | 9a                                                                                     | `@ndigo/auth` — all spec items: decorators, adapters, interceptors, guards                | ✅ Done         |
| **Done** | 9b                                                                                     | `@ndigo/orm` post-MVP — relations, lifecycle hooks, validate integration, drizzle adapter | ✅ Done         |
| **Done** | 10                                                                                     | 1.0 Checkpoint — AD-06, audit, docs, migration guide, benchmarks                          | ✅ Done         |
| **Done** | 7                                                                                      | Context docs (sequence diagrams for refresh/close)                                        | ✅ Done         |
| **Done** | Wave 3 remaining integration tests (view negotiation, redirect, transaction lifecycle) | ✅ Done                                                                                   |

**Legend:** ✅ Complete | 🟢 ≥80% | 🟡 45-80% | 🔴 <45% | ⬜ Not started
