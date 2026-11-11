# AD-15: Typed configuration binding v2 (`@configurationProperties` — Phase 4)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D5 + Q1–Q8 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE4.md`

## Background

P1 delivered typed _lookup_ (`getPropertyAs` via ConversionService). The
existing `@ConfigurationProperties(prefix)` + manual
`resolveConfigurationProperties(ctor, ctx)` in ndigo-boot bound `@property`
fields to **raw** values (no conversion), required a manual call (never
auto-registered), and its failures were silent no-ops (`isValid` only). P4
makes typed config classes bind automatically at refresh — the payoff that
turns environment config into real typed objects.

Decorator naming follows the JS-standard **camelCase** convention (the user's
explicit call) — consistent with the repo's `@property`, `@entry`, `@profile`.

## Decision

**D1 — `@configurationProperties` (renamed) + automatic registration.**
`ConfigurationProperties` → `configurationProperties` — **clean cutover (Q1)**:
ndigo is pre-1.0, no backward-compat alias; the PascalCase export is removed
outright. The `ConfigurationProcessor` detects the decorator on registered
`@configuration` classes and registers the bound instance as an **entry bean**
at refresh, keyed by the **camelCase-derived class name (Q2)** (`ServerConfig`
→ `serverConfig` — the repo's `@entry serverConfig()` bean idiom) — consumed
via `context.getValue('serverConfig')` (Q6: it's an entry; no injection
machinery). Binding reads through the environment's **`getPropertyAs`** (P1
conversion + fail-loud). `resolveConfigurationProperties` is **kept (Q7)** as
the binder's callable core for ad-hoc/off-refresh use.

**D2 — `@defaultValue('string')`.** Field decorator for the missing-property
fallback, **string-then-convert (Q5)**: defaults are property-shaped (env /
files / CLI all yield strings) and ride the exact `getPropertyAs` conversion
path — one conversion semantics for real values and defaults.

**D3 — `@nested` + relaxed binding.** Bare `@nested` flag on a
`@property('prefix')` field (Q3, option b): one prefix mechanism
(`@property`), one recursion flag (`@nested` = bind recursively into this
plain-class field); nested classes undecorated; deep nesting repeats the pair.
**Relaxed binding is opt-in per class (Q8)** via
`@configurationProperties('server', { relaxed: true })` — exact keypaths are
the default (`@property('host-name')` already declares kebab explicitly);
silent kebab→camel matching would reintroduce the "typo silently doesn't bind"
failure mode the P0–P4 arc eliminates.

**D4 — Binding failures fail refresh (fail-fast, Q4).** First error throws,
naming class.field + attempted value + target type (the reference framework's
`ConfigurationPropertiesBindingPostProcessor` parity). Binding errors are
usually dependent (a wrong prefix breaks every field beneath it), so
aggregate reporting lists cascading noise.

**D5 — Identity & timing.** Bound instances are singletons in the context
(one per class); binding happens after the fully-prepared environment
(P3's profiles/files/CLI final) so profile-specific values bind correctly.

## Consequences

- `@configurationProperties`, `@defaultValue`, `@nested` are the config-class
  surface; the PascalCase export is gone (pre-1.0 cutover).
- Auto-registration makes typed config a first-class DI citizen
  (`getValue('serverConfig')`); manual `resolveConfigurationProperties`
  remains for ad-hoc binding.
- Converted fields, fail-loud refresh, opt-in relaxed binding — consistent
  with the arc's fail-loud, single-conversion-path posture.

## Revisit Trigger

Revisit if: (a) relaxed binding needs to become default (only with a
fail-loud relaxation for typo'd keys — e.g. unmatched relaxed keys throwing);
(b) a config-class needs validation before binding (P6's zod validation layers
on the bound instance); (c) origin tracking (P5) needs per-field source info
(the binder can expose per-field origins from the index's retained winners).
