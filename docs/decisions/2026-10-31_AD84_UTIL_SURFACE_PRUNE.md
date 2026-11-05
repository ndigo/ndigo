# AD-84: `@ndigo/util` is a framework leaf toolkit, not a user-facing library

**Date:** 2026-10-31
**Status:** Accepted
**Deciders:** Framework owner (pre-1.0 surface review — issue #48, closing
HG-11 in `docs/plans/2026-10-06_CODE_REVIEW_AND_MITIGATION.md`)

---

## Context

`@ndigo/util` had been documented as a user-facing utility library — "every
symbol in the generated reference is supported public API, including helpers
the framework itself does not call" — and as the integration layer for
`seedrandom`, `slug`, and `safe-regex`. HG-11 flagged ~8 exports with no
consumers and asked whether they were public API or prunable.

A full consumer sweep of all 58 named exports across `packages/` and `apps/`
found the premise did not hold:

- **21 of 58 exports had any consumer; 13 were used by two or more packages.**
  37 exports had zero consumers, including 13 Ramda-derived arithmetic
  functions, 13 string helpers, and 3 type guards.
- The three encapsulated libraries backed only unused or replaceable code:
  `slug` → `slugify` (0 consumers), `safe-regex` → `toRegExp` (0 consumers),
  `seedrandom` → the `random → randInt → randHex → guid` chain (6 call sites).
- `seedrandom` was being used to _remove_ determinism: `random.ts` seeded
  `alea` with 256 bytes of `crypto.getRandomValues` and `{ entropy: true }`,
  so no reproducible-seed capability existed to preserve.
- 7 of 8 benchmark files were Ramda-era artifacts benchmarking native code
  only; only `like.bench.ts` imported a live export.
- The repository is unpublished (`private: true`, no publish pipeline,
  version 0.0.1) and the one adjacent consumer (todomvc) never imports
  `@ndigo/util` directly.

The "supported public API" stance therefore protected code nobody called,
while imposing a maintenance surface (tests, API docs, benchmarks) on the
framework.

## Decision

### D1 — Util is a framework leaf toolkit

`@ndigo/util` exists to serve ndigo. Its public surface is exactly the set of
helpers the framework consumes; helpers are added when a consumer appears, not
in anticipation. The package stays at layer 0 (every layer may depend on it)
and is **zero-dependency**: no third-party runtime libraries.

### D2 — Prune to the consumed surface

The retained surface is 16 symbols across three entry points:

| Entry point          | Symbols                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------ |
| `@ndigo/util`        | `getErrorMessage`, `delay`, `getEnv`, `isDevMode`, `randomHex`, `randomToken`, `is`, `like` |
| `@ndigo/util/types`  | `is`, `like`, `isString`, `isNumber`, `isFunction`, `isNil`, `isNotNil`                     |
| `@ndigo/util/string` | `toPascal`, `decodeURIComponent`, `encodeURIComponent`                                      |

Category namespace objects (`crypto`, `math`, `string`, `types`) and the
package default export are removed.

### D3 — Native crypto replaces the PRNG chain

`guid()` is replaced by `crypto.randomUUID()` at its six call sites
(`@ndigo-platform-node` ×3, `@ndigo/test` ×3). `crypto.randomUUID()` is the Web
Crypto standard, CSPRNG-backed, and already used by `@ndigo/http`,
`@ndigo/socket`, and `@ndigo/redis`; it is available in Node 24 and jsdom 30 (the
test environment). The `math` category and `seedrandom` are deleted.

### D4 — Single-consumer helpers are inlined

Helpers with exactly one consuming module move into that module rather than
staying in the shared package: `propIs` and `type` → `@ndigo/dispatcher`,
`isConstructor` → `@ndigo/factory`, `likeArray` → `@ndigo/core`. `getErrorMessage`
stays in util: moving it to `@ndigo/core` would save no dependency edges, would
require manifest changes in nine apps that do not declare core, and would pull
core's `zod`/`semver` closure into a string extractor.

### D5 — Integration-layer scope narrows to `@ndigo/dom`

With `seedrandom`, `slug`, and `safe-regex` gone, `@ndigo/dom` (`linkedom`) is
the only remaining integration layer. `INTEGRATION_LAYER_MAP` in
`@ndigo/oxlint-plugin` now maps `linkedom → @ndigo/dom`, and the stale `ramda`
and `date-fns` entries are removed.

## Consequences

- `@ndigo/util` drops from 58 to 16 exports; ~917 source lines and 21 spec files
  are deleted; `bench/` shrinks to `like.bench.ts`.
- Three runtime dependencies and two `@types` packages leave the workspace;
  `safe-regex` also leaves the root devDependencies and the pnpm catalog.
- The API reference shrinks accordingly; documentation, `ARCHITECTURE.md`,
  and `AGENTS.md` describe util as a leaf toolkit.
- Re-adding a helper is cheap while the package is unpublished: add it with a
  consumer and a test. If a genuine seeded-PRNG need appears, it returns as a
  feature with a real use case rather than as unused infrastructure.
- Consumers keep importing the retained symbols from the same entry points;
  no import path changes are required.

## Alternatives considered

- **Commit to the user-facing library (publish pipeline + full surface).**
  Rejected: no external consumer exists, and the repo's own promotion rule
  ("multiple packages → promote to `@ndigo/util`") argues against maintaining
  helpers no package uses.
- **Merge util into core.** Rejected: tooling packages (`@ndigo/generators`,
  `@ndigo/oxlint-plugin`) depend on util precisely to avoid core's `zod`/`semver`
  closure.
- **Keep the PRNG chain for determinism.** Rejected: the implementation was
  explicitly non-deterministic (`{ entropy: true }`), so nothing was lost.
