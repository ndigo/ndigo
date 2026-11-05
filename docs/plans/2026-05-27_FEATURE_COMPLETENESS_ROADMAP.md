# 2026-05-27 Feature Completeness Roadmap

**Status:** Active  
**Horizon:** 6–12 months (10 waves)  
**Demo gate:** Every milestone must land a working flow in `ndigo-demo`  
**Legacy policy:** Port and integrate `.legacy.js` files as modern TypeScript; delete originals

---

## Locked Architectural Decisions

The following six decisions were ratified on 2026-05-27 and govern all subsequent wave work.

### AD-01: `@ndigo/http` vs `@ndigo/service` Boundary

**Decision:** Push CSRF, retry, error normalization, cache, and offline-detection into `@ndigo/http` as
interceptors. `@ndigo/service` remains a thin domain-aware façade: service registry, service-call telemetry,
request-id correlation, and app-reset coordination.

**Rationale:** `@ndigo/http` already has a mature interceptor + transform pipeline. The legacy service
interceptors (`header`, `error`, `cache`, `retryOnError`, `offline`, `status`, `appReset`) are HTTP
cross-cutting concerns, not business logic.

**Affects:** Wave 4.

---

### AD-02: `@ndigo/domain` vs `@ndigo/model` Reconciliation

**Decision:** `@ndigo/domain` is an optional MVVM layer that depends on `@ndigo/model` for validation and
`@ndigo/context` for event emission. `@ndigo/model` stays pure (validation/data shape). A domain component is
"model + actions + lifecycle." For Web Components, view-models project from domain. Future adapters (React,
Lit) back against the same domain component.

**Rationale:** `GenericDomainComponent.validate()` throws `Method not implemented`—it explicitly awaits this
decision. Reusing `@ndigo/model` avoids duplicating constraint logic.

**Affects:** Wave 5.

---

### AD-03: Minimal Viable `Site` Model

**Decision:** Defer `Site` to post-1.0. Ship a single-`Application` model first. `SiteBuilder` remains in
`@ndigo/boot` marked `@experimental` but is not on the critical path.

**Rationale:** History shows one main app accumulated all complexity. YAGNI applies.

**Affects:** Wave 6 (scoped down).

---

### AD-04: Browser-Only Code → `@ndigo/platform-web`

**Decision:** Audit and migrate browser-only globals (`window`, `document`, `navigator`, `HTMLElement`,
`history`) from isomorphic-core packages (`@ndigo/router`, `@ndigo/dispatcher`, `@ndigo/view`,
`@ndigo/context`, `@ndigo/content`) into `@ndigo/platform-web`. Enforce via a new
`@ndigo/eslint-plugin/no-browser-globals-in-isomorphic` rule.

**Rationale:** Isomorphic core principle from architecture roadmap §1.

**Affects:** Wave 2.

---

### AD-05: `@ndigo/platform-node` MVP Scope

**Decision:** MVP includes: server environment binding, Node-side request/response argument resolvers,
server-side cookie/session adapters, and file-system resource loader. Excludes: server-side rendering of
Web Components (deferred to future view adapters) and database concerns (`@ndigo/orm` handles).

**Rationale:** Mirrors `@ndigo/platform-web` symmetry; smallest viable enabler for hybrid deployment.

**Affects:** Wave 8.

---

### AD-06: `@ndigo/factory` Scoping Split

**Decision:** Defer. Leave scoped factory integrated until real non-scoped consumers emerge. Document the
integration point. Revisit at 1.0 checkpoint.

**Rationale:** Premature abstraction risk.

**Affects:** Wave 10 checkpoint only.

---

## Package Maturity Baseline (2026-05-27)

