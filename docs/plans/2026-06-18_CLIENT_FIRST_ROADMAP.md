# 2026-06-18 Client-First Roadmap

**Status:** Active  
**Horizon:** 6–12 months (10+ waves)  
**Demo gate:** Every milestone must land a working flow in `blue-demo`  
**Legacy policy:** Port and integrate `.legacy.js` files as modern TypeScript; delete originals

---

## Package Maturity Baseline (2026-06-18)

| Layer              | Package                   | Baseline | Target | Current |
| :----------------- | :------------------------ | :------- | :----- | :------ |
| Integration        | `@blue/util`              | ✅ 100%  | —      | ✅ 100% |
| Integration        | `@blue/parser`            | ✅ 100%  | —      | ✅ 100% |
| Integration        | `@blue/model`             | ✅ 100%  | —      | ✅ 100% |
| Foundation         | `@blue/core`              | ✅ 100%  | —      | ✅ 100% |
| Web Infra          | `@blue/http`              | ✅ 100%  | —      | ✅ 100% |
| Observability      | `@blue/telemetry`         | ✅ 100%  | —      | ✅ 100% |
| Tooling            | `@blue/print`             | ✅ 100%  | —      | ✅ 100% |
| Tooling            | `@blue/eslint-plugin`     | ✅ 100%  | —      | ✅ 100% |
| Context            | `@blue/context`           | 🟡 85%   | 95%    | 🟢 95%  |
| Request Processing | `@blue/dispatcher`        | 🟡 65%   | 90%    | 🟢 90%  |
| Web Infra          | `@blue/router`            | 🟡 50%   | 80%    | 🟡 80%  |
| Infrastructure     | `@blue/content`           | 🟡 45%   | 85%    | 🟡 45%  |
| Application        | `@blue/platform-web`      | 🟡 45%   | 90%    | 🟢 85%  |
| Request Processing | `@blue/view`              | 🟡 40%   | 85%    | 🟢 85%  |
| Bootstrap          | `@blue/boot`              | 🟡 40%   | 85%    | 🟢 85%  |
| Infrastructure     | `@blue/validate`          | 🟡 adv.  | 90%    | 🟢 90%  |
| Infrastructure     | `@blue/factory`           | 🟡 adv.  | 90%    | 🟡 adv. |
| Application        | `@blue/service`           | 🟡 30%   | 80%    | 🟢 80%  |
| Request Processing | `@blue/view-webcomponent` | 🟡 25%   | 80%    | 🟢 80%  |
| Application        | `@blue/domain`            | 🔴 15%   | 75%    | 🟢 75%  |
| Persistence        | `@blue/orm`               | 🟡 MVP   | 70%    | 🟡 MVP  |
| Application        | `@blue/auth`              | ⬜ 0%    | MVP    | ⬜ 0%   |
| Platform           | `@blue/platform-node`     | ⬜ 0%    | MVP    | 🟡 MVP  |
| Demo               | `blue-demo`               | 🟡 core  | Full   | 🟡 core |

---

## Wave Plan

### Wave 1 — Foundation Cleanup (1–2 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] Delete `packages/blue-util/bench/like.test.ts` (obsolete benchmark variant)
- [x] Delete `packages/blue-util/src/type/_like-is.ts` (merged into `like.ts`)
- [x] Delete `packages/blue-context/src/event-emitter.old.ts.txt` (superseded)
- [x] Audit all `.legacy.js` files → ported or deleted in Wave 4
- [x] Verify `pnpm build && pnpm test && pnpm lint` clean

**Not applicable / deferred:**
- pnpm 11 upgrade completed before roadmap was written; no `ERR_PNPM_IGNORED_BUILDS` present
- `blue-view/test/*.js` — no such files exist
- Migration doc naming — low priority cosmetic

---

### Wave 2 — Isomorphic Core Audit (2 weeks)

**Status:** ✅ Complete (pre-existing + OXC Phase 1)

- [x] Scan isomorphic packages for browser globals — clean
- [x] Fix `RerouteView._renderView` — `history.pushState` is guarded with `typeof history` and prefers `router.navigate()`
- [x] Move `HashRouter` to `@blue/platform-web` — already done, not exported from `@blue/router`
- [x] Create `FileSystemRouter` stub in `@blue/platform-node` — exists with navigate/refresh
- [x] Add `no-browser-globals-in-isomorphic` lint rule — done, 14 tests pass
- [x] Verify isomorphic packages build without DOM lib — clean

---

### Wave 3 — Stabilize Runtime Path (3–4 weeks)

**Status:** ✅ Substantially complete (this session)

- [x] `@blue/view`: `StringTemplateView` extends `AbstractTemplateView`, `_projectViewModel` hook, 18 tests including end-to-end `view.render()` pipeline
- [x] `@blue/view-webcomponent`: `TagMapping`/`ViewMapping` decorators, `DOMElementViewTarget`, `WebComponentViewEngine`, 63 tests
- [x] `@blue/dispatcher`: AD-8 `HandlerInterceptor` lifecycle (`interceptorIndex`, `preHandle`/`postHandle`/`completeHandle`), error view dispatch tests
- [x] `@blue/router`: `TransactionManager` + `DefaultRouteTransactionManager` + `DefaultRouteTransactionStatus` — 5 tests
- [x] `@blue/platform-web`: 5 argument resolvers wired in `configure-argument-resolvers.ts`, 117 tests

