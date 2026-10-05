# Framework Assessment Audit

**Date:** 2026-09-05
**Scope:** All 32 framework packages (`packages/blue-*`) + demo apps, evaluated for feature completeness, redundancy, package-purpose clarity, "one way to solve a use case" (anti-pattern avoidance), and semantic paradigm enforcement.
**Method:** Graft graph orientation + direct source review of package indexes, consumer graphs, event/reactive surfaces, and `FrameworkError`-subclass throw sites.

## Executive Summary

The framework's layering is sound and its core web stack (core → factory/context → router/dispatcher → view → platform adapters) is coherent with clear package boundaries. The weaknesses are concentrated in (a) **two competing validation systems**, (b) **three overlapping reactive/event surfaces with no documented decision rule**, (c) **several app-facing public APIs that are incomplete or unproven**, and (d) **paradigm selection is not semantically enforced** — unlike lifecycle/state misuse, which is.

A package having _no framework-internal consumer is not, by itself, a defect_: it may be an app-facing public API. This audit classifies each package accordingly and applies the two app-facing scrutiny questions from the review request:

1. Does the package fulfill an application need?
2. Does it interact cohesively with other public APIs (rather than duplicating or undercutting them)?

It also accepts the second framing: a public API that "meets most needs" is legitimate even when edge cases require dropping to an underlying package (e.g. `blue-service` over `blue-http`).

## Package classification

| Package                                                                                                         | Kind                            | External consumers | Notes                               |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------ | ----------------------------------- |
| `blue-core`, `blue-util`, `blue-parser`, `blue-factory`, `blue-context`                                         | framework-internal (foundation) | many               | ✅                                  |
| `blue-router` (81), `blue-dispatcher` (51), `blue-view` (19), `blue-view-webcomponent` (13), `blue-content` (5) | framework-internal (web)        | many               | ✅                                  |
| `blue-http`                                                                                                     | both (framework + app)          | many               | ✅                                  |
| `blue-platform-node`, `blue-platform-web`                                                                       | both (adapters)                 | many               | ✅                                  |
| `blue-auth-core`, `blue-auth-client`, `blue-auth-server`                                                        | app-facing (public API)         | app consumers      | ✅ fail-closed, reviewed previously |
| `blue-telemetry`, `blue-telemetry-node`, `blue-telemetry-web`                                                   | app-facing                      | app consumers      | ✅                                  |
| `blue-boot`, `blue-generators`, `blue-eslint-plugin`, `blue-test`                                               | developer tooling               | n/a                | ✅                                  |
| `blue-signals`                                                                                                  | **app-facing public API**       | 2 (`blue-todo`)    | ⚠️ see R1                           |
| `blue-model`                                                                                                    | **app-facing public API**       | 1 (`blue-domain`)  | ⚠️ see R2                           |
| `blue-validate`                                                                                                 | app-facing public API           | 2                  | ✅ (first-party validation)         |
| ~~`blue-domain`~~ (archived)                                                                                    | former public API               | 0                  | ✅ M1 — archived 2026-09-05         |
| `blue-service`                                                                                                  | app-facing public API           | 0                  | ⚠️ see R3                           |
| `blue-orm`                                                                                                      | app-facing public API           | 2 (`blue-api`)     | ⚠️ see M2                           |
| `blue-orm-drizzle`                                                                                              | app-facing public API           | 0                  | ⚠️ see M3                           |
| `blue-management`                                                                                               | app-facing public API           | 0                  | ✅ see note                         |

## Findings

### Redundancies

**R1 — Three reactive/event surfaces with no decision rule (the primary concern).** ✅ _RESOLVED 2026-09-05_

- `@blue/signals` — reactive state (`signal`/`computed`/`effect`), a re-export of `@preact/signals-core` plus a BlueJS decorator API.
- `@blue/context` `EventEmitter` — cascading pub/sub application events (`:`-hierarchy, `AsConditionalEventEmitter`/`AsPositionalEventEmitter` mixins).
- `@blue/model` `EventModel`/`asMinimalEventEmitter` — a third, hand-rolled minimal emitter (`event.ts`). **Deleted 2026-09-05** — it was dead code (zero production consumers) and a legacy pre-signals conflation of validation + change-observation. The decision rule is documented in `ARCHITECTURE.md` (Paradigm Selection Rules): signals for local derived state, `EventEmitter` for cross-component events, reactive models via `@blue/signals`' `@reactive`/`@signal` with validation layered on.

