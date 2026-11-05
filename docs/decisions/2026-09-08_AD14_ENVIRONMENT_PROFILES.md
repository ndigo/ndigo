# AD-14: Environment profiles completed — defaults, expressions, activation (Phase 3)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D5 + Q1–Q7 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE3.md`

## Background

Phases 0–2 (AD-11/12/13) delivered named sources, resolution semantics, and
standard sources. Profiles were stored (`activeProfiles`/`defaultProfiles`
sets, `@profile` decorator) but incomplete: `defaultProfiles` was **documented
but dead** — the env docstring promised "defaults activate when nothing
explicit" and nothing read it; `@profile` did exact string-OR matching only;
there was no `@conditionalOnProfile`; deployers couldn't activate profiles
without code changes.

## Decision

**D1 — Default-profile activation (exact parity).** `AbstractEnvironment`
owns the effective-set semantics (Q3): the active set is `activeProfiles` when
non-empty, else `defaultProfiles`, exposed as `activeProfilesOrDefaults` — the
environment is the sole authority on "what's active", consumed by every gate
(no duplicated gate-side fallback). `activeProfiles` getter stays explicit-only
(reference parity: `getActiveProfiles()` returns explicit; the merge is a
condition-level view).

**D2 — Profile expressions (the 6.1 `Profiles` port).** New
`profile-expression.ts`: grammar `name` | `!expr` | `expr & expr` | `expr |
expr` | `( expr )` (whitespace tolerated), evaluated by
`evaluateProfileExpression(expr, active)` — parsed, never eval'd. **Fail-loud
(Q4)**: paren depth cap 10, malformed → `IllegalStateError` naming the
expression (a silently-never-matching typo ships as a missing feature).
`@profile(...)` accepts one-or-more expression strings, **OR across entries
(Q6)** — the reference OR-list parity; AND is expressible within one entry.
`ConfigurationProcessor` + new `@conditionalOnProfile` (blue-core, Q7 — core
is the conditions home; the decorator consumes the injected
`acceptsProfiles` capability, same architecture as `conditionalOnProperty`)
both evaluate via the shared function.

**D3 — Activation sources + the `profiles.*` namespace (Q1, Q5).** The
profile configuration is a deliberate property namespace — not a dangling key,
all members are real P3 features:

| Property                | Meaning                          | Sources                                                |
| ----------------------- | -------------------------------- | ------------------------------------------------------ |
| `profiles.active`       | comma-separated active profiles  | CLI `--profiles.active=`, env `BLUE_PROFILES_ACTIVE`   |
| `profiles.default`      | comma-separated default profiles | CLI `--profiles.default=`, env `BLUE_PROFILES_DEFAULT` |
| `profiles.group.<name>` | profile group mapping            | property, env `BLUE_PROFILES_GROUPS`                   |

**Activation precedence (Q2): CLI > env > bulier `.profiles()`** — deployer
at runtime overriedes developer defaults; CLI is the most-specific operator
channel; builder is the programmatic baseline.

**D4 — Boot wiring.** `_configureProfiles` becomes: CLI → env → builder
(precedence), then profile groups expand, then P2's file loader sees the final
active set (ordering already profiles-first).

**D5 — `acceptProfiles(expression)` as the public gate.** `Environment`
gains `acceptProfiles(expression: string): boolean` evaluating against the
effective set (D1 + D2); `likeEnvironment` shape updated.

## Consequences

- New modules: `profile-expression.ts` (blue-context); `@conditionalOnProfile`
  (blue-core conditional.ts).
- Behavior changes (pre-1.0, accepted): `@profile` exact-match arrays become
  expression lists (widening — existing exact strings still match); defaults
  now actually gate; `BLUE_PROFILES_ACTIVE`/`--profiles.active=` activate at
  boot; groups expand.
- No eval-family anywhere (expressions parsed, not executed — P0 D8 holds).
- Precedence and namespace documented as a contract (specs pin them).

## Revisit Trigger

Revisit if: (a) grammar needs extension (e.g. regex profiles) — the evaluator
is the single extension point; (b) the `profiles.*` namespace gains a member
(extend the table + spec); (c) a deployer needs profiles-as-properties from
config files (P2's loader already merges them — the namespace is already
property-resolvable); or (d) groups need to be referencable by other groups
(recursive expansion — currently flat, documented).
