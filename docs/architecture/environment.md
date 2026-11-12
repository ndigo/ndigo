# Environment & Configuration

The environment is a JavaScript-native port of [Spring Boot's configuration model](https://docs.spring.io/spring-boot/reference/features/external-config.html) — property sources, profiles, `@ConfigurationProperties`, and environment post-processing — with fail-loud semantics throughout. This page covers the design principles, the precedence rules, and the tensions they resolve.

## Design Principles

1. **Port semantics, not structures.** Spring's implementation (iterate every source per lookup, subclass zoo, `LinkedHashMap` ceremony) is Java-shaped. Ndigo uses a `Map`-backed registry plus prototype-chain and flat-index strategies; the research table rejected radix/ART/QP-trie/HAMT/codegen accessors for config-size exact lookups (native objects and `Map` win).
2. **Bench drives defaults, not taste.** The representative-workload rule (≥10% median win, no cell ≥10% regression, mixed-mutation within margin; ties to prototype) chose `PrototypeChainIndex` as the default on both platforms — lookup costs were within noise and prototype's lazy mutation won the sustained case. `{ index: 'flat' }` remains the opt-in.
3. **Fail loud everywhere.** Missing-required throws; malformed profile expressions throw; conversion failures throw; customizer failures fail boot; invalid environments fail boot with every violation. A typo that silently never-matches is the bug the whole arc eliminates.
4. **Replace, never mutate.** Sources are captured (null-prototype copies), replaced, or reordered — in-place edits are declared unsupported where they shadow (flat index, placeholder cache). `process.env` is snapshotted.
5. **Single conversion path.** `@defaultValue` strings, placeholders, and real property values all ride `getPropertyAs`/`ConversionService` — no second semantics for defaults.
6. **One source of truth per contract.** The environment owns what's active (`activeProfilesOrDefaults`); `PrecedenceDoc` pins the documented chain; `@environment` schemas _are_ the config contract.
7. **No eval-family.** Profile expressions and keys are parsed, never `new Function`'d — CSP-safe and scanner-clean.
8. **JS-standard camelCase decorators.** `@property`, `@entry`, `@whenProfile`, `@configurationProperties`, `@defaultValue`, `@nestedConfig`, `@environment`. Pre-1.0 clean cutovers (no PascalCase aliases).

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