`apps/blue-todo` uses both `@blue/signals` (item state in `todo-service.ts`) and the context emitter (controllers) — now with a documented boundary.

**R2 — Two validation systems: `blue-model` vs `blue-validate`.** ✅ _RESOLVED 2026-09-05 → AD-07 executed_

Corrected: `blue-validate` is the _legacy_ constraint/decorator system; `blue-model`/objectmodel was the intended modernization that never landed. **Both deleted**; `blue-orm` derives Zod schemas from `@entity`/`@column` metadata; `blue-dispatcher` route params are Zod-backed (and `blue-domain` — archived 2026-09-05 — had been migrated to Zod before archiving).

**R3 — `blue-service` duplicates `blue-http`'s interceptor pattern (not a full redundancy).** ✅ _RESOLVED 2026-09-05 → AD-08_

Corrected from the initial read: `blue-service` is a _typed service client_ (`Service.call(token, data)` via a `ServiceRegistry`, with request-id correlation and telemetry hooks) — a legitimate layer over `blue-http`, exactly the "meets most needs, drop to the underlying package for edge cases" pattern. The smell is narrower: it re-declares five interceptor interfaces (`CompletionAwareServiceInterceptor`, …) that mirror `blue-http`'s five, and its `postSuccess` differs from `postResponse` only semantically. **Action:** either reuse/extend the `@blue/http` interceptor contracts where the lifecycle is the same, or document the service lifecycle as intentionally distinct. Not a deletion candidate.

### Missing / incomplete features

**M1 — `blue-domain` has no consumer; cohesion unproven.** ✅ _RESOLVED 2026-09-05 — ARCHIVED_

`blue-domain` (the legacy `DomainComponent`/`BusinessComponent`/`ViewComponent` + `ComponentAndView` concept — a business object as a union of content/data/behavior, paired with a view component at render time) never gained a consumer and its roadmap items were superseded by the client-first pivot. The concept's modern equivalents already exist: business objects → `@blue/orm` entities / Zod classes (AD-07); stateful event-emitting rendering components → `AbstractWebComponent`/`BlueElement`; composition → dispatcher `ModelAndView`. Moved to `archive/blue-domain` with a decision note.

**M2 — `blue-orm` is in-memory only in practice.** ✅ _RESOLVED 2026-09-05 — Drizzle demo path_

`blue-api` gained a Drizzle-backed read path: `DrizzleNoteController` (`@blue/orm-drizzle`, libSQL `:memory:`) exposes `GET /drizzle/notes` + `GET /drizzle/notes/:id` through the real framework (async handlers, auth header, 404 handling); integration tests seed the same data source and assert SQL-backed reads end-to-end. The in-memory `NoteController` remains the zero-config demo path.

Surfaced two framework gaps while wiring the SQL path:

- **Async handler + `bodyValue('*')` loses response serialization** (a `POST` returning a plain object/`ResponseEntity` from an async handler yields an empty body; async GET works, sync POST works) — the framework has no async-controller tests; flagged for a follow-up fix.
- **`DrizzleEntityManager` never ran lifecycle hooks** — `@prePersist`/`@preUpdate` were ignored (validation ran against unfilled fields). Fixed: hooks now run before validation, matching `InMemoryEntityManager`.

**M3 — `blue-orm-drizzle` is incomplete (2 of 5 interfaces) and un-consumed.** ✅ _RESOLVED 2026-09-05_

