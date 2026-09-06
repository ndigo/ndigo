# Framework Assessment Audit

**Date:** 2026-09-05
**Scope:** All 32 framework packages (`packages/blue-*`) + demo apps, evaluated for feature completeness, redundancy, package-purpose clarity, "one way to solve a use case" (anti-pattern avoidance), and semantic paradigm enforcement.
**Method:** Graft graph orientation + direct source review of package indexes, consumer graphs, event/reactive surfaces, and `FrameworkError`-subclass throw sites.

## Executive Summary

The framework's layering is sound and its core web stack (core → factory/context → router/dispatcher → view → platform adapters) is coherent with clear package boundaries. The weaknesses are concentrated in (a) **two competing validation systems**, (b) **three overlapping reactive/event surfaces with no documented decision rule**, (c) **several app-facing public APIs that are incomplete or unproven**, and (d) **paradigm selection is not semantically enforced** — unlike lifecycle/state misuse, which is.

A package having *no framework-internal consumer is not, by itself, a defect*: it may be an app-facing public API. This audit classifies each package accordingly and applies the two app-facing scrutiny questions from the review request:

1. Does the package fulfill an application need?
2. Does it interact cohesively with other public APIs (rather than duplicating or undercutting them)?

It also accepts the second framing: a public API that "meets most needs" is legitimate even when edge cases require dropping to an underlying package (e.g. `blue-service` over `blue-http`).

## Package classification

| Package | Kind | External consumers | Notes |
|---|---|---|---|
| `blue-core`, `blue-util`, `blue-parser`, `blue-factory`, `blue-context` | framework-internal (foundation) | many | ✅ |
| `blue-router` (81), `blue-dispatcher` (51), `blue-view` (19), `blue-view-webcomponent` (13), `blue-content` (5) | framework-internal (web) | many | ✅ |
| `blue-http` | both (framework + app) | many | ✅ |
| `blue-platform-node`, `blue-platform-web` | both (adapters) | many | ✅ |
| `blue-auth-core`, `blue-auth-client`, `blue-auth-server` | app-facing (public API) | app consumers | ✅ fail-closed, reviewed previously |
| `blue-telemetry`, `blue-telemetry-node`, `blue-telemetry-web` | app-facing | app consumers | ✅ |
| `blue-boot`, `blue-generators`, `blue-eslint-plugin`, `blue-test` | developer tooling | n/a | ✅ |
| `blue-signals` | **app-facing public API** | 2 (`blue-todo`) | ⚠️ see R1 |
| `blue-model` | **app-facing public API** | 1 (`blue-domain`) | ⚠️ see R2 |
| `blue-validate` | app-facing public API | 2 | ✅ (first-party validation) |
| `blue-domain` | app-facing public API | 0 | ⚠️ see M1 |
| `blue-service` | app-facing public API | 0 | ⚠️ see R3 |
| `blue-orm` | app-facing public API | 2 (`blue-api`) | ⚠️ see M2 |
| `blue-orm-drizzle` | app-facing public API | 0 | ⚠️ see M3 |
| `blue-management` | app-facing public API | 0 | ✅ see note |

## Findings

### Redundancies

**R1 — Three reactive/event surfaces with no decision rule (the primary concern).** ✅ *RESOLVED 2026-09-05*

- `@blue/signals` — reactive state (`signal`/`computed`/`effect`), a re-export of `@preact/signals-core` plus a BlueJS decorator API.
- `@blue/context` `EventEmitter` — Spring-style pub/sub application events (`:`-hierarchy, `AsConditionalEventEmitter`/`AsPositionalEventEmitter` mixins).
- `@blue/model` `EventModel`/`asMinimalEventEmitter` — a third, hand-rolled minimal emitter (`event.ts`). **Deleted 2026-09-05** — it was dead code (zero production consumers) and a legacy pre-signals conflation of validation + change-observation. The decision rule is documented in `ARCHITECTURE.md` (Paradigm Selection Rules): signals for local derived state, `EventEmitter` for cross-component events, reactive models via `@blue/signals`' `@reactive`/`@signal` with validation layered on.

