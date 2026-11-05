# Environment Reference — API Surface

The ndigo environment, in one place. Built across Phases 0–6.

> **Update (2026-10-31, AD-83):** profile gating unified on `@whenProfile`
> (class/method; either-of arguments fold to one canonical expression);
> `@nested` → `@nestedConfig`; ORM `@generated` → `@generatedColumn`.

## Core types

### `PropertyResolver` (ndigo-context)

| Member                                          | Signature   | Notes                                                         |
| ----------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `getProperty(key, defaultValue?)`               | `JSONValue  | undefined`                                                    | Keypath syntax (`server.port`, `items[0].name`); placeholder-resolved            |
| `getRequiredProperty(key)`                      | `JSONValue` | Throws when missing **or** an unresolved placeholder remains  |
| `getPropertyAs(key, targetType, defaultValue?)` | `T          | undefined`                                                    | Converts via ConversionService (identity short-circuit, fails loud on bad value) |
| `getRequiredPropertyAs(key, targetType)`        | `T`         | Throws on missing/unresolved/unconvertible, distinct messages |
| `hasProperty(key)`                              | `boolean`   | Raw presence — never placeholder-resolved                     |
| `getRawProperty(key)`                           | `JSONValue  | undefined`                                                    | Internal: skips placeholder resolution                                           |
| `originOf(key)`                                 | `string     | null`                                                         | Winning source name — top-level granularity, `null` on prototype chain           |

### `PropertySource` / `PropertySources` / `MutablePropertySources`

| Member                                           | Notes                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `wrapSource(name, obj)`                          | Captures a plain object (null-prototype; `__proto__`-safe)                                       |
| `getPropertySources()` (env)                     | The live registry                                                                                |
| `addFirst/addLast/addBefore/addAfter(name, obj)` | Ordering; unknown anchor in the `add*Before/After` positions **throws** naming available sources |
| `remove(name)` / `replace(name, obj)`            | Booleans; replace keeps position                                                                 |
| `toArray()` / `size` / `get(name)` / `version`   | Read surface; `version` drives lazy index rebuilds                                               |

### `Environment` (extends `PropertyResolver`)

| Member                                   | Notes                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `activeProfiles` / `defaultProfiles`     | Explicit vs fallback sets                                                        |
| `addActiveProfile` / `addDefaultProfile` | Mutators                                                                         |
| `acceptsProfiles(expression)`            | `dev`, `!prod`, `a & b`, `(a                                                     | b) & c` — evaluates against the effective set (defaults when nothing explicit) |
| `originOf(key)`                          | See above                                                                        |
| `refresh()`                              | Recompute from current sources (clear caches + rebuild) — environment-scope only |

### `ConfigurableEnvironment`

| Member                 | Notes                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `getPropertySources()` | The live `MutablePropertySources`                                                                                                     |
| `propertySources`      | **Deprecated compat alias** — array getter returns a fresh snapshot (mutating it is a no-op); setter = replace-all. Use the registry. |
| `merge(other)`         | Compose sources (collisions appended under `:merged`), profiles, defaults                                                             |

## Profile expressions

Grammar: `name` | `!expr` | `expr & expr` | `expr | expr` | `( expr )`. `&`
binds tighter than `|`. Whitespace tolerated. Malformed expressions and
nesting beyond depth 10 throw naming the expression. `@whenProfile(...)`
(ndigo-core) is the single profile gate — class or entry method; multiple
arguments mean either-of and fold into one canonical expression at
decoration time.

## Decorators (all camelCase per JS convention)

| Decorator                                         | Home          | Applies to   | Meaning                                                                    |
| ------------------------------------------------- | ------------- | ------------ | -------------------------------------------------------------------------- |
| `@property(path[, Type])`                         | ndigo-context | field        | Bind to keypath; optional conversion target                                |
| `@defaultValue('raw')`                            | ndigo-context | field        | Fallback (string → converted)                                              |
| `@nestedConfig`                                   | ndigo-context | field        | Bind recursively under the field name into the author-initialized instance |
| `@configurationProperties(prefix[, { relaxed }])` | ndigo-boot    | class        | Type-safe binding + auto-registration (`ServerConfig` → `serverConfig`)    |
| `@environment(zodSchema)`                         | ndigo-context | class        | Declare the environment's shape; auto-validated at boot                    |
| `@whenProfile(...expr)`                           | ndigo-core    | class/method | Profile gate; either-of arguments fold to one expression                   |

`{ relaxed: true }` enables kebab/snake → camel fallback matching
(`server.host-name` ↔ `hostName`); exact keypaths are the default.

## Boot surface (ndigo-boot)

| Builder method                                                                        | Notes                                                                         |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `run(...args)`                                                                        | **Async** — prepares environment (profiles → files → CLI) + refreshes context |
| `properties(obj)`                                                                     | The `boot` source (below files, above defaults)                               |
| `profiles(...names)`                                                                  | Programmatic profiles (lowest activation precedence)                          |
| `defaults(obj)` / `configFiles(loader)` / `customizers(...)` / `validateWith(schema)` | Documented in the guide                                                       |
| `setProfiles/setProperties/setEnvironment/...`                                        | Application-level setters                                                     |

Activation precedence: **CLI `--profiles.active=` > env `NDIGO_PROFILES_ACTIVE` >
builder `.profiles()`**. Defaults: `--profiles.default=` / `NDIGO_PROFILES_DEFAULT`.
Groups: `--profiles.group.<name>=…` / `NDIGO_PROFILES_GROUPS` (`name=m1,m2;other=…`).

## Files & env loading

- Locations `./config/,./` per file name, first-present-wins (override via
  `NDIGO_CONFIG_LOCATION`, comma-separated, `optional:`/`required:` prefixes).
- `application.json` + `application-{profile}.json` deep-merge into one
  `application` source: objects merge, scalars override, **arrays replace**.
- `NDIGO_CONFIG_IMPORT` for extra files; `dotenv` npm for `.env` (never
  overrides `process.env`).
- Browser: `BrowserEnvironment` — `importMetaEnv` (`VITE_`-prefixed only,
  Vite-detected), `bootstrap` slot (host-registered), `defaults`. Anything in
  client-visible sources is client-visible by definition (security boundary).

## Validation

`validateEnvironment(env, zodObjectSchema)` → `{ valid, issues: [{ path,
expected, actual }] }` — aggregate (all top-level violations), report-only
(no coercion writes). Type mismatches, missing keys, constraint violations all
report. Non-object schemas throw.

## Extension seams

| Seam                                         | When                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `MutablePropertySources` mutations (P0)      | Reorder/replace at any time; lazy rebuild on next lookup |
| `{ index: 'flat'                             | 'prototype' }` resolver option (P0)                      | Per-resolver strategy override (bench-chosen defaults) |
| `{ conversionService }` resolver option (P1) | Custom converter injection                               |
| `EnvironmentCustomizer` (P5)                 | Pre-context adjustment, registration order, fail-loud    |
| `refresh()` (P5)                             | Runtime recompute                                        |
| `originOf` (P5)                              | Where did this come from?                                |

## Index strategy notes

- `PrototypeChainIndex` — the historical chain; **default on both platforms**
  (lookup costs within noise; ties/mutation go to prototype).
- `FlatMergedIndex` — compiled on invalidation, zero-alloc lookups, per-key
  origin retention; opt in via `{ index: 'flat' }`. In-place map edits after
  build are invisible until the next rebuild (replace-not-mutate doctrine).
  No eval-family anywhere — expressions are parsed, never executed.
