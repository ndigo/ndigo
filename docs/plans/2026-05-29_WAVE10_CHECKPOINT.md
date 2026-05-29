# 2026-05-29 Wave 10 — 1.0 Checkpoint

**Status:** Active  
**Horizon:** 1–2 weeks  
**Goal:** Final polish, API stability commitment, and documentation completeness before the 1.0 release.

No new features. Wave 10 is exclusively about quality, clarity, and public API surface commitment.

---

## Context

Waves 1–9 are complete and committed. The full package matrix is now:

| Package                  | Completed In | Status       |
| :----------------------- | :----------- | :----------- |
| `@blue/util`             | pre-Wave 1   | ✅ Stable     |
| `@blue/parser`           | pre-Wave 1   | ✅ Stable     |
| `@blue/model`            | pre-Wave 1   | ✅ Stable     |
| `@blue/core`             | pre-Wave 1   | ✅ Stable     |
| `@blue/http`             | pre-Wave 1   | ✅ Stable     |
| `@blue/telemetry`        | pre-Wave 1   | ✅ Stable     |
| `@blue/print`            | pre-Wave 1   | ✅ Stable     |
| `@blue/eslint-plugin`    | Wave 2       | ✅ Stable     |
| `@blue/context`          | Wave 7       | ✅ Stable     |
| `@blue/validate`         | Wave 5/7     | ✅ Stable     |
| `@blue/content`          | Wave 7       | ✅ Stable     |
| `@blue/factory`          | Wave 5       | ✅ Stable     |
| `@blue/domain`           | Wave 5       | 🟡 Advancing  |
| `@blue/dispatcher`       | Wave 3/8     | 🟡 Advancing  |
| `@blue/router`           | Wave 3       | 🟡 Advancing  |
| `@blue/view`             | Wave 3       | 🟡 Advancing  |
| `@blue/view-webcomponent`| Wave 3       | 🟡 Advancing  |
| `@blue/boot`             | Wave 6       | 🟡 Advancing  |
| `@blue/service`          | Wave 4       | 🟡 Advancing  |
| `@blue/platform-web`     | Wave 3       | 🟡 Advancing  |
| `@blue/platform-node`    | Wave 8       | ✅ MVP        |
| `@blue/orm`              | Wave 9       | 🟡 Advancing  |
| `@blue/auth`             | Wave 9       | ✅ MVP        |
| `blue-demo-node`         | Wave 8/9     | ✅ Functional  |

---

## Architecture Decisions Revisited

### AD-6 — `@blue/factory` Scoping Split (Deferred)

**Review findings:** The `Scope` interface and `ScopedFactory` interface are clean, well-bounded abstractions already present in `scope.ts`. The concrete scope implementations (`SingletonScope`, `HashScope`, `PrototypeScope`) are implementation details. A future split could expose only the interfaces in a core module while keeping the concrete implementations in a separate package.

**1.0 Decision:** **Keep deferred.** No non-scoped consumers have emerged. The integration point is documented via `@internal` JSDoc annotations on the concrete scope classes.

**Revisit trigger:** When a consumer requires factory behaviour without scope semantics (e.g., a DI container that only uses `prototype` scope).

---

## Wave 10 Tasks

### 10a. API Stability Markers

Mark clearly unstable / forward-looking APIs so consumers know what to trust.

**`@experimental` to add:**
- `@transactional()` decorator in `@blue/orm` — stores metadata but no `TransactionManager` enforces it yet; will be functional when `@blue/orm-drizzle` or `@blue/orm-sqlite` lands
- `UnitOfWork` / `InMemoryUnitOfWork` in `@blue/orm` — fully implemented but not wired into any auto-configuration; opt-in only for now

**Already marked `@experimental`:**
- `SiteBuilder` in `@blue/boot` — multi-app composition deferred to post-1.0 (AD-3)

**`@internal` to add:**
- Concrete scope implementations in `@blue/factory`: `SingletonScope`, `HashScope`, `PrototypeScope` — expose only the `Scope` and `ScopedFactory` interfaces in the stable API

---

### 10b. TSDoc Completeness Pass

Add missing TSDoc to all public API functions in packages that lack it.

**Priority targets:**
- `@blue/orm/src/decorators.ts` — relation decorators and lifecycle decorators lack TSDoc
- `@blue/auth/src/_decorators.ts` — already has TSDoc ✅
- `@blue/platform-node/src/` — auto-configuration and resolvers already have TSDoc ✅

---

### 10c. README Documentation

New Wave 8/9 packages need README files:

**Missing READMEs:**
- `@blue/auth` — new in Wave 9; no README
- `@blue/platform-node` — new in Wave 8; no README

---

### 10d. Migration Guide

Write `docs/migrations/2026-05-29_V1_MIGRATION.md` covering all breaking changes and major additions across Waves 1–10 for teams upgrading from pre-Wave-1 baseline.

---

### 10e. Performance Benchmark Baselines

Extend the Vitest bench suite beyond `@blue/util` to cover hot paths in the dispatcher and router.

**New bench files:**
- `packages/blue-dispatcher/bench/routing.bench.ts` — `MetadataHandlerMapping.getHandler()` route resolution throughput
- `packages/blue-router/bench/matching.bench.ts` — `RouteMatcher.match()` throughput for static vs. parameterised paths

---

## Demo Gate

`blue-demo-node` already demonstrates:
- ✅ `POST /auth/login` — `AuthenticationManager` with username/password strategy, returns Bearer token
- ✅ `GET /notes` — Bearer-token-protected, returns all notes from `InMemoryEntityManager`
- ✅ `POST /notes` — Bearer-token-protected, creates a `Note` with `@prePersist` lifecycle hook

**Wave 10 addition:** Update demo to show correct `@authenticated` usage pattern with a comment explaining the production vs. demo difference.

---

## Acceptance Criteria

- [ ] `pnpm build` — 26 packages, 0 errors
- [ ] `pnpm lint` — 0 errors, 0 warnings
- [ ] `pnpm test` — all Wave 9 tests passing (254+)
- [ ] `@experimental` tags on `@transactional`, `UnitOfWork`/`InMemoryUnitOfWork`
- [ ] `@internal` tags on concrete scope implementations in `@blue/factory`
- [ ] TSDoc on all public relation/lifecycle/transactional decorators in `@blue/orm`
- [ ] README for `@blue/auth`
- [ ] README for `@blue/platform-node`
- [ ] Migration guide committed to `docs/migrations/`
- [ ] Bench file committed to `packages/blue-dispatcher/bench/`

---

## References

- [Feature Completeness Roadmap](2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md)
- [Auth Design](2026-05-28_AUTH_DESIGN.md)
- [ORM MVP Design](2026-03-30_ORM_MVP.md)
- [Architecture](../../ARCHITECTURE.md)
