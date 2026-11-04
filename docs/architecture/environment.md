# Environment Architecture — Design & Decisions

The Ndigo environment is a six-phase port of **Spring's environment model**
(PropertySource / MutablePropertySources / profiles / `@ConfigurationProperties` /
`EnvironmentPostProcessor`), translated to **JavaScript-native structures** with
fail-loud semantics throughout. This document is the "why" — the decisions,
tensions, and how they resolved. The decision records hold the full rationale;
this is the map.

## Design pillars

1. **Port semantics, not structures.** Spring's implementation (iterate every
   source per lookup, subclass zoo, `LinkedHashMap` ceremony) is Java-shaped.
   Ndigo uses a `Map`-backed registry + prototype-chain/flat index strategies —
   the P0 research table rejected radix/ART/QP-trie/HAMT/codegen accessors for
   config-size exact lookups (native objects & `Map` win). **(P0)**
2. **Bench drives defaults, not taste.** The representative-workload rule
   (≥10% median win, no cell ≥10% regression, mixed-mutation within margin;
   ties to prototype) chose `PrototypeChainIndex` as the default on both
   platforms — lookup costs were within noise and prototype's lazy mutation
   won the sustained case. `{ index: 'flat' }` remains the opt-in. **(P0, D6)**
3. **Fail-loud everywhere.** Missing-required throws; malformed profile
   expressions throw; conversion failures throw; customizer failures fail
   boot; invalid environments fail boot with every violation. A typo that
   silently never-matches is the bug the whole arc eliminates. **(P0–P6)**
4. **Replace, never mutate.** Sources are captured (null-prototype copies),
   replaced, or reordered — in-place edits are declared unsupported where they
   shadow (flat index, placeholder cache). `process.env` is snapshotted. **(P0/D7, P1)**
5. **Single conversion path.** `@defaultValue` strings, placeholders, and real
   property values all ride `getPropertyAs`/ConversionService — no second
   semantics for defaults. **(P4)**
6. **One source of truth per contract.** The environment owns what's active
   (`activeProfilesOrDefaults`); `PrecedenceDoc` pins the documented chain;
   `@environment` schemas _are_ the config contract. **(P3, P2, P6)**
7. **No eval-family.** Profile expressions and keys are parsed, never
   `new Function`'d — CSP-safe and scanner-clean. (D8 holds for all phases.)
8. **JS-standard camelCase decorators.** `@property`, `@entry`, `@whenProfile`,
   `@configurationProperties`, `@defaultValue`, `@nestedConfig`, `@environment`.
   Pre-1.0 clean cutovers (no PascalCase aliases). **(P4)**

## The precedence chain (the doctrine)

```
CLI → boot properties → process.env → .env → application-{profile}.json
     → application.json → defaults
```

Deployer-over-developer (operator at runtime overrides baked-in defaults);
among operator channels, CLI is most specific. `PrecedenceDoc` in ndigo-boot is
the canonical list — the doc table and the integration test both reference it,
so doctrine cannot drift.

## Key tensions & how they resolved

| Tension                                            | Resolution                                                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origins are flat-only; the default is prototype    | Optional `originOf?` on the index — `null` on prototype (structural winner not stored); strategy-local later fix (P5/Q1)                            |
| Refresh scope                                      | Minimal: rebuild + clear caches; customizers don't re-run (double-apply footgun); platform snapshots are the platform's own chain (P5/Q4)           |
| Relaxed binding vs silent key drift                | Opt-in per class — exact keypaths default, `{ relaxed: true }` for kebab↔camel (P4/Q8); typo'd env keys stay fail-loud                              |
| Profile defaults docstring vs reality              | `defaultProfiles` was documented-but-dead; P3 made the environment own the effective set — defaults gate only when nothing explicit (Spring parity) |
| Config profile files as separate sources vs merged | Chain whole-subtree first-wins would shadow nested overrides; all files deep-merge into one `application` source (P2, impl-corrected)               |
| Fail-fast vs aggregate                             | Dependent errors (binding) → fail-fast; independent config-shape violations (validation) → aggregate report (P4/Q4 vs P6/Q1)                        |
| `@nestedConfig` prefix source                      | Field decorators can't read types; the field name is the sub-prefix and the author provides the initializer (P4)                                    |
| Type conversion targets                            | TS types are compile-time-only; `@property(path, Type)` declares the runtime target (P4, impl-corrected)                                            |

## Security posture

- **No eval** anywhere in the environment stack.
- **`__proto__`-safe** captures (null-prototype copies; spread-snapshot for
  `process.env`).
- **Browser allow-list**: `importMetaEnv` exposes only `VITE_`-prefixed keys
  (Vite-detected); the boundary is documented as normative — any
  client-visible source content is client-visible by definition.
- **`.env` never overrides** a set env var (12-factor).
- Validated, fail-loud boot = config drift caught in CI, not prod.

## Roadmap status

**Complete** (commits `f79d5dc3` .. `b8cf9851`):

| Phase | Delivered                                                                   |
| ----- | --------------------------------------------------------------------------- |
| P0    | Named, ordered sources + JS-native index strategies                         |
| P1    | Placeholders (`${key:default}`, cycle guards), typed reads, CLI args        |
| P2    | Standard sources + documented precedence (`PrecedenceDoc`)                  |
| P3    | Profiles: expressions, defaults, env/CLI activation, groups                 |
| P4    | Typed config binding: `@configurationProperties`, defaults, nested, relaxed |
| P5    | Origins (`originOf`), `EnvironmentCustomizer`, formal `refresh()`           |
| P6    | Zod validation: `@environment`, aggregate fail-loud boot                    |

**Deferred / revisit triggers** (from the decision records): prototype-chain origins;
per-keypath origin granularity; validation-per-bind; coercive (transformative)
validation; profile groups referencing groups. All additive — the seams exist.

## Reading order

1. Guide 03 (usage) → Reference: Environment API (surface)
2. The environment decision records (rationale, oldest to newest)
3. This document (map) + Phase plans under `docs/plans/2026-09-08_ENVIRONMENT_*`
