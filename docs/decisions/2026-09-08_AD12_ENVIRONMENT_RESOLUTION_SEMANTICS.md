# AD-12: Environment resolution semantics — placeholders, typed lookup, CLI args (Phase 1)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D5 + Q1–Q8 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE1.md`

## Background

Phase 0 (AD-11) delivered named, ordered property sources + a strategy index
behind `Environment`. What the resolver still lacked was _resolution
semantics_: no placeholder interpolation (`${key}`), no typed reads (everything
is `JSONValue`), and CLI args were accepted by `run(...args)` but **ignored**
(`Application._configurePropertySources` received them and dropped them).

The reference `PropertyPlaceholderHelper`, `ConvertiblePropertyResolver`
(`getProperty(key, Class)` throwing `ConversionFailedException`), and
`CommandLinePropertySource` are the references. ndigo-core already ships a
`ConversionService` (`createConversionService` with built-in
UUID/Date/JSON/Number/Boolean/Array converters) — unused by the environment.

## Decision

**D1 — Placeholder resolution `${key}` / `${key:default}`, lazy-cached.**
New `placeholder-resolver.ts` resolves `${...}` occurrences (supporting inline
defaults and nesting) at resolver lookup time, only for string values
containing `${`. **Cycle guard** (Q3): in-progress key set → `IllegalStateError`
naming the cycle (`circular placeholder reference: a → b → a`) — a depth cap
cannot catch cycles; a depth cap of 10 remains only as a panic-switch for
runaway non-cyclic nesting. **Unresolvable** (Q4): lenient passthrough in
`getProperty` (the de-facto escape under Q2's no-escape decision);
`getRequiredProperty` throws a distinct "could not be resolved" error (key
exists but unresolved ≠ missing). **No escape syntax** (Q2): reference parity (no
`\${` exists); a literal `${key}` matching no property passes through; a literal
matching a real key is substituted (documented limitation; store such literals
indirectly). **Cache** (Q7): per-key `Map<key, resolved>` engaging only
`${`-bearing values, **cleared wholesale on registry version change** — exact
under the supported mutation API and transitive through references; in-place
map edits may lag the cache (replace-not-mutate doctrine, documented). Eager
resolve-at-build rejected (forces flat + rebuild-per-mutation — the model P0's
bench rejected). `hasProperty` answers raw presence, never placeholder-resolved.

**D2 — Typed lookup via ndigo-core ConversionService.** `PropertyResolver`
gains `getPropertyAs(key, targetType, defaultValue?)` and
`getRequiredPropertyAs(key, targetType)`; `AbstractEnvironment` delegates.
`{ conversionService }` resolver option (Q8), default `createConversionService()`
— same config cabinet as `{ index }`, per-instance isolated, threads through
existing `ResolverOptions` with zero new constructor surface. Identity
short-circuit when already the target type. **Failure semantics** (Q5): key
missing → `defaultValue` (no conversion); key present but unconvertible →
`IllegalStateError` naming key, value, target type (silent `undefined` would
hide config shape bugs via default fallback); NaN rejected. Distinct errors for
missing / unresolved placeholder / conversion failure.

**D3 — CLI args as the `commandLine` source.** New `cli-arguments.ts`
(`parseCommandLineArgs`): `--key=value`, `--key value`, bare `--flag` → `true`
(Q1 — minimist-style; typed reads: `getPropertyAs('debug', Boolean)` survives
identity, while the reference `''` would invert flag presence into disabled),
`--` terminator, repeated keys last-wins, **positionals ignored** (Q6 —
The reference `CommandLinePropertySource` behavior; `process.argv` exposes them
natively). Boot wiring: `_configurePropertySources` does
`addFirst('commandLine', parsed)` when non-empty — top of the precedence chain,
beats every other source. Named per P0 semantics (anchorable/replaceable).

**D4/D5 — Composition and errors.** `getPropertyAs` resolves placeholders
first, then converts. All resolver-side failures throw `IllegalStateError`
(no new error classes).

## Consequences

- New modules in `@ndigo/context`: `placeholder-resolver.ts`, `cli-arguments.ts`;
  `property-resolver.ts` gains placeholder hook + resolution cache + typed
  lookups + `{ conversionService }` option; `environment.ts` widens
  `PropertyResolver`/`Environment` with the two typed methods and delegates.
- `@ndigo/boot` wires CLI args into the environment (`addFirst('commandLine')`),
  making `run('--key=value')` actually work — fixes dead args.
- Behavior changes (pre-1.0, accepted): `getProperty` of a `${`-bearing value
  now interpolates (values containing literal `${}` semantics change);
  `getRequiredProperty` throws a distinct unresolved-placeholder error.
- Hot path: plain values skip placeholder resolution entirely; cache engages
  only `${`-bearing values; no per-lookup allocations introduced.

## Revisit Trigger

Revisit if: (a) a real need for `\${` escaping emerges (purely additive);
(b) an `ApplicationArguments`-style positional API is wanted (parser skip makes
collection additive); (c) P2's config-file loading needs placeholder support at
load time (the resolver hook already covers it — extend, don't fork); or
(d) conversion needs change → `ConversionService` is injectable per instance.
