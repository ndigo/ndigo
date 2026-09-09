# Environment Phase 5 — Observability & Lifecycle: Origins, Customizers, Refresh

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q7)
**Roadmap:** Phase 5 of the Environment roadmap, building on P0–P4 (`0ec6a9c8`, AD-11..15). P0 retained per-key winning sources in `FlatMergedIndex` **for** this phase; P2 deferred `refresh()` formalization here; Spring's `EnvironmentPostProcessor` analog (customizers) was promised at the roadmap.

## 1 · Objective

User stories:

1. **As a deployer/debugger**, I can ask "where did `server.port` come from?" and get `commandLine` / `process.env` / `application.json` — the origin of every resolved value, with a cheap per-key API.
2. **As a framework user**, I can run `EnvironmentCustomizer`s (Spring's `EnvironmentPostProcessor` analog): ordered hooks that adjust the environment **after the standard sources are wired but before the context/refresh reads it** — the documented reordering/replacement seam (P4 target).
3. **As a developer**, `refresh()` is a first-class, correct API (P2's `NodeEnvironment.refresh` promise): re-snapshot + rebuild — currently implemented ad-hoc in `NodeEnvironment`.

Non-goals (explicit): P6 zod validation, per-field origins _within_ `@configurationProperties` binding (a follow-up; the index origin is top-level-key granularity), origin _propagation through placeholders_ (a resolved value's origin is its raw key's — documented).

## 2 · Current state (evidence)

| Area                               | Today                                                                                                              | Gap                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Origin retention**               | `FlatMergedIndex.#origins` — `getOrigin(key)` returns the winning source name (P0, `property-resolver.ts:222-269`) | **Not exposed** through the resolver/environment; prototype-chain index has none (its winner is structural, not stored) |
| **`NodeEnvironment.refresh()`**    | P2 shipped a working `refresh()` (re-snapshot `process.env` via `replace`)                                         | Ad-hoc (only re-snapshots env, not a general rebuild); not covered by tests                                             |
| **Customizers**                    | None                                                                                                               | No pre-refresh adjustment hook (Spring's `EnvironmentPostProcessor`)                                                    |
| **Environment mutation semantics** | Registry `replace`/`addLast`/`addFirst` + lazy-dirty rebuild (P0)                                                  | No ordered "apply N customizers" orchestration                                                                          |
| **Where origin could surface**     | Environment resolver owns the index                                                                                | No `getOrigin`/`originOf` on `PropertyResolver`/`Environment`                                                           |

## 3 · Decisions (proposed — review Q1–Q7)

### D1 — `originOf(key)` public API

- `PropertyResolver`/`Environment` gain `originOf(key: string): string | null` — returns the winning source name, or `null` when unknown/unresolved.
- **Implementation (Q1)**: the `PropertyIndex` interface gains an optional `originOf?(key)` — `FlatMergedIndex` implements it (its retained winners); `PrototypeChainIndex` leaves it absent → the resolver returns `null` (the chain's winner is structural, not stored; deriving per-call adds the scan/allocation P0's design avoids). The optional interface member keeps the resolution strategy-local: if prototype origins are ever needed, it's a strategy change, not a contract break. Top-level-key granularity (documented).
- `Environment` delegates; `likeEnvironment` shape guard updated.
- **Granularity (Q7)**: **top-level key** — `originOf('server.port')` reports the source that owns the `server` subtree (the retained winner is key-level; path-level splits where one source defines `server.port` and another `server.host` report the subtree owner — imprecise for that rare split, honest and documented. Per-segment origins would require index rework for a case the common whole-bundle config doesn't need).

### D2 — `EnvironmentCustomizer` (Spring's `EnvironmentPostProcessor` analog, house name — Q3)

- `interface EnvironmentCustomizer { customize(environment: ConfigurableEnvironment): void }` — an ordered hook receiving the **fully-wired** environment (profiles, files, CLI, builder — P2/P3 order) **before** the context reads it.
- `ApplicationBuilder.customizers(...)`: registers ordered customizers; boot applies them in `_prepareEnvironment` **after** `_configureEnvironment` and **before** context creation.
- Same seam powers: reordering sources (`getPropertySources().addFirst(...)`), replacing (`replace`), injecting test doubles, adding a source from a custom location.
- **Customizer failure (Q6)**: a throwing customizer **fails boot loudly** — a partial, unspecified environment would poison every later read (binding, conditions), and a flaky customizer is exactly what you want surfaced immediately (Spring's `EnvironmentPostProcessor` propagates too).
- **Q2 — ordering (registration order)**: `customizers(a, b)` runs a then b — each sees the other's mutations; deterministic, matches the author's written intent. Precedence inversion = register in the reverse order you want; no framework magic.
- **Q3 — name (`EnvironmentCustomizer` / `customizers(...)`)**: house naming (drop Spring's `PostProcessor` machinery term; "customizer" names the intent). Spring analog noted in the ADR; `app.customizers(...)` reads naturally.

### D3 — `refresh()` formalized

- `ConfigurableEnvironment.refresh()`: clears the resolver's placeholder cache + forces an index rebuild — **minimal scope (Q4, option a)**: "recompute from your current sources", deterministic and composable. It does NOT re-run customizers (would double-apply `addFirst` sources) and does NOT re-read platform snapshots (that's the platform's own refresh chaining — `NodeEnvironment.refresh` re-snapshots via `super.refresh()` + `replace`).
- `NodeEnvironment.refresh` re-implements via the formal `super.refresh()` + its re-snapshot (kept — it's Node-specific content reload).
- **Q5 — refresh vs binding (environment-scope only)**: `refresh()` never re-binds `@configurationProperties` instances — it is environment-scope by construction (the environment holds no context; re-binding is P4's `resolveConfigurationProperties` call at boot). Decoupled, documented.

### D4 — Origin + customizer observability

- Origin error messages: the P4/P3 fail-loud errors (`Missing required property` etc.) now append `(from source: <name>)` when the key's origin is known — the P5 observability payoff in the messages users actually see.

## 4 · Project structure

```
packages/blue-context/src/
  property-resolver.ts     EDIT — originOf (index-delegated), refresh support
  environment.ts           EDIT — originOf delegate, refresh() (cache/index rebuild), shape guard
  customizer.ts            NEW  — EnvironmentCustomizer interface + applyCustomizers helper
packages/blue-boot/src/
  application-builder.ts   EDIT — customizers(...) registration
  application.ts           EDIT — apply customizers in _prepareEnvironment
packages/blue-platform-node/src/
  node-environment.ts      EDIT — refresh() via super + re-snapshot
packages/blue-context/test/
  environment.spec.ts      EDIT — originOf, refresh
  customizer.spec.ts       NEW  — ordering, mutations visible, failure
packages/blue-boot/test/
  customizer.spec.ts       EDIT — customizers run before context reads
packages/blue-platform-node/test/
  node-environment.spec.ts EDIT — refresh via super
```

## 5 · Code style

Matches P0–P4. `originOf` on prototype chain returns `null` (documented, no per-lookup allocation).

## 6 · Testing strategy

- `originOf`: flat index returns the winning source; prototype → `null`; unknown key → `null`; after `replace` → new winner.
- Customizers: run in order; environment mutations (add/replace/remove) visible to the context; a customizer throwing fails boot loudly (Q6).
- `refresh()`: after registry mutation, lookup reflects the change without manual re-set; placeholder cache cleared (a placeholdered value recomputes); `NodeEnvironment.refresh` re-snapshots env.
- Origin in error messages: `Missing required property "server.port" (from source: commandLine)`.

## 7 · Boundaries

- **Always:** full suite + lint + format; P0–P4 specs stay green; no eval; no new deps.
- **Ask first:** changing refresh scope beyond (a); customizer ordering; exposing prototype-chain origins (would require index changes).
- **Never:** originOf allocating per call; refresh() re-running customizers by default; origin through placeholder chains (documented as raw-key).

## 8 · Success criteria (testable)

1. `originOf('server.port')` (flat) returns the winning source name; prototype → `null`; unknown → `null`.
2. Customizers run in registration order, before context reads the environment; mutations visible; throw fails boot.
3. `refresh()` clears caches + rebuilds; lookups correct after mutation; `NodeEnvironment.refresh` re-snapshots.
4. Fail-loud binding/required errors append `(from source: …)` when known.
5. Full monorepo suite / lint / format / graft green.

## 9 · Rollout

1. `environment.ts`/resolver `originOf` + refresh() + specs.
2. `customizer.ts` + boot wiring + specs.
3. `NodeEnvironment.refresh` via super + spec.
4. Origin-in-error-messages + full suite; ADR (AD-16).

## 10 · Open questions

- **Q1 — Prototype-chain originOf (resolved → `null`)**: the chain's winner is structural, not stored; deriving per-call adds the scan/allocation P0 avoids. `PropertyIndex` gains an **optional** `originOf?` — flat implements it, prototype leaves it absent → `null`. Strategy-local change later, not a contract break.
- **Q2 — Customizer ordering**: registration order (recommended, Spring parity) vs reverse.
- **Q3 — Name**: `EnvironmentCustomizer`/`customizers(...)` (recommended) vs `EnvironmentPostProcessor` (Spring-exact).
- **Q4 — refresh() scope (resolved → option a, minimal)**: rebuild + clear caches only — "recompute from current sources"; no customizer re-run (double-apply footgun), no platform re-snapshot (that's the platform's own refresh chaining).
- **Q5 — refresh vs binding (resolved → environment-scope only)**: decoupled by construction — the environment holds no context, so refresh cannot re-bind; re-binding is P4's explicit `resolveConfigurationProperties` call.
- **Q6 — Customizer failure (resolved → fail boot loudly)**: a throwing customizer leaves a partial, unspecified environment that poisons later reads; flaky customizers deserve immediate surfacing. Spring propagates too.
- **Q7 — Origin granularity (resolved → top-level key)**: the retained winner is key-level; `originOf('server.port')` reports the subtree owner. Honest for the common whole-bundle case; per-segment would need index rework for a rare split.
