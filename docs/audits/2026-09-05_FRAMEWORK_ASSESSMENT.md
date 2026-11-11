# Framework Assessment Audit

**Date:** 2026-09-05
**Scope:** All 32 framework packages (`packages/ndigo-*`) + demo apps, evaluated for feature completeness, redundancy, package-purpose clarity, "one way to solve a use case" (anti-pattern avoidance), and semantic paradigm enforcement.
**Method:** Graft graph orientation + direct source review of package indexes, consumer graphs, event/reactive surfaces, and `FrameworkError`-subclass throw sites.

## Executive Summary

The framework's layering is sound and its core web stack (core → factory/context → router/dispatcher → view → platform adapters) is coherent with clear package boundaries. The weaknesses are concentrated in (a) **two competing validation systems**, (b) **three overlapping reactive/event surfaces with no documented decision rule**, (c) **several app-facing public APIs that are incomplete or unproven**, and (d) **paradigm selection is not semantically enforced** — unlike lifecycle/state misuse, which is.

A package having _no framework-internal consumer is not, by itself, a defect_: it may be an app-facing public API. This audit classifies each package accordingly and applies the two app-facing scrutiny questions from the review request:

1. Does the package fulfill an application need?
2. Does it interact cohesively with other public APIs (rather than duplicating or undercutting them)?

It also accepts the second framing: a public API that "meets most needs" is legitimate even when edge cases require dropping to an underlying package (e.g. `ndigo-service` over `ndigo-http`).

## Package classification

| Package                                                                                                              | Kind                            | External consumers | Notes                               |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------ | ----------------------------------- |
| `ndigo-core`, `ndigo-util`, `ndigo-parser`, `ndigo-factory`, `ndigo-context`                                         | framework-internal (foundation) | many               | ✅                                  |
| `ndigo-router` (81), `ndigo-dispatcher` (51), `ndigo-view` (19), `ndigo-view-webcomponent` (13), `ndigo-content` (5) | framework-internal (web)        | many               | ✅                                  |
| `ndigo-http`                                                                                                         | both (framework + app)          | many               | ✅                                  |
| `ndigo-platform-node`, `ndigo-platform-web`                                                                          | both (adapters)                 | many               | ✅                                  |
| `ndigo-auth-core`, `ndigo-auth-client`, `ndigo-auth-server`                                                          | app-facing (public API)         | app consumers      | ✅ fail-closed, reviewed previously |
| `ndigo-telemetry`, `ndigo-telemetry-node`, `ndigo-telemetry-web`                                                     | app-facing                      | app consumers      | ✅                                  |
| `ndigo-boot`, `ndigo-generators`, `ndigo-eslint-plugin`, `ndigo-test`                                                | developer tooling               | n/a                | ✅                                  |
| `ndigo-signals`                                                                                                      | **app-facing public API**       | 2 (`ndigo-todo`)   | ⚠️ see R1                           |
| `ndigo-model`                                                                                                        | **app-facing public API**       | 1 (`ndigo-domain`) | ⚠️ see R2                           |
| `ndigo-validate`                                                                                                     | app-facing public API           | 2                  | ✅ (first-party validation)         |
| ~~`ndigo-domain`~~ (archived)                                                                                        | former public API               | 0                  | ✅ M1 — archived 2026-09-05         |
| `ndigo-service`                                                                                                      | app-facing public API           | 0                  | ⚠️ see R3                           |
| `ndigo-orm`                                                                                                          | app-facing public API           | 2 (`ndigo-api`)    | ⚠️ see M2                           |
| `ndigo-orm-drizzle`                                                                                                  | app-facing public API           | 0                  | ⚠️ see M3                           |
| `ndigo-management`                                                                                                   | app-facing public API           | 0                  | ✅ see note                         |

## Findings

### Redundancies

**R1 — Three reactive/event surfaces with no decision rule (the primary concern).** ✅ _RESOLVED 2026-09-05_