`apps/blue-todo` uses both `@blue/signals` (item state in `todo-service.ts`) and the context emitter (controllers) — now with a documented boundary.

**R2 — Two validation systems: `blue-model` vs `blue-validate`.** ✅ *DECIDED 2026-09-05 → AD-7*

Corrected: `blue-validate` is the *legacy* constraint/decorator system; `blue-model`/objectmodel was the intended modernization that never landed (no type inference, no ORM/signal integration). Decision (AD-7): **Zod is the canonical runtime-schema primitive** — retire both, derive entity schemas from `blue-orm` decorator metadata via `drizzle-zod`, keep `blue-orm` entities decorator-annotated. See `docs/decisions/2026-09-05_AD7_ZOD_VALIDATION.md`.

**R3 — `blue-service` duplicates `blue-http`'s interceptor pattern (not a full redundancy).**

Corrected from the initial read: `blue-service` is a *typed service client* (`Service.call(token, data)` via a `ServiceRegistry`, with request-id correlation and telemetry hooks) — a legitimate layer over `blue-http`, exactly the "meets most needs, drop to the underlying package for edge cases" pattern. The smell is narrower: it re-declares five interceptor interfaces (`CompletionAwareServiceInterceptor`, …) that mirror `blue-http`'s five, and its `postSuccess` differs from `postResponse` only semantically. **Action:** either reuse/extend the `@blue/http` interceptor contracts where the lifecycle is the same, or document the service lifecycle as intentionally distinct. Not a deletion candidate.

### Missing / incomplete features

**M1 — `blue-domain` has no consumer; cohesion unproven.**

It composes `blue-model` + `blue-validate` + `blue-context` + `blue-factory` into a `DomainComponent` abstraction. The design is plausible but nothing exercises it, so "does it fulfill an application need / interact cohesively" cannot yet be affirmed. **Action:** write one integration spec against a real domain object (or archive until it earns a consumer).

**M2 — `blue-orm` is in-memory only in practice.**

The only app consumer (`blue-api`) uses `InMemoryDataSource`. That is acceptable for a public API that "meets most needs" (unit testing, prototyping) provided a real adapter exists — see M3. Per AD-7, entity validation moves from the legacy `validate()` hook to a Zod schema derived from `@entity`/`@column` metadata.

**M3 — `blue-orm-drizzle` is incomplete (2 of 5 interfaces) and un-consumed.**

`blue-orm` defines five contracts (`DataSource`, `EntityManager`, `UnitOfWork`, `TransactionManager`, `Repository`); `blue-orm-drizzle` implements only `DataSource` + `EntityManager`. No migrations/schema management. **Action:** complete the remaining three interfaces + a migration story, or document the package as WIP and stop exporting it as if complete. AD-7 adds `drizzle-zod` (zod v4 compatible, `0.8.3`) so the Drizzle table schema becomes the validation source of truth.

**M4 — No real persistence, scheduling, websockets/SSE, server-side template engine, or session *store*.** Session *argument resolvers* exist in both platforms, but no backing store package. These are gaps to record, not necessarily to fill now.

### Anti-pattern avoidance (one way to solve)

**A1 — Six handler-mapping strategies.** `linear-metadata`, `radix-metadata`, `radix-route`, `simple-path`, `name-path`, `abstract-path` all exist; demo apps each pick one arbitrarily (`blue-api` radix, `blue-todo`/`blue-hello` linear). Multiple ways to map routes→handlers with no canonical guidance. **Action:** document the canonical choice (radix for production routing, linear for explicit/dev) and mark the rest as internal/legacy.

**A2 — Paradigm selection is not enforced.** The `like*` guards (77 of them) *detect* structural roles, and 64 `FrameworkError` throw sites enforce lifecycle/state (destroyed targets, double-listen, missing handlers/views, duplicate feature registration). But nothing throws or warns when a paradigm is misapplied — e.g. using signals to replicate application events, or an emitter to model derived state. The "one way to solve" property is enforced for naming/imports (oxlint) and lifecycle/state, **not** for paradigm selection.

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
