# Environment Phase 3 — Profiles Completed: Defaults, Expressions, Activation Sources

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q7)
**Roadmap:** Phase 3 of the Environment roadmap, building on P0–P2 (`f910e33d`, AD-11/12/13). P2's config loader is profile-aware; P3 makes profile _activation_ correct and expressive.

## 1 · Objective

Phase 0–2 shipped profile _storage_ (active/default sets) and profile-gated config files. The remaining profile semantics, per the roadmap:

1. **Default-profile activation** — `defaultProfiles` activate only when **no** active profile is set explicitly (the documented-but-dead promise: the env docstring claims it, nothing implements it).
2. **Profile expressions** — Spring 6.1-style: `dev`, `!prod`, `a & b`, `a | b`, parentheses; `@profile` / `@conditionalOnProfile` evaluate expressions, not exact strings.
3. **Activation from env/CLI** — `BLUE_PROFILES_ACTIVE` env var and `--spring.profiles.active`-equivalent (`--profiles.active=` / `--BLUE_PROFILES_ACTIVE=`?) activating profiles at boot; profile _groups_ (`short` → `dev,test`).

User stories:

- As a deployer, `BLUE_PROFILES_ACTIVE=prod` activates `prod` without code changes.
- As a dev, `--profiles=dev` on the CLI overrides nothing but adds `dev`.
- As a config author, `@profile('!prod & (dev | test)')` gates a component with an expression, not an exact-match list.