- `@ndigo/signals` — reactive state (`signal`/`computed`/`effect`), a re-export of `@preact/signals-core` plus a ndigo decorator API.
- `@ndigo/context` `EventEmitter` — cascading pub/sub application events (`:`-hierarchy, `AsConditionalEventEmitter`/`AsPositionalEventEmitter` mixins).
- `@ndigo/model` `EventModel`/`asMinimalEventEmitter` — a third, hand-rolled minimal emitter (`event.ts`). **Deleted 2026-09-05** — it was dead code (zero production consumers) and a legacy pre-signals conflation of validation + change-observation. The decision rule is documented in `ARCHITECTURE.md` (Paradigm Selection Rules): signals for local derived state, `EventEmitter` for cross-component events, reactive models via `@ndigo/signals`' `@reactive`/`@signal` with validation layered on.

`apps/ndigo-todo` uses both `@ndigo/signals` (item state in `todo-service.ts`) and the context emitter (controllers) — now with a documented boundary.

**R2 — Two validation systems: `ndigo-model` vs `ndigo-validate`.** ✅ _RESOLVED 2026-09-05 → AD-07 executed_

Corrected: `ndigo-validate` is the _legacy_ constraint/decorator system; `ndigo-model`/objectmodel was the intended modernization that never landed. **Both deleted**; `ndigo-orm` derives Zod schemas from `@entity`/`@column` metadata; `ndigo-dispatcher` route params are Zod-backed (and `ndigo-domain` — archived 2026-09-05 — had been migrated to Zod before archiving).

**R3 — `ndigo-service` duplicates `ndigo-http`'s interceptor pattern (not a full redundancy).** ✅ _RESOLVED 2026-09-05 → AD-08_

Corrected from the initial read: `ndigo-service` is a _typed service client_ (`Service.call(token, data)` via a `ServiceRegistry`, with request-id correlation and telemetry hooks) — a legitimate layer over `ndigo-http`, exactly the "meets most needs, drop to the underlying package for edge cases" pattern. The smell is narrower: it re-declares five interceptor interfaces (`CompletionAwareServiceInterceptor`, …) that mirror `ndigo-http`'s five, and its `postSuccess` differs from `postResponse` only semantically. **Action:** either reuse/extend the `@ndigo/http` interceptor contracts where the lifecycle is the same, or document the service lifecycle as intentionally distinct. Not a deletion candidate.

### Missing / incomplete features

**M1 — `ndigo-domain` has no consumer; cohesion unproven.** ✅ _RESOLVED 2026-09-05 — ARCHIVED_

`ndigo-domain` (the legacy `DomainComponent`/`BusinessComponent`/`ViewComponent` + `ComponentAndView` concept — a business object as a union of content/data/behavior, paired with a view component at render time) never gained a consumer and its roadmap items were superseded by the client-first pivot. The concept's modern equivalents already exist: business objects → `@ndigo/orm` entities / Zod classes (AD-07); stateful event-emitting rendering components → `AbstractWebComponent`/`NdigoElement`; composition → dispatcher `ModelAndView`. Moved to `archive/ndigo-domain` with a decision note.

**M2 — `ndigo-orm` is in-memory only in practice.** ✅ _RESOLVED 2026-09-05 — Drizzle demo path_

`ndigo-api` gained a Drizzle-backed read path: `DrizzleNoteController` (`@ndigo/orm-drizzle`, libSQL `:memory:`) exposes `GET /drizzle/notes` + `GET /drizzle/notes/:id` through the real framework (async handlers, auth header, 404 handling); integration tests seed the same data source and assert SQL-backed reads end-to-end. The in-memory `NoteController` remains the zero-config demo path.

Surfaced two framework gaps while wiring the SQL path:

- **Async handler + `bodyValue('*')` loses response serialization** (a `POST` returning a plain object/`ResponseEntity` from an async handler yields an empty body; async GET works, sync POST works) — the framework has no async-controller tests; flagged for a follow-up fix.
- **`DrizzleEntityManager` never ran lifecycle hooks** — `@prePersist`/`@preUpdate` were ignored (validation ran against unfilled fields). Fixed: hooks now run before validation, matching `InMemoryEntityManager`.

**M3 — `ndigo-orm-drizzle` is incomplete (2 of 5 interfaces) and un-consumed.** ✅ _RESOLVED 2026-09-05_

