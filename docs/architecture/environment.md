# Environment & Configuration

The environment is a JavaScript-native configuration model — property sources, profiles, typed configuration properties, and environment post-processing — with fail-loud semantics throughout. This page covers the design principles, the precedence rules, and the tensions they resolve.

## Design Principles

1. **Benchmarks drive defaults.** Default implementation and code paths are chosen by performance benchmarks on representative workloads, not by taste or assumption. When two strategies measure within noise of each other, the one with better sustained behavior wins; the alternative stays available as an opt-in.
2. **Fail loud everywhere.** Configuration problems are surfaced immediately instead of swallowed, so a typo or drift fails in CI rather than degrading silently in production. Missing values, bad profile expressions, conversion failures, and invalid environments raise instead of falling back.
3. **Replace, never mutate.** Configuration sources are captured and replaced or reordered as whole units; in-place edits that would shadow other sources are unsupported. The process environment is snapshotted so later changes cannot quietly alter a running configuration.
4. **One conversion path.** Default values, placeholders, and real property values all flow through the same conversion logic, so there is no second set of rules that could disagree about what a value means.
5. **One source of truth per contract.** What is active is owned in one place; the documented precedence chain is pinned in one place; environment schemas are the configuration contract.
6. **Secure parsing, not evaluation.** Profile expressions and keys are parsed rather than executed as code, which keeps the stack safe under strict content security policies and clean for static scanners.
7. **Standard JavaScript decorators.** Configuration and environment are declared with standard JavaScript decorators, keeping the model familiar to anyone who knows the language and friendly to tooling.

## Precedence Chain

```
CLI → boot properties → process.env → .env → application-{profile}.json
     → application.json → defaults
```

Deployer-over-developer (operator at runtime overrides baked-in defaults);
among operator channels, CLI is most specific. `PrecedenceDoc` in ndigo-boot is
the canonical list — the doc table and the integration test both reference it,
so the doctrine cannot drift.

## Key Tensions and Resolutions

| Tension                                            | Resolution                                                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origins are flat-only; the default is prototype    | Optional `originOf?` on the index — `null` on prototype (structural winner not stored); strategy-local later fix                                    |
| Refresh scope                                      | Minimal: rebuild + clear caches; customizers don't re-run (double-apply footgun); platform snapshots are the platform's own chain                   |
| Relaxed binding vs silent key drift                | Opt-in per class — exact keypaths default, `{ relaxed: true }` for kebab↔camel; typo'd env keys stay fail-loud                                      |
| Profile defaults docstring vs reality              | `defaultProfiles` was documented-but-dead; the environment now owns the effective set — defaults gate only when nothing explicit (reference parity) |
| Config profile files as separate sources vs merged | Chain whole-subtree first-wins would shadow nested overrides; all files deep-merge into one `application` source                                    |
| Fail-fast vs aggregate                             | Dependent errors (binding) → fail-fast; independent config-shape violations (validation) → aggregate report                                         |
| `@nestedConfig` prefix source                      | Field decorators can't read types; the field name is the sub-prefix and the author provides the initializer                                         |
| Type conversion targets                            | TS types are compile-time-only; `@property(path, Type)` declares the runtime target                                                                 |

## Security Posture

- **No eval** anywhere in the environment stack.
- **`__proto__`-safe** captures (null-prototype copies; spread-snapshot for
  `process.env`).
- **Browser allow-list**: `importMetaEnv` exposes only `VITE_`-prefixed keys
  ([Vite](https://vite.dev/)-detected); the boundary is documented as normative
  — any client-visible source content is client-visible by definition.
- **`.env` never overrides** a set env var (12-factor).
- Validated, fail-loud boot = config drift caught in CI, not prod.

## Implementation Status

The environment stack is complete:

- Named, ordered sources with JS-native index strategies
- Placeholders (`${key:default}`, cycle guards), typed reads, CLI arguments
- Standard sources and a documented precedence chain (`PrecedenceDoc`)
- Profiles: expressions, defaults, env/CLI activation, groups
- Typed config binding: `@configurationProperties`, defaults, nested, relaxed
- Origins (`originOf`), `EnvironmentCustomizer`, formal `refresh()`
- Zod validation: `@environment`, aggregate fail-loud boot

Deferred work is additive — the seams exist: prototype-chain origins,
per-keypath origin granularity, validation-per-bind, coercive (transformative)
validation, and profile groups referencing groups.

## Reading Order

1. [Guide 03 — Environment & Configuration](../guides/03-environment-configuration.md) (usage)
2. This page (the architecture)