| Layer              | Package                    | Baseline | Target |
| :----------------- | :------------------------- | :------- | :----- |
| Integration        | `@ndigo/util`              | ✅ 100%  | —      |
| Integration        | `@ndigo/parser`            | ✅ 100%  | —      |
| Integration        | `@ndigo/model`             | ✅ 100%  | —      |
| Foundation         | `@ndigo/core`              | ✅ 100%  | —      |
| Web Infra          | `@ndigo/http`              | ✅ 100%  | —      |
| Observability      | `@ndigo/telemetry`         | ✅ 100%  | —      |
| Tooling            | `@ndigo/print`             | ✅ 100%  | —      |
| Tooling            | `@ndigo/eslint-plugin`     | ✅ 100%  | —      |
| Context            | `@ndigo/context`           | 🟡 85%   | 95%    |
| Request Processing | `@ndigo/dispatcher`        | 🟡 65%   | 90%    |
| Web Infra          | `@ndigo/router`            | 🟡 50%   | 80%    |
| Infrastructure     | `@ndigo/content`           | 🟡 45%   | 85%    |
| Application        | `@ndigo/platform-web`      | 🟡 45%   | 90%    |
| Request Processing | `@ndigo/view`              | 🟡 40%   | 85%    |
| Bootstrap          | `@ndigo/boot`              | 🟡 40%   | 85%    |
| Infrastructure     | `@ndigo/validate`          | 🟡 adv.  | 90%    |
| Infrastructure     | `@ndigo/factory`           | 🟡 adv.  | 90%    |
| Application        | `@ndigo/service`           | 🟡 30%   | 80%    |
| Request Processing | `@ndigo/view-webcomponent` | 🟡 25%   | 80%    |
| Application        | `@ndigo/domain`            | 🔴 15%   | 75%    |
| Persistence        | `@ndigo/orm`               | 🟡 MVP   | 70%    |
| Application        | `@ndigo/auth`              | ⬜ 0%    | MVP    |
| Platform           | `@ndigo/platform-node`     | ⬜ 0%    | MVP    |
| Demo               | `ndigo-demo`               | 🟡 core  | Full   |

---

## Wave Plan

### Wave 1 — Foundation Cleanup (1–2 weeks)

**Goal:** Remove legacy debt, lock conventions, finish pnpm 11 migration.

#### Tasks

- [ ] Complete pnpm 11 upgrade (resolve `ERR_PNPM_IGNORED_BUILDS` via `pnpm approve-builds`)
- [ ] Rename `2025-05-27_PNPM_9_UPGRADE.md` → `2026-05-27_PNPM_11_UPGRADE.md` with full content update
- [ ] Delete `packages/ndigo-util/bench/like.test.ts` (obsolete benchmark variant)
- [ ] Delete `packages/ndigo-util/src/type/_like-is.ts` (merged into `like.ts`)
- [ ] Delete `packages/ndigo-context/src/event-emitter.old.ts.txt` (superseded)
- [ ] Audit and delete `ndigo-view/test/*.js` (Chai/Mocha shared spec factories; not referenced by any `.spec.ts`)
- [ ] Audit all 9 `.legacy.js` files → produce port-or-delete decisions in Wave 4 spec
- [ ] Verify `pnpm build && pnpm test && pnpm lint` clean

**Demo gate:** Existing demo still runs.

#### Legacy File Inventory

| File                       | Location                         | Decision                                |
| :------------------------- | :------------------------------- | :-------------------------------------- |
| `old-service.legacy.js`    | `ndigo-service/src/`             | Port in Wave 4                          |
| `appReset.legacy.js`       | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `cache.legacy.js`          | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `error.legacy.js`          | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `header.legacy.js`         | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `offline.legacy.js`        | `ndigo-service/src/interceptor/` | Port to `@ndigo/platform-web` in Wave 4 |
| `retryOnError.legacy.js`   | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `status.legacy.js`         | `ndigo-service/src/interceptor/` | Port to `@ndigo/http` in Wave 4         |
| `old-http.legacy.js`       | `ndigo-http/src/`                | Read → document what's superseded       |
| `old-fetch.legacy.js`      | `ndigo-http/src/`                | Read → document what's superseded       |
| `old-component.legacy.js`  | `ndigo-domain/src/`              | Port in Wave 5                          |
| `event-emitter.old.ts.txt` | `ndigo-context/src/`             | Delete (event-emitter.ts supersedes it) |

---

### Wave 2 — Isomorphic Core Audit (2 weeks)

**Goal:** Apply AD-04. Enforce browser-only code boundary.

#### Tasks

- [ ] Scan `@ndigo/router`, `@ndigo/dispatcher`, `@ndigo/view`, `@ndigo/context`, `@ndigo/content` for
      `window`, `document`, `navigator`, `HTMLElement`, `history`, `location`
- [ ] Migrate each offending usage: move to `@ndigo/platform-web` or behind an abstraction
- [ ] Fix `RerouteView._renderView` in `@ndigo/view` — replace `history.pushState` with router integration
- [ ] Add `no-browser-globals-in-isomorphic` lint rule to `@ndigo/eslint-plugin` for isomorphic-core packages
- [ ] Verify isomorphic packages build cleanly without `"lib": ["DOM"]` in tsconfig

**Demo gate:** Demo unchanged; new lint rule passes cleanly.

---

### Wave 3 — Stabilize Runtime Path (3–4 weeks)

**Goal:** Complete the dispatcher → view-webcomponent → platform-web integration path (roadmap §8, priority 1).

#### Tasks

**`@ndigo/view` (~40% → 85%)**