`blue-orm` defines five contracts (`DataSource`, `EntityManager`, `UnitOfWork`, `TransactionManager`, `Repository`); `blue-orm-drizzle` originally implemented only `DataSource` + `EntityManager`. **Now complete:** `DrizzleTransactionManager` (BEGIN/COMMIT/ROLLBACK), `DrizzleUnitOfWork` (async tracking batched with `Promise.all`), and `DrizzleRepository` (async CRUD) landed in `1518ae0c`, with 12 libSQL in-memory integration tests. Entity `persist` also validates against the Zod schema derived from `@column` metadata (AD-07). Remaining gap: no migrations/schema management yet. `drizzle-zod` (zod v4 compatible, `0.8.3`) remains deferred until the adapter adopts Drizzle table schemas — the derivation is direct from metadata today.

**M4 — No real persistence, scheduling, websockets/SSE, server-side template engine, or session _store_.** Session _argument resolvers_ exist in both platforms, but no backing store package. These are gaps to record, not necessarily to fill now.

### Anti-pattern avoidance (one way to solve)

**A1 — Six handler-mapping strategies.** ✅ _RESOLVED 2026-09-05_

Reworked to radix-only: the duplicate `radix-route-handler-mapping.ts`/`radix-metadata-handler-mapping.ts` files (byte-identical, both exporting `RadixMetadataHandlerMapping`) were consolidated; `LinearMetadataHandlerMapping` was **deleted** after the repo's own benchmark (`bench/routing.bench.ts`) showed radix is 40–63× faster on every hit scenario and isomorphic (no node-only code) — so both browser and node now default to radix. `NamePathHandlerMapping` stays as the strategy-chain fallback; `SimplePathHandlerMapping` is internal. Docs updated (ARCHITECTURE §Paradigm Selection Rules).

**A2 — Paradigm selection is not enforced.** ✅ _RESOLVED 2026-09-05 — two-tier enforcement_

Anti-pattern detection now has three tiers:

- **Structural/misuse → runtime `FrameworkError`/`TypeError` throws.** Added decorator kind-guards to `@service`/`@*Call` (blue-service), `@authenticated`/`@authorized` (blue-auth-core), `@transactional` (blue-orm); `getSignal` throws when `@signal`/`@effect` fields are used without the required `@reactive` class decorator. Pre-existing: `@entry`, `@routeMapping("")`, `serviceClient` without `@service`, entity without `@primaryColumn`, OIDC/CORS config misuse.
- **Cross-paradigm confusion → lint.** Two new `@blue/eslint-plugin` rules (error): `no-cross-paradigm-decorators` (mixing `@service`/`@*Call` with `@routeMapping`/`@*Mapping` on one class) and `no-signals-in-entity` (`@blue/signals` imported where an `@entity` class is declared). Repo is clean under both.
- **Intent-level (e.g. "used an event when a derived field belonged") → documented for review** (ARCHITECTURE.md §Paradigm Selection Rules). Not mechanically detectable: `emit` vs `effect` have identical call shapes; this tier is enforcement-by-documented-rule + code review.

The "one way to solve" property is now enforced for naming/imports (oxlint), structural misuse (throws), and cross-paradigm mixing (lint); only intent-level idiom choice remains review-based.

## Decision rules (to be added to architecture docs)

1. **Signals** = local, synchronous, derived state within a component/service (`signal`/`computed`/`effect`). **Events** = cross-component, asynchronous application notifications (`EventEmitter`, `:`-hierarchy). **`blue-model` emitter** = internal implementation detail; not a public event bus.
2. **Validation**: `@blue/validate` is the canonical constraint system; `@blue/model` (objectmodel) is an integration-layer convenience for quick model-shaped assertions, not a second validation framework.
3. **Route mapping**: radix is canonical for production; linear is the simple/dev fallback; the remaining strategies are internal.

## Recommended remediation order

1. Document decision rules in `ARCHITECTURE.md` (no code risk).
2. `blue-service`: resolve the interceptor-contract duplication (extend `@blue/http` or justify distinct lifecycle).
3. `blue-validate` vs `blue-model`: declare canonical, document boundary.
4. `blue-orm-drizzle`: complete the missing 3 interfaces or mark WIP.
5. Handler-mapping: declare canonical + mark legacy.
6. Add lint guard(s) for the clearest paradigm misuse (e.g. importing `@blue/model`'s emitter in a package already using `@blue/context`).