`ndigo-orm` defines five contracts (`DataSource`, `EntityManager`, `UnitOfWork`, `TransactionManager`, `Repository`); `ndigo-orm-drizzle` originally implemented only `DataSource` + `EntityManager`. **Now complete:** `DrizzleTransactionManager` (BEGIN/COMMIT/ROLLBACK), `DrizzleUnitOfWork` (async tracking batched with `Promise.all`), and `DrizzleRepository` (async CRUD) landed in `1518ae0c`, with 12 libSQL in-memory integration tests. Entity `persist` also validates against the Zod schema derived from `@column` metadata (AD-07). Remaining gap: no migrations/schema management yet. `drizzle-zod` (zod v4 compatible, `0.8.3`) remains deferred until the adapter adopts Drizzle table schemas — the derivation is direct from metadata today.

**M4 — No real persistence, scheduling, websockets/SSE, server-side template engine, or session _store_.** Session _argument resolvers_ exist in both platforms, but no backing store package. These are gaps to record, not necessarily to fill now.

### Anti-pattern avoidance (one way to solve)

**A1 — Six handler-mapping strategies.** ✅ _RESOLVED 2026-09-05_

Reworked to radix-only: the duplicate `radix-route-handler-mapping.ts`/`radix-metadata-handler-mapping.ts` files (byte-identical, both exporting `RadixMetadataHandlerMapping`) were consolidated; `LinearMetadataHandlerMapping` was **deleted** after the repo's own benchmark (`bench/routing.bench.ts`) showed radix is 40–63× faster on every hit scenario and isomorphic (no node-only code) — so both browser and node now default to radix. This comparison was radix against the deleted linear mapping; it is not evidence about external router libraries. `NamePathHandlerMapping` stays as the strategy-chain fallback; `SimplePathHandlerMapping` is internal. Docs updated (ARCHITECTURE §Paradigm Selection Rules).

**A2 — Paradigm selection is not enforced.** ✅ _RESOLVED 2026-09-05 — two-tier enforcement_

Anti-pattern detection now has three tiers:

- **Structural/misuse → runtime `FrameworkError`/`TypeError` throws.** Added decorator kind-guards to `@service`/`@*Call` (ndigo-service), `@authenticated`/`@authorized` (ndigo-auth-core), `@transactional` (ndigo-orm); `getSignal` throws when `@signal`/`@effect` fields are used without the required `@reactive` class decorator. Pre-existing: `@entry`, `@routeMapping("")`, `serviceClient` without `@service`, entity without `@primaryColumn`, OIDC/CORS config misuse.
- **Cross-paradigm confusion → lint.** Two new `@ndigo/eslint-plugin` rules (error): `no-cross-paradigm-decorators` (mixing `@service`/`@*Call` with `@routeMapping`/`@*Mapping` on one class) and `no-signals-in-entity` (`@ndigo/signals` imported where an `@entity` class is declared). Repo is clean under both.
- **Intent-level (e.g. "used an event when a derived field belonged") → documented for review** (ARCHITECTURE.md §Paradigm Selection Rules). Not mechanically detectable: `emit` vs `effect` have identical call shapes; this tier is enforcement-by-documented-rule + code review.

The "one way to solve" property is now enforced for naming/imports (oxlint), structural misuse (throws), and cross-paradigm mixing (lint); only intent-level idiom choice remains review-based.

## Decision rules (to be added to architecture docs)

1. **Signals** = local, synchronous, derived state within a component/service (`signal`/`computed`/`effect`). **Events** = cross-component, asynchronous application notifications (`EventEmitter`, `:`-hierarchy). **`ndigo-model` emitter** = internal implementation detail; not a public event bus.
2. **Validation**: `@ndigo/validate` is the canonical constraint system; `@ndigo/model` (objectmodel) is an integration-layer convenience for quick model-shaped assertions, not a second validation framework.
3. **Route mapping**: radix is canonical for production; linear is the simple/dev fallback; the remaining strategies are internal.

## Recommended remediation order

1. Document decision rules in `ARCHITECTURE.md` (no code risk).
2. `ndigo-service`: resolve the interceptor-contract duplication (extend `@ndigo/http` or justify distinct lifecycle).
3. `ndigo-validate` vs `ndigo-model`: declare canonical, document boundary.
4. `ndigo-orm-drizzle`: complete the missing 3 interfaces or mark WIP.
5. Handler-mapping: declare canonical + mark legacy.
6. Add lint guard(s) for the clearest paradigm misuse (e.g. importing `@ndigo/model`'s emitter in a package already using `@ndigo/context`).