- [ ] Implement rendering for `AbstractTemplateView` subclass (non-DOM template rendering)
- [ ] Add view model projection hooks
- [ ] Integration tests: `view.render()` end-to-end

**`@ndigo/view-webcomponent` (~25% → 80%)**

- [ ] Complete view registration/discovery helpers (tag mapping to custom element registry)
- [ ] Finalize public export surface (`index.ts`)
- [ ] Integration tests: `WebComponentViewEngine.render()` into a real `DOMElementViewTarget`

**`@ndigo/dispatcher` (~65% → 90%)**

- [ ] Complete view negotiation flow (media type → resolver → view → render)
- [ ] Error view dispatch (configurable error route)
- [ ] Redirect handling via `RerouteView`

**`@ndigo/router` (~50% → 80%)**

- [ ] Complete `TransactionManager` (route transaction commit/rollback)
- [ ] Document deferred features (named routes, route generation)

**`@ndigo/platform-web` (~45% → 80%)**

- [ ] Wire all argument resolvers into `configure-argument-resolvers.ts`
- [ ] Integration tests covering each resolver

**Demo gate:** `ndigo-demo` navigates between ≥3 routes, each rendering distinct Web Component views,
with correct transaction lifecycle (start → commit/rollback).

---

### Wave 4 — Service Layer Boundary (2–3 weeks)

**Goal:** Apply AD-01. Port legacy service interceptors into `@ndigo/http` and `@ndigo/platform-web`.

#### Tasks

**Port to `@ndigo/http/interceptor/`**

- [ ] `header.legacy.js` → `header.ts` (CSRF token, channel-id, client-request-id headers)
- [ ] `error.legacy.js` → `error-normalization.ts` (standardise error shape from HTTP responses)
- [ ] `cache.legacy.js` → `cache.ts` (response caching strategy)
- [ ] `retryOnError.legacy.js` → `retry.ts` (configurable retry with backoff)
- [ ] `status.legacy.js` → `status.ts` (HTTP status code normalisation)
- [ ] `appReset.legacy.js` → `app-reset.ts` (application reset on specific status codes)

**Port to `@ndigo/platform-web/`**

- [ ] `offline.legacy.js` → `offline-interceptor.ts` (browser offline detection)

**`@ndigo/service` (30% → 80%)**

- [ ] Keep existing `app-reset-interceptor.ts`
- [ ] Add service registry (maps service tokens to HTTP endpoints)
- [ ] Add telemetry hooks (emit span per service call via `@ndigo/telemetry`)
- [ ] Add request-id correlation header injection
- [ ] Audit and document `old-service.legacy.js`; extract any remaining concerns

**Cleanup**

- [ ] Delete all `.legacy.js` files from `ndigo-service/src/` and `ndigo-http/src/`

**Demo gate:** Demo makes an HTTP call with CSRF header, retry, and telemetry trace correlation visible
in console/OTel span.

---

### Wave 5 — Domain/Model Reconciliation (3 weeks)

**Goal:** Apply AD-02. Bring `@ndigo/domain` to production-ready state.

#### Tasks

- [ ] Implement `GenericDomainComponent.validate()` via `@ndigo/validate` integration
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

### Wave 6 — Boot & Auto-Configuration (2 weeks)

**Goal:** Apply AD-03 (single-app focus). Complete `@ndigo/boot` lifecycle.

#### Tasks

- [ ] `ApplicationBuilder`: finish web auto-configuration; document all extension points
- [ ] `Application.run()`: complete lifecycle (init → start → ready → close → destroy)
- [ ] `Application`: expose lifecycle event hooks (for telemetry, testing)
- [ ] Mark `SiteBuilder` as `@experimental` with clear documentation; remove from primary docs
- [ ] Integration tests covering full boot and controlled shutdown
- [ ] Update `web-auto-configuration.ts` to wire Wave 3–5 packages automatically

**Demo gate:** `ndigo-demo` boots entirely via `ApplicationBuilder` with declarative configuration;
no manual wiring required in demo source.

---

### Wave 7 — Content, Validate, Context Polish (2 weeks)

**Goal:** Bring mid-tier packages to 85%+.

#### Tasks

**`@ndigo/content` (~45% → 85%)**

- [ ] Dynamic content sources (async loading, TTL-based caching)
- [ ] Theme composition (multiple theme sources merged in priority order)
- [ ] Content negotiation hooks for dispatcher integration

**`@ndigo/validate`**

- [ ] Finalize group-aware decorator symmetry between `native` and `zod` backends
- [ ] Add `@ndigo/orm` integration: validate on entity persist
- [ ] Improve error message formatting and i18n-readiness

**`@ndigo/context` (~85% → 95%)**

