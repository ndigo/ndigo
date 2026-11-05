# Environment Phase 1 — Placeholders, Typed Lookup, CLI Args

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q8)
**Roadmap:** Phase 1 of the Environment roadmap, building on Phase 0 (committed `f79d5dc3`, AD-11). Phase 2 (standard sources + documented precedence) consumes this phase's source-ordered registry.

## 1 · Objective

Phase 0 delivered named, ordered property sources + a strategy index. Phase 1 gives the resolver its **resolution semantics** — the three features that make `Environment` usable for real config:

1. **Placeholders** — `${key}` and `${key:default}` referencing other properties (Spring's `PropertyPlaceholderHelper` contract).
2. **Typed lookup** — `getPropertyAs(key, Type)` with conversion from string (number/bool/array/date/…), reuse of ndigo-core's existing `ConversionService` + built-in converters.
3. **Command-line args** — `--key=value` / `--key value` parsed into a first-class named source at the top of the precedence chain; fixes `run(...args)` being **dead today** (args are accepted and ignored).

User stories:

- As an app, I can write `server.port=${PORT:8080}` in a config object and resolve it through the environment.
- As a config consumer, I can read `context.environment.getPropertyAs('server.port', Number)` and get a `number`, with conversion failures surfaced loudly.
- As a deployer, I can override any property with `--server.port=9000` and it beats every other source.

Non-goals (explicit): config files, env-var relaxation matching, default-profile activation, `@ConfigurationProperties` binding v2, origin tracking — those are P2/P3/P4/P5.

## 2 · Current state (evidence)

| Area                | Today                                                                                                                                                                                                                                                                                                                   | Gap                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Placeholders        | None — `getProperty` returns raw values                                                                                                                                                                                                                                                                                 | Entire feature                                                                  |
| Typed lookup        | `getProperty(key, defaultValue)` returns `JSONValue \| undefined`; no conversion                                                                                                                                                                                                                                        | No `getPropertyAs`                                                              |
| Conversion infra    | **ndigo-core `converter.ts`** has `createConversionService()` with built-in `UUIDConverter`, `DateConverter`, `JSONConverter`, `NumberConverter` (parseFloat), `BooleanConverter` (strict, throws on invalid), `ArrayConverter` (split on separator) + `canConvert`/`register`/`unregister` — unused by the environment | Wire it in                                                                      |
| CLI                 | `Application.run(...args)` and `ApplicationBuilder.run(...args)` accept `...args: string[]`; `_configureEnvironment(env, args)` passes them to `_configurePropertySources`/`_configureProfiles` which **ignore them**                                                                                                   | Parse + register as a source                                                    |
| Source-order hook   | P0's `getPropertySources().addFirst('name', obj)` + registry version counter                                                                                                                                                                                                                                            | Natural CLI insertion point                                                     |
| Converter precedent | `ndigo-platform-node/src/argument-value-converter.ts` — HTTP arg converter registry (separate concern, `resolveTypeConverter`)                                                                                                                                                                                          | Do **not** couple; environment typed lookup uses ndigo-core's ConversionService |

## 3 · Decisions (proposed — review Q1–Q8)

### D1 — Placeholder resolution: `${key}` / `${key:default}`, nested, lazy-cached

- New `ndigo-context/src/placeholder-resolver.ts`: parses template strings for `${...}` occurrences; supports inline default (`${key:default}`), and **nesting** (`${a:${b:fallback}}`).
- **Cycle guard (Q3)**: in-progress key set (keys currently being resolved); re-entry → `IllegalStateError` naming the cycle (`circular placeholder reference: a → b → a`). This is the real safety mechanism — a depth cap cannot catch cycles at all (they overflow past it, misreporting "too deep" for a cycle). A **depth cap of 10** remains only as a deliberate panic-switch for runaway non-cyclic nesting (beyond ~5 levels is always a bug), documented as such, not as the cycle mechanism.
- **Hook point**: applied in `PrototypalPropertyResolver.getProperty` — raw value fetched from the index, then if the value is a string containing `$ {`, resolved against the environment (the resolver itself, so placeholders can reference any source).
- **Lazy resolved-value cache** on the resolver: a `Map<string, JSONValue>` keyed by config key, **cleared wholesale when the registry version changes** (Q7). Only values containing `${` engage it (plain values skip — zero cost for the common case); no eviction policy needed (bounded by the config key space; version-clear prevents stale accumulation). Version-keyed invalidation is exact under the supported mutation API (`addLast`/`replace`/`remove` all bump; transitive through placeholder references). Caveat, consistent with replace-not-mutate doctrine: in-place source-map edits are visible to raw lookups but may lag the resolution cache (same class as flat's divergence; documented in the resolver tsdoc). Eager-resolve-at-build is rejected — it forces flat + rebuild-per-mutation, the exact model P0's bench rejected.
- **`hasProperty` answers raw presence (index-level), never placeholder-resolved.**
- **Unresolvable → lenient passthrough in `getProperty` (Q4)** — coupled to Q2: the "no escape syntax" decision requires a literal `${key}` matching no property to survive reads; fail-fast here would make any `${`-bearing value unreadable. Note: Spring's _framework default_ is actually strict (throws; `ignoreUnresolvablePlaceholders` defaults to `false`) — we adopt its _lenient opt-in mode_ deliberately, and push strictness down to required reads. `getRequiredProperty` **throws** when the final value still contains `${`, with a distinct message (`Required property "x" could not be resolved: unresolved placeholder "${MISSING}" in value "…"`) — the key exists but cannot resolve; this is different from "missing".
- **No escape syntax (Q2)** — matches Spring (its only knob is prefix replacement; there is no `\${`). Passthrough is the de-facto escape (a `${key}` matching no property passes through verbatim); a literal matching a real key is substituted — document the limitation (store such literals indirectly via another property). `\${` is purely additive later if needed.

### D2 — Typed lookup via ndigo-core ConversionService

- `PropertyResolver` gains `getPropertyAs(key, targetType, defaultValue?)` and `getRequiredPropertyAs(key, targetType)`; `AbstractEnvironment` delegates like the other lookups.
- Resolver option **`{ conversionService }`** (Q8 — `createConversionService()` default, ndigo-core built-ins cover string→number/boolean/date/json/array/UUID; platform layers inject their own by passing the option through the resolver's existing `ResolverOptions`). Rationale: it's the same knob-class as `{ index }` — lives in the resolver options cabinet, per-instance isolated (no singleton global state), additive with a sane default, and threads through the environment constructors with **zero new surface** (they already forward `ResolverOptions`).
- **Identity short-circuit**: value already the target type → passthrough without conversion (`canConvert` check or `typeof` guard).
- **Conversion failure → `IllegalStateError`** with key, value, and target type in the message (fail-fast on typed config reads; NaN from `NumberConverter` counts as failure — the resolver rejects it, since `NumberConverter.convert` itself returns NaN instead of throwing). The missing/wrong split (Q5): **key missing → `defaultValue` (no conversion)**; **key present but unconvertible → throw** — returning `undefined` for a bad value would silently fall back to defaults, hiding exactly the config bugs typed reads exist to catch. Spring parity: Spring's `getProperty(key, Class)` throws `ConversionFailedException` on conversion failure.
- Interface widening: `PropertyResolver` + `Environment` expose the new methods; only `AbstractEnvironment`/`MockEnvironment` implement (both inherit — no external breakage in-repo).

### D3 — CLI args: `--key=value` / `--key value`, named source `commandLine`

- New `ndigo-context/src/cli-arguments.ts`: `parseCommandLineArgs(args: string[]): JSONObject` — supports `--key=value`, `--key value`, quoted values (shell already strips quotes — nothing to unquote), `--` terminator (everything after is positional, ignored by the parser but not an error). Repeated keys: last wins (deterministic). **Non-`--` positionals: ignored (Q6)** — Spring's `CommandLinePropertySource` does the same (they never become properties); Node's `process.argv` already exposes them natively; the parser's skip leaves room to collect them later if an `ApplicationArguments`-style need appears. Documented in the parser tsdoc.
- **Bare flag** (`--debug`): value `true` (Q1 — minimist-style; Spring's `""` is a Java-ism that reads awkwardly in JS, and would _invert_ typed reads: `getPropertyAs('debug', Boolean)` on `''` fails or maps false, turning "flag present" into "disabled").
- **Wiring** (ndigo-boot): `Application._configurePropertySources(environment, args)` — if args parsed non-empty, `environment.getPropertySources().addFirst('commandLine', parsed)`. The named source is anchorable/replaceable per P0 semantics. Precedence: **top of the chain** (beats builder props, platform env, files — consistent with the roadmap's documented chain where CLI wins).
- `run(...args)` stays the API; no new builder surface.

### D4 — Placeholder + typed lookup compose

- `getPropertyAs` resolves placeholders first, then converts (a typed read of a placeholder-referenced value works).
- `getRequiredPropertyAs` throws on: missing raw value, unresolved placeholder, or conversion failure — distinct messages for each.

### D5 — Error semantics (aligned with P0/Q4)

All resolver-side failures throw `IllegalStateError` (existing precedent: `getRequiredProperty`, registry anchor). No new error classes in P1.

## 4 · Project structure

```
packages/ndigo-context/src/
  placeholder-resolver.ts    NEW  — parse/resolve ${key}, ${key:default}, nested; depth cap, cycle guard
  cli-arguments.ts           NEW  — parseCommandLineArgs (--key=value, --key value, bare flag, -- terminator)
  property-resolver.ts       EDIT — getPropertyAs/getRequiredPropertyAs; lazy resolved-value cache; options
  environment.ts             EDIT — delegate getPropertyAs/getRequiredPropertyAs; PropertyResolver+Environment widened
packages/ndigo-boot/src/
  application.ts             EDIT — _configurePropertySources: addFirst('commandLine', parseCommandLineArgs(args))
packages/ndigo-context/test/
  placeholder-resolver.spec.ts  NEW — unit: defaults, nesting, depth cap, cycle, unresolvable, literal passthrough
  cli-arguments.spec.ts         NEW — =value, space value, bare flag, repeats, -- terminator, positionals
  property-resolver.spec.ts     EDIT — typed lookup + placeholder integration (via resolver)
packages/ndigo-boot/test/
  application.spec.ts           EDIT — CLI beats builder props; absent args → no source
```

## 5 · Code style

Matches P0 modules (`#private`, tsdoc on every public symbol, no `any`, narrowed `unknown` walks, no per-lookup allocation in hot paths — the resolved-value cache is the allocation guard). One snippet of the new surface:

```ts
/** Parses CLI args (`--key=value`, `--key value`, bare `--flag` → true) into a JSONObject. */
export function parseCommandLineArgs(args: string[]): JSONObject {
    const parsed: JSONObject = {};
    let positionals = false;
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (positionals || !arg.startsWith('--')) continue; // positionals ignored (Q6)
        if (arg === '--') {
            positionals = true;
            continue;
        }
        const body = arg.slice(2);
        const eq = body.indexOf('=');
        const key = eq === -1 ? body : body.slice(0, eq);
        parsed[key] = eq === -1 ? true : body.slice(eq + 1);
    }
    return parsed;
}
```

## 6 · Testing strategy

Vitest, project suite. Observable contract only:

- **Placeholder resolver**: `${key}` resolves from the env; `${key:default}` uses default when missing; nested `${a:${b}}`; default containing `:`; depth cap exceeded → thrown (cycle guard); unresolvable → literal passthrough; empty key / malformed → literal.
- **Typed lookup**: string→number/bool/date/array (ndigo-core converters); identity passthrough when already typed; conversion failure → `IllegalStateError` (message has key/value/type); NaN rejected; default used when missing.
- **Composition**: `getPropertyAs` of a placeholder-referenced value; `getRequiredPropertyAs` distinct errors for missing/unresolved/bad-conversion.
- **CLI**: `--a=1`, `--a 1`, bare `--flag` → `true`, repeated key last-wins, `--` terminator, positionals ignored; empty array → no source registered.
- **Boot integration**: `run('--server.port=9000')` beats `properties({ server: { port: 8080 } })`; no args → registry unchanged.
- **Cache invalidation**: placeholder-resolved value recomputes after registry `replace` (version bump).

## 7 · Boundaries

- **Always:** full suite + `pnpm lint` + `prettier --check` on touched files; every existing spec stays green; no `any`; no eval-family (D8 from P0 holds).
- **Ask first:** new runtime dependencies (none expected); changing `PropertyResolver`/`Environment` interfaces beyond the two added methods; CLI syntax beyond `--key[=value]`; placeholder escape syntax.
- **Never:** placeholder resolution in `hasProperty`; conversion in `getProperty`/`getRequiredProperty` (typed reads opt in); per-lookup allocations in the hot path; mutating source maps.

## 8 · Success criteria (testable)

1. `${key}` / `${key:default}` / nested resolve through `Environment`; unresolvable passes through literally; `getRequiredProperty` throws on `${`-containing results.
2. `getPropertyAs('port', Number)` returns `number`; wrong-type input throws `IllegalStateError` naming key/value/type; identity passthrough for already-typed values.
3. `run('--server.port=9000')` yields `getProperty('server.port') === '9000'` with `commandLine` named source first in `getPropertySources()`.
4. Placeholder cache invalidates on registry mutation (replace → next lookup re-resolves).
5. Existing P0 suite + all platform/boot suites green; full monorepo `nx run-many -t test` passes.
6. `pnpm lint` clean on new files; format check clean.

## 9 · Rollout

1. `cli-arguments.ts` + spec (pure function, zero deps).
2. `placeholder-resolver.ts` + spec (pure against a `PropertyResolver`).
3. `prototypal-property-resolver` — placeholder hook + resolved-value cache + `getPropertyAs`/`getRequiredPropertyAs` + `{ conversionService }` option; extend `PropertyResolver`/`Environment`.
4. `environment.ts` delegation + abstract passthrough.
5. `application.ts` CLI wiring (`addFirst('commandLine', …)`).
6. Boot integration specs; full suite; lint/format; `graft build`; ADR (AD-12).

## 10 · Open questions

- **Q1 — Bare `--flag` value (resolved → `true`)**: minimist-style; typed-lookup correctness is load-bearing — `getPropertyAs('debug', Boolean)` on `''` fails/inverts, `true` survives as identity. Spring's `''` is a Java workaround; JS has `true` natively.
- **Q2 — Placeholder escape (resolved → none)**: Spring parity (no `\${` exists there); passthrough is the de-facto escape; a literal matching a real key is substituted (documented, workaround via another property). `\${` additive later if needed.
- **Q3 — Nesting depth cap (resolved → cycle guard primary, cap 10 as panic switch)**: in-progress key set catches cycles with a diagnostic error (`circular placeholder reference: a → b → a`); a cap cannot catch cycles at all. Depth 10 remains only as a runaway non-cyclic guard.
- **Q4 — Unresolvable in `getProperty` (resolved → lenient passthrough, strict at required)**: coupled to Q2 — no-escape requires literal `${key}` (no matching property) to survive reads; fail-fast would make any `${`-bearing value unreadable. Spring's _default_ is actually strict (throws); we adopt its lenient mode deliberately. `getRequiredProperty` throws with a distinct "could not be resolved" message (key exists but unresolved ≠ missing).
- **Q5 — Conversion failure (resolved → throw `IllegalStateError`)**: missing → `defaultValue`; present-but-unconvertible → throw (silent undefined would hide config shape bugs via default fallback). Spring parity: `ConversionFailedException`.
- **Q6 — CLI positionals (resolved → ignore)**: Spring parity (non-option args never become properties); `process.argv` already exposes them natively; `fromConfig` covers the path-arg case; parser skip leaves collection additive later. A forgotten `--` silently drops the arg — same as Spring, documented.
- **Q7 — Resolved-value cache (resolved → lazy, wholesale version-clear)**: `Map<key, resolved>` engaging only `${`-bearing values; cleared on registry version change (exact under supported mutation API, transitive through references); no eviction (config-bounded); in-place map edits may lag (replace-not-mutate doctrine, documented). Eager-at-build rejected — forces flat + rebuild-per-mutation, the model P0's bench rejected.
- **Q8 — Conversion service injection (resolved → resolver option)**: `{ conversionService }` in `ResolverOptions`, default `createConversionService()`. Same cabinet as `{ index }`; per-instance isolated (no singleton); additive with sane default; threads through environment constructors with zero new surface (they already forward `ResolverOptions`).
