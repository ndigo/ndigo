# Environment Phase 4 — Typed Configuration Binding v2 (`@configurationProperties`)

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q8)
**Roadmap:** Phase 4 of the Environment roadmap, building on P0–P3 (`7d00d44a`, AD-11/12/13/14). P1 delivered typed _lookup_ (`getPropertyAs`); P4 makes typed _classes_ bind automatically at refresh — the payoff that turns environment config into real typed config objects.

**Naming (your call, honored):** JS-standard **camelCase decorators**. The existing Spring-flavored `@ConfigurationProperties` becomes **`@configurationProperties`** (`isConfigurationProperties`/`getConfigurationPropertiesPrefix` helpers + the module surface align). `@DefaultValue` → **`@defaultValue`**, `@Nested` → **`@nested`** (consistent with the repo's `@property`, `@entry`, `@profile`).

## 1 · Objective

User stories:

1. As an app, I write a class with `@configurationProperties('server')` + `@property('port')` fields, and the context **automatically registers a bound, typed instance** at refresh — no manual `resolveConfigurationProperties` call.
2. Bound fields are **converted** (String → number/bool/date/array via P1's ConversionService + `getPropertyAs`), with `@defaultValue` for missing properties and `@nested` for structured prefixes.
3. Binding failures are **loud**: unknown/unconvertible values fail refresh with a clear message naming field + value + type (fail-fast, consistent with P1/P3).
4. Relaxed binding: `server.host-name` in env binds to `hostName` (Spring's relaxed binding) — **only if the user opts in** (see Q8 — loose env keys vs exact keypaths).

Non-goals (explicit): P5 origin tracking + customizers, P6 validation (zod) — those layer on this; nested _validation_ beyond conversion errors; prefix _arrays_ (`server[0]`) — keep simple keypath prefixes.

## 2 · Current state (evidence)

| Area                                        | Today                                                                                               | Gap                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `@ConfigurationProperties(prefix)`          | `ndigo-boot/src/configuration-properties.ts:56` — class decorator storing `prefix` metadata         | PascalCase (→ camelCase); no auto-registration                        |
| `resolveConfigurationProperties(ctor, ctx)` | Manual: `new ctor()`, iterate `@property` fields, bind **raw `getProperty` values** — no conversion | Not automatic; no typing; `isValid` = not-undefined only              |
| `@property(path)`                           | `ndigo-context/src/configuration.ts:126` — field decorator storing path metadata                    | Shared with `@profile`/`@entry` machinery; binding reads raw values   |
| `getPropertyAs` (P1)                        | Conversion via ndigo-core `ConversionService` + identity short-circuit + fail-loud                  | Not wired into binding                                                |
| `@defaultValue` / `@nested`                 | Absent                                                                                              | Spring's `@DefaultValue`/`@NestedConfigurationProperties` equivalents |
| Registration                                | `ConfigurationProcessor` registers `@entry` beans; env consumed via `EnvironmentAware`              | No auto-registration of config-properties instances                   |

## 3 · Decisions (proposed — review Q1–Q8)

### D1 — `@configurationProperties` (renamed) + automatic registration

- Rename `ConfigurationProperties` → `configurationProperties` (**clean cutover (Q1)** — ndigo is pre-1.0, no backward-compat alias; the PascalCase export is removed outright, module docs/exports updated to camelCase).
- **Automatic binding**: the `ConfigurationProcessor` (already processes `@configuration` classes) detects `@configurationProperties` on a registered class and **registers the bound instance as an entry bean** at refresh — keyed by the **camelCase-derived class name (Q2)** (`ServerConfig` → `serverConfig`, matching the repo's `@entry serverConfig()` bean-naming idiom; deterministic derivation, consumers bind once at bootstrap), so DI consumers resolve it via `context.getValue('serverConfig')` (Q6 — it's an entry; no new injection machinery).
- Binding reads through the environment's **`getPropertyAs`** (P1 conversion + fail-loud) — not raw `getProperty`.
- `resolveConfigurationProperties` becomes the manual escape hatch (kept (Q7), delegating to the same binder — it's the binder's callable core for ad-hoc/off-refresh binding, not a competing API).

### D2 — `@defaultValue` field decorator

- `@defaultValue('8080')` on a `@property` field supplies the fallback when the property is missing — resolved as a **raw string, then converted** (Q5 — a default is _property-shaped_: env/files/CLI all yield strings, and it rides the exact `getPropertyAs` conversion path used for real values; no second semantics. A typed default param would create an asymmetry and invite aliased object literals).

### D3 — `@nested` for structured prefixes

- Bare `@nested` flag on a `@property('prefix')` field: the sub-prefix comes from the existing `@property` keypath, `@nested` adds "bind recursively into this plain-class field" — **one prefix mechanism (`@property`), one recursion flag** (Q3, option b). The nested class is a plain typed shape (no `@configurationProperties` decoration).
- Binding: field `@property('db') @nested db!: DbConfig` under a `server` base → `server.db.url` binds into `db.url`.
- Deep nesting: `@property('db') @nested` inside a nested class repeats the pair (`server.db.replica.url`).
- **Relaxed binding (Q8)**: **opt-in per class** via `@configurationProperties('server', { relaxed: true })` — exact keypaths are the default (`@property('host-name')` already declares its kebab key explicitly); relaxed translation (kebab/snake → camel field matching) only when the author opts in, so a typo'd env key stays fail-loud instead of silently not binding (the P0–P4 arc).

### D4 — Binding failures fail refresh

- During context refresh, any `@configurationProperties` class that fails to bind (missing required field without `@defaultValue`, or conversion failure) throws — naming class.field, attempted value, and target type. **Fail-fast (Q4)**: first error throws (Spring's `ConfigurationPropertiesBindingPostProcessor` parity) — binding errors are usually _dependent_ (a wrong prefix breaks every field under it), so aggregate reporting would list cascading noise; the first error explains the rest. Retry-after-fixing is the norm; no per-field collection machinery.

### D5 — Binding identity & caching

- Bound instances are **singletons** in the context (one per class, refreshed once); re-registration of the same class returns the existing instance.
- Binding happens **after** the environment is resolved (P3's profiles/files/CLI final) — it reads the fully-prepared environment, so profile-specific values bind correctly.

## 4 · Project structure

```
packages/ndigo-boot/src/
  configuration-properties.ts EDIT — camelCase rename; auto-binding via ConfigurationProcessor; getPropertyAs + @defaultValue + @nested wiring
packages/ndigo-context/src/
  configuration.ts            EDIT — @defaultValue + @nested field decorators (metadata keys)
packages/ndigo-boot/test/
  configuration-properties.spec.ts EDIT/EXTENDED — auto-registration, conversion, defaults, nested, fail-loud
```

(Most binding logic lives in ndigo-boot — it owns boot-time orchestration; ndigo-context gains only the two field decorators.)

## 5 · Code style

Matches P0–P3 (tsdoc, `#private`, no `any`, camelCase decorators). Binding reuses `getPropertyAs` so no new conversion surface.

## 6 · Testing strategy

- Auto-registration: `@configurationProperties('server')` class registered via `@configuration` → `getValue('serverConfig')` returns bound instance with converted fields.
- Conversion: string props bind to Number/Boolean/Date/array fields (P1 converters); `@defaultValue` binds + converts when missing.
- `@nested`: `server { host, port }` binds via sub-prefix; deep nesting 2 levels.
- Fail-loud (Q4): missing required + conversion failure → refresh throws naming class.field/value/type.
- Relaxed binding (Q8): env `server.host-name` → `hostName` field when opted-in.
- Old PascalCase export behavior (Q1): either removed (existing spec updated) or aliased.

## 7 · Boundaries

- **Always:** full suite + `pnpm lint` + `prettier --check`; P0–P3 specs stay green; camelCase decorators throughout; no new deps; no eval.
- **Ask first:** keeping the PascalCase alias (Q1); changing the fail-fast contract (Q4); relaxed-binding default (Q8).
- **Never:** bind raw values without conversion (P1's typed path is the contract); silent partial binding (partial config ships broken apps); auto-register without the class being `@configuration`-registered.

## 8 · Success criteria (testable)

1. `@configurationProperties('server')` class auto-registers a bound, converted singleton at refresh; fields via `@property` + optional `@defaultValue` + optional `@nested`.
2. Missing-required and conversion failures fail refresh loudly (per Q4).
3. Old `ConfigurationProperties` PascalCase is handled per Q1; module docs/export updated to camelCase.
4. Full monorepo suite green; lint/formatted; graft rebuilt.

## 9 · Rollout

1. `@defaultValue` + `@nested` decorators in ndigo-context (metadata only) + specs.
2. `@configurationProperties` rename + binder (getPropertyAs, defaults, nested, failure) in ndigo-boot + specs.
3. Auto-registration hook in `ConfigurationProcessor` + specs.
4. Relaxed binding (Q8) + full suite; ADR (AD-15).

## 10 · Open questions

- **Q1 — PascalCase alias (resolved → clean cutover)**: ndigo is pre-1.0; the `ConfigurationProperties` export is removed outright, camelCase everywhere — no backward-compat alias.
- **Q2 — Bound-instance entry name (resolved → camelCase-derived)**: `ServerConfig` → `serverConfig` (the repo's `@entry serverConfig()` bean-naming idiom; deterministic; consumers bind at bootstrap so rename-breakage is minimal).
- **Q3 — `@nested` contract (resolved → option b)**: bare `@nested` flag + `@property('prefix')` — the sub-prefix comes from `@property`, `@nested` means "bind recursively into this plain-class field"; nested classes undecorated. One prefix mechanism, one recursion flag; deep nesting repeats the pair.
- **Q4 — Failure mode (resolved → fail-fast)**: first error throws (Spring parity); binding errors are usually dependent (wrong prefix breaks every field beneath it), so aggregate reporting lists cascading noise; the first error explains the rest.
- **Q5 — Default-value type (resolved → string-then-convert)**: defaults are property-shaped (strings, like env/files/CLI) and ride the same `getPropertyAs` conversion path — one conversion semantics for real values and defaults; typed defaults would create an asymmetry and invite aliased object literals.
- **Q6 — Bound instance injection (resolved → it's an entry)**: `context.getValue('serverConfig')` — the auto-registered instance is a normal entry bean; no field-injection machinery (config classes are consumed once at bootstrap).
- **Q7 — `resolveConfigurationProperties` fate (resolved → keep)**: it's the binder's callable core — the auto path delegates to it; removing forces a workaround for ad-hoc/off-refresh binding (libraries, tests). Not a competing API.
- **Q8 — Relaxed binding (resolved → opt-in per class)**: `@configurationProperties('server', { relaxed: true })`; exact keypaths default (`@property('host-name')` already declares kebab explicitly); silent kebab→camel matching would reintroduce the "typo silently doesn't bind" failure mode the arc eliminates.