- [ ] Finalize tree event propagation edge cases (parent/child context event bubbling)
- [ ] Document refresh/close semantics with sequence diagrams
- [ ] Cover remaining branch paths in tests

**Demo gate:** Demo uses content negotiation for localised strings, validates a form route input,
and demonstrates context refresh on navigation.

---

### Wave 8 — Platform Expansion: `@ndigo/platform-node` (3–4 weeks)

**Goal:** Apply AD-05. Enable hybrid (browser + Node) deployment topology.

#### Tasks

- [ ] Create new package `packages/ndigo-platform-node/`
- [ ] `NodeEnvironment`: implements `Environment` interface (process.env binding)
- [ ] `NodeArgumentResolvers`: body, header, query, path argument resolvers for Node HTTP
- [ ] `NodeCookieArgumentResolver`: server-side cookie parsing
- [ ] `NodeSessionArgumentResolver`: server-side session abstraction
- [ ] `FileSystemResourceLoader`: loads resource files from disk (implements `@ndigo/context` resource contract)
- [ ] Argument resolver auto-configuration helper (mirrors `@ndigo/platform-web` pattern)
- [ ] Full unit + integration test coverage
- [ ] Build and lint config matching existing platform package patterns

**Demo gate:** New `ndigo-demo-node` example (or `ndigo-demo` `--node` flag) runs the dispatch pipeline
server-side in Node, rendering a route and returning the view model as JSON.

---

### Wave 9 — Ecosystem Packages (4–6 weeks)

#### 9a. `@ndigo/auth` (new package)

- [ ] Spec doc: `docs/plans/YYYY-MM-DD_AUTH_DESIGN.md`
- [ ] `AuthenticationStrategy` interface + provider registry
- [ ] `Principal` and `Session` abstractions
- [ ] `@authenticated` and `@authorized(role)` decorators
- [ ] Integration: `@ndigo/http` auth-header interceptor
- [ ] Integration: `@ndigo/dispatcher` route guard support

#### 9b. `@ndigo/orm` post-MVP

- [ ] Relation decorators: `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`
- [ ] Entity lifecycle hooks: `@prePersist`, `@postLoad`, `@preUpdate`, `@postRemove`
- [ ] `@transactional` method decorator
- [ ] `@ndigo/validate` integration on entity persist
- [ ] `@ndigo/orm-drizzle` adapter (ESM-first SQL backing store)

**Demo gate:** Demo has a login flow (via `@ndigo/auth`) and a persisted entity round-trip
(via `@ndigo/orm` + drizzle adapter).

---

### Wave 10 — 1.0 Checkpoint (2 weeks)

**Goal:** Final polish, audit, and public API stability commitment.

#### Tasks

- [ ] Revisit AD-06 (`@ndigo/factory` scoping split decision)
- [ ] Full architectural audit (architecture-reviewer)
- [ ] Security review (security-reviewer)
- [ ] Documentation completeness pass (all packages have README + TSDoc on public APIs)
- [ ] Migration guide: current state → 1.0
- [ ] Public API stability commitment (mark unstable APIs `@experimental` or `@internal`)
- [ ] Performance benchmark baselines (Vitest bench suite covering hot paths)

**Demo gate:** `ndigo-demo` demonstrates the full feature surface across all completed waves.

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

| Risk                                           | Likelihood | Impact | Mitigation                                         |
| :--------------------------------------------- | :--------- | :----- | :------------------------------------------------- |
| Legacy port loses subtle behavior              | High       | Medium | Write characterization tests before porting        |
| Architectural decision proves wrong mid-wave   | Medium     | High   | ADR per decision; explicit reversal record allowed |
| Demo integration drift                         | High       | Medium | Demo is wave acceptance gate (enforced)            |
| Wave 8 platform-node scope creep               | Medium     | Medium | Hold strict MVP line per AD-05                     |
| Wave 5 domain blocked on view-engine ambiguity | Medium     | High   | AD-02 locked before Wave 5 starts                  |
| pnpm 11 build approval friction recurring      | Low        | Low    | One-time `pnpm approve-builds` resolves            |

---

## References

- [Architecture Roadmap](../reference/2026-03-08_ARCHITECTURE_ROADMAP.md)
- [Package Roadmap](2026-03-08_PACKAGE_ROADMAP.md)
- [pnpm 11 Migration](../migrations/2026-05-27_PNPM_11_UPGRADE.md)
- [ORM MVP Design](2026-03-30_ORM_MVP.md)
- [View Event Architecture](2026-03-22_VIEW_EVENT_ARCHITECTURE.md)
- [Scale 2 Context + Routing Architecture](2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md)