Non-goals (explicit): profile-specific property _binding_ (done in P2's loader), P4 typed binding, P5 origin/customizers, P6 validation.

## 2 · Current state (evidence)

| Area                                      | Today                                                                                                                                                                                                | Gap                                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `activeProfiles` / `defaultProfiles` sets | Environment stores both (P0); `addActiveProfile`/`addDefaultProfile` mutators                                                                                                                        | `defaultProfiles` **unconsumed** — docs claim "defaults activate when nothing explicit" (`environment.ts:85`) but no code reads it |
| `@profile(name)`                          | `blue-context/src/configuration.ts:105` — stores a **string[]** per class/method; `ConfigurationProcessor._isActiveProfile` (L324) does **exact OR match** (`activeProfiles.indexOf(member) !== -1`) | No expressions (`!`, `&`, `                                                                                                        | `); array-of-strings OR only |
| `@conditionalOnProfile`                   | **Doesn't exist** (blue-core has `conditionalOnProperty`, `conditionalOnNode`, etc.)                                                                                                                 | The DI-gating decorator is missing                                                                                                 |
| Boot activation                           | `ApplicationBuilder.profiles(...)` + `app.setProfiles(...)` (P1); env-var/CLI activation absent                                                                                                      | Deployer cannot activate without code; no `BLUE_PROFILES_ACTIVE`                                                                   |
| Profile groups                            | Absent                                                                                                                                                                                               | Spring's `spring.profiles.group.*` shorthand absent                                                                                |
| `MockEnvironment`                         | extends `AbstractEnvironment`                                                                                                                                                                        | Inherits the missing default-activation + evaluation                                                                               |

## 3 · Decisions (proposed — review Q1–Q7)

### D1 — Default-profile activation (Spring-exact)

`AbstractEnvironment` owns the effective-set semantics (Q3): the active set is `activeProfiles` when non-empty, else `defaultProfiles`. Exposed as an accessor (`activeProfilesOrDefaults`) consumed by every gate (`@profile` processor, `@conditionalOnProfile`, manual `acceptsProfiles`) — the environment is the sole authority on "what's active", so one answer everywhere, no gate-side duplicated fallback logic. `activeProfiles` getter stays explicit-only (Spring parity: `getActiveProfiles()` returns explicit; the merge is a condition-level view).

### D2 — Profile expressions (Spring 6.1 `Profiles` port)

New `blue-context/src/profile-expression.ts`:

- Grammar: `name` | `!expr` | `expr & expr` | `expr | expr` | `( expr )`; whitespace tolerated.
- Evaluation: `evaluateProfileExpression(expr, active: ReadonlySet<string>) → boolean`.
- `@profile(...)` accepts **one-or-more expression strings**, evaluated **OR across entries** (Q6 — Spring's `@Profile({"dev","prod"})` OR-list parity); individual entries carry the AND/NOT expressions (`@profile('dev & !local')`). AND across entries is redundant (expressible inside one entry).
- `ConfigurationProcessor` + a new `@conditionalOnProfile(expr)` (in blue-core, alongside `conditionalOnProperty` — Q7: core is the conditions home; the decorator is a core-condition consuming the injected `acceptsProfiles` capability, same architecture as `conditionalOnProperty` consuming `getProperty`) both evaluate via the shared function.
- No nesting-first-class-grammar-vs-bounded-depth (Q4): parentheses depth cap 10, malformed → `IllegalStateError` naming the expression. Fail-loud: a typo'd expression (`dev &`) silently never matching would ship as a missing feature; throwing at registration catches it in CI. Cap is a panic switch for pathological input (same rationale as P1's placeholder depth).

### D3 — Activation sources (env + CLI + the `profiles.*` namespace)

The profile configuration is a **documented `profiles.*` property namespace** (Q1 — not a dangling key; the siblings are real features of this phase):

| Property                | Meaning                                                    | Sources                                                                                                      |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `profiles.active`       | Comma-separated active profiles                            | CLI `--profiles.active=dev,prod`, env `BLUE_PROFILES_ACTIVE` (Spring's `spring.profiles.active` translation) |
| `profiles.default`      | Comma-separated default profiles (D1's defaults as config) | CLI `--profiles.default=…`, env `BLUE_PROFILES_DEFAULT`                                                      |
| `profiles.group.<name>` | Profile group mapping (`short` → `dev,test`)               | `profiles.group.short=dev,test` property (CLI/env `BLUE_PROFILE_GROUPS` for deployer-facing)                 |

- Read at boot in `_configureProfiles` (before file loading — P2 ordering already profiles-first).
- **Precedence within activation (Q2): CLI > env > builder `.profiles()`** — the deployer at runtime overrides the developer's baked-in defaults; among operator channels the CLI (most specific, most recent) beats env. Builder is the programmatic baseline (parallel to `defaults` being lowest in the property chain, D1).

### D4 — Boot wiring

`_configureProfiles` (blue-boot) becomes:

1. Read CLI `--profiles.active=...` → append to env.
2. Read `BLUE_PROFILES_ACTIVE` env → append (Q2 order).
3. Apply builder `.profiles()` (set on env).
   Then P2's file loader sees the final active set. `MockEnvironment` inherits D1/D2 automatically.

### D5 — `acceptsProfiles` as the public gate

`Environment` gains `acceptsProfiles(expression: string): boolean` (evaluates against the effective active set, D1 + D2) — the single gate `@profile`/`@conditionalOnProfile`/manual consumers use. `likeEnvironment` shape updated to include it (P0 guard).

## 4 · Project structure

```
packages/blue-context/src/
  profile-expression.ts        NEW  — evaluateProfileExpression (grammar, depth cap, errors)
  environment.ts               EDIT — acceptsProfiles, effective-set accessor (D1), shape guard
  configuration.ts             EDIT — @profile expression eval; array-of-exprs OR
packages/blue-core/src/
  conditional.ts               EDIT — conditionalOnProfile (alongside conditionalOnProperty)
packages/blue-boot/src/
  application.ts               EDIT — _configureProfiles: CLI > env > builder; groups
packages/blue-context/test/
  profile-expression.spec.ts   NEW  — grammar, precedence, NOT, AND/OR, parens, depth cap, malformed
  environment.spec.ts          EDIT — default-activation, acceptsProfiles, shape guard
packages/blue-core/test/
  conditional.spec.ts          EDIT — conditionalOnProfile gating
packages/blue-boot/test/
  application.spec.ts          EDIT — env/CLI activation, precedence, groups
```

## 5 · Code style

Matches P0–P2 (tsdoc, `#private`, no `any`, narrowed). The expression evaluator is a tiny Pratt-style/tokenizer (~80 lines) with exhaustive specs; no eval-family (D8/P0 rule holds — expressions parsed, never evaluated as code).

## 6 · Testing strategy

- **Expression grammar**: `dev`; `!dev`; `a & b`; `a | b`; `(a | b) & c`; precedence (`&` binds tighter than `|` — verify); whitespace; empty → false/error; malformed (`& a`, `a &`, `!!a`, unbalanced paren) → `IllegalStateError` naming the expr; depth cap 10.
- **Default activation**: nowhere-active → defaults gate; explicit active → defaults ignored; conditional + expression both honor the effective set.
- **Activation sources**: env `BLUE_PROFILES_ACTIVE` and CLI `--profiles.active=` both activate; precedence CLI > env > builder (Q2); groups expand.
- **Shape guard**: `likeEnvironment` includes `acceptsProfiles`; existing `environment.spec.ts` pins updated.

## 7 · Boundaries

- **Always:** full suite + `pnpm lint` + `prettier --check`; existing P0–P2 specs stay green (except the documented `@profile` exact-match → expression widening); no eval-family; no new deps.
- **Ask first:** changing `activeProfiles` getter semantics (explicit-only stays); new env-var names beyond `BLUE_PROFILES_ACTIVE`/`BLUE_PROFILE_GROUPS`; grammar changes.
- **Never:** evaluate expressions via `new Function`/`eval`; let default-profiles silently merge into `activeProfiles` (explicit-only contract); break P2's profile-aware file loading.

## 8 · Success criteria (testable)

1. `acceptsProfiles('prod')` true with explicit `prod`; with `defaultProfiles=['prod']` + no explicit → true; with explicit `dev` + defaults `prod` → false (defaults ignored).
2. `evaluateProfileExpression`: all grammar cases pass incl. precedence + parens + NOT; malformed/depth-cap throw with the expression named.
3. `@profile('!prod & (dev | test)')` gates a config entry correctly in both the processor and `conditionalOnProfile`.
4. `BLUE_PROFILES_ACTIVE=prod` activates `prod` in a boot; `--profiles.active=dev` activates `dev`; combined → CLI wins for conflicting entries (per Q2); groups expand (`short` → `dev,test`).
5. P2 loader still stacks `application-{profile}.json` from the final active set.
6. Full suite / lint / format / graft green.

## 9 · Rollout

1. `profile-expression.ts` + spec (pure evaluator).
2. `environment.ts`: `acceptsProfiles` + effective-set accessor + shape guard; spec.
3. `@profile` + `ConfigurationProcessor` expression wiring; `@conditionalOnProfile` in blue-core; specs.
4. Boot `_configureProfiles`: env/CLI activation, precedence, groups (D3/D4); specs.
5. Full suite; ADR (AD-14).

## 10 · Open questions

- **Q1 — CLI flag name (resolved → `--profiles.active=…` via a real `profiles.*` namespace)**: the namespace is deliberate — `profiles.active`, `profiles.default`, `profiles.group.<name>` are all real P3 features (Spring's `spring.profiles.*` shape); not a dangling key. Env analogs `BLUE_PROFILES_ACTIVE`/`BLUE_PROFILES_DEFAULT`/`BLUE_PROFILE_GROUPS`.
- **Q2 — Activation precedence (resolved → CLI > env > builder)**: deployer runtime overrides developer defaults; CLI is the most-specific operator channel; builder is the programmatic baseline (parallel to `defaults` lowest in the property chain).
- **Q3 — Effective-set location (resolved → environment-internal accessor)**: `activeProfilesOrDefaults` on the environment, consumed by every gate — single source of truth; no gate-side duplicated fallback (one answer to "what's active").
- **Q4 — Grammar depth/robustness (resolved → depth cap 10 + malformed throws)**: fail-loud — a malformed expression silently never matching ships as a missing feature; throwing with the expression named catches it at registration/CI. Cap = panic switch for pathological nesting (P1 rationale).
- **Q5 — Profile groups config source (resolved → `profiles.group.*` property namespace + `BLUE_PROFILE_GROUPS`)**: groups are `profiles.group.<name>=…` properties (CLI/env), with `BLUE_PROFILE_GROUPS` as the deployer-facing env form (Spring's `spring.profiles.group.*`).
- **Q6 — Multiple `@profile` entries (resolved → OR across entries)**: Spring OR-list parity; AND is expressible within a single entry, so array-AND would be a redundant second form.
- **Q7 — `conditionalOnProfile` placement (resolved → blue-core)**: core is the conditions home — the decorator is a core-condition consuming the injected `acceptsProfiles` capability (same architecture as `conditionalOnProperty` consuming `getProperty`). `@profile` stays in context (tied to `ConfigurationProcessor` metadata).