**Remaining:**
- View negotiation flow (media type → resolver → view → render) — partially tested
- `RerouteView` redirect handling end-to-end test
- `TransactionManager` commit/rollback integration test

---

### Wave 4 — Service Layer Boundary (2–3 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] All legacy interceptors ported to `@blue/http/interceptors/` — `header`, `error-normalization`, `cache`, `retry`, `status`, `app-reset`
- [x] `offline-interceptor` in `@blue/platform-web`
- [x] All `.legacy.js` files deleted from `blue-service/` and `blue-http/`
- [x] `@blue/service`: service registry, telemetry hooks, request-id correlation — 33 tests

---

### Wave 4.5 — Client-Side Infrastructure (2–3 weeks)

**Status:** 🟡 Partially complete (pre-existing)

- [x] `CacheInterceptor` — response caching with TTL, cache-busting (fixed LRU eviction this session)
- [x] `OfflineDetector` — `offline-interceptor.ts` exists
- [x] `HashRouter` — exists in `@blue/platform-web`

**Open:**
- [ ] `IndexedDBResourceLoader`
- [ ] `LocalStorageResourceLoader`
- [ ] `ServiceWorkerRegistration`
- [ ] `CacheStorageManager`
- [ ] `BrowserRouter` (History API)
- [ ] `CORSInterceptor`
- [ ] `RetryOnOfflineInterceptor`

---

### Wave 5 — Domain/Model Reconciliation (3 weeks)

**Status:** ✅ Complete (pre-existing work)

- [x] `GenericDomainComponent.validate()` via `@blue/validate` integration
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

**`@blue/context` (~85% → 95%) ✅**

- [x] Finalize tree event propagation edge cases — 6 new tests covering root bubble, leaf broadcast, deep bubble chains, close on never-refreshed context, removeChild miss, repeated close no-op
- [x] Cover remaining branch paths in tests — 158 total

**Open:**
- [x] Document refresh/close semantics with sequence diagrams — `docs/reference/2026-08-22_CONTEXT_LIFECYCLE.md`

**`@blue/content` (~45% → 85%) — OPEN**

- [ ] Dynamic content sources (async loading, TTL-based caching)
- [ ] Theme composition (multiple theme sources merged in priority order)
- [ ] Content negotiation hooks for dispatcher integration

**`@blue/validate` — COMPLETE** ✅

- [x] Finalize group-aware decorator symmetry between `native` and `zod` backends — `@validated` now accepts `backend` option; groups are preserved through `createConstraintDecorator`; both backends use the same group filtering
- [x] Improve error message formatting and i18n-readiness — `formatErrorMessage()` includes rejected value; `setErrorMessageFormatter()` for custom/i18n formatting

---

### Wave 8 — Platform Expansion: `@blue/platform-node` (3–4 weeks)

**Status:** 🟡 MVP complete (pre-existing)

- [x] Package exists at `packages/blue-platform-node/`
- [x] `NodeEnvironment` — implements `Environment` interface
- [x] `NodeArgumentResolvers`: body, header, query, path, cookie, session
- [x] `FileSystemResourceLoader`
- [x] `NodeAutoConfiguration` with `@ConditionalOnNode` metadata
- [x] `FileSystemRouter` stub
- [x] Build and lint config matching existing platform package patterns

**Open:**
- [ ] Full unit + integration test coverage
- [ ] `NodeAutoConfiguration` — verify all 6 resolvers functional

---

### Wave 9 — Ecosystem Packages (4–6 weeks)

**Status:** ⬜ Not started

#### 9a. `@blue/auth` (new package)
- [ ] Spec doc
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

---

### Wave 10 — 1.0 Checkpoint (2 weeks)

**Status:** ⬜ Not started

- [ ] Revisit AD-6 (`@blue/factory` scoping split decision)
- [ ] Full architectural audit
- [ ] Security review
- [ ] Documentation completeness pass
- [ ] Migration guide: current state → 1.0
- [ ] Public API stability commitment
- [ ] Performance benchmark baselines

---

## Cross-Cutting Workstreams (Parallel)

### CC-3: ESLint Plugin Growth

- [x] Wave 2: `no-browser-globals-in-isomorphic` — done, 14 tests
- [ ] Future: `require-tsdoc-on-public-api`, `enforce-internal-file-naming`

---

## Remaining Work Summary

| Priority | Wave | Area | Effort Estimate |
|----------|------|------|----------------|
| **P1** | 7 | `@blue/content` — dynamic content sources, theme composition, negotiation hooks | 3-4 days |
| **P1** | 7 | `@blue/validate` — group symmetry, error messages | ✅ Done |
| **P2** | 4.5 | Client infra — IndexedDB, LocalStorage, SW registration, BrowserRouter, CORS, offline retry | 2-3 weeks |
| **P2** | 8 | `@blue/platform-node` test coverage + integration verification | 1-2 days |
| **P3** | 9a | `@blue/auth` — new package, greenfield | 4-6 weeks |
| **P3** | 9b | `@blue/orm` post-MVP — relations, lifecycle hooks, validate integration | 4-6 weeks |
| **P4** | 10 | 1.0 Checkpoint — audit, security, docs, benchmarks | 2 weeks |
| **Done** | 7 | Context docs (sequence diagrams for refresh/close) | ✅ Done |
| **Ongoing** | 3 | Remaining integration tests (view negotiation, redirect, transaction lifecycle) | 1 day |

**Legend:** ✅ Complete | 🟢 ≥80% | 🟡 45-80% | 🔴 <45% | ⬜ Not started