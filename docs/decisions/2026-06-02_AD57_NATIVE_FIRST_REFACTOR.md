# AD-57: Native-first refactor — drop Ramda & Arcsecond, dissolve `@ndigo/parser` into `@ndigo/core`

**Date:** 2026-06-02
**Status:** Accepted — implemented June 2026 (see plan + migration doc).

## Context

Benchmarks showed Ramda and Arcsecond carry significant runtime cost (3×–210×
slower than native equivalents on hot paths). Phase I of the glob-pipeline
work had already replaced the four most expensive Arcsecond parsers. This
decision completed the "Native First" initiative: dissolve `@ndigo/parser`
(whose only remaining rationale was wrapping Arcsecond) into `@ndigo/core`,
rewrite every Ramda caller in native TypeScript, delete unused transducer
infrastructure, and remove Persona Cookie legacy code.

## Evidence

- Plans: `docs/plans/2026-06-02_NATIVE_FIRST_REFACTOR.md`;
  `docs/migrations/2026-06-12_NATIVE_FIRST_REFACTOR.md` (status Completed,
  commit `4a785d0`).
- Package removal: `packages/ndigo-parser` does not exist today; deleted in
  commit `03d41b73` (2026-06-03,
  `refactor: remove Ramda, Arcsecond, and @ndigo/parser`) — verified via
  `git log --diff-filter=D -- packages/ndigo-parser/package.json`.
- No `ramda`/`arcsecond` anywhere: `grep -rl` over all `package.json` files
  in `packages/` returns none.
- Parser moved into `@ndigo/core`: `packages/ndigo-core/src/{url-glob,keypath-expression,wildcard-expression,wildcard-exp}.ts` present.
- Ramda/date-fns removal from `@ndigo/util` completed 2026-06-11/12 (commit
  `4a785d0`): migration doc tables removed `ramda ~0.32.0`, `date-fns`,
  `date-fns-tz`, `types-ramda`; retained `seedrandom` and `slug`.
- Transducer removal: `packages/ndigo-core/src/transducer.ts` and
  `packages/ndigo-http/src/transformers/transducer-transformer.ts` targeted
  by Phase 0 of the plan (no external consumers).

## Decision

- **D-1 — dissolve `@ndigo/parser` into `@ndigo/core`:** after Arcsecond is
  gone the package's Integration-Layer rationale evaporates; move its
  remaining parsers (`url-glob`, `keypathExpression`, `wildcardExpression`,
  brace/sequence/posix/glob-chars helpers) into `@ndigo/core` and delete the
  `ndigo-parser` package; re-export `urlGlob`/`keypathExpression`/
  `wildcardExpression` from `@ndigo/core`'s index.
- **D-2 — drop Arcsecond:** rewrite the last consumer
  (`matrixExpression`, `@ndigo/http` parsers) as hand-rolled (mirroring
  `cookieExpression`/`queryExpression`) and remove the dependency; existing
  matrix-expression tests must pass unchanged.
- **D-3 — drop Ramda, go straight to native at the call site:** rewrite each
  caller (`pipe`→chained calls, `map`→`arr.map`, `cond`→`if/else`,
  `assocPath`→recursive helper, etc.) package-by-package; do **not** replace
  sub-modules with equivalent utility modules.
- **D-4 — slim `@ndigo/util`:** keep `types`, `string`, `date`, `math`;
  delete `function`, `logic`, `list`, `object`, `relation` once callers are
  rewritten, and drop the Ramda dependency.
- **D-5 — delete unused transducers:** `TransducerTransformer` (`@ndigo/http`)
  and the `@ndigo/core` transducer protocol types/classes have no consumers
  outside their own tests.
- **D-6 — remove Persona Cookie legacy code:** `to-piped-string.ts` /
  `from-piped-string.ts` (unexported) deleted. Delete `fsGlob` (zero external
  consumers).
- **Out of scope:** `@ndigo/util/date` (date-fns) and `@ndigo/util/math`
  (seedrandom) are not hot paths; `@ndigo/model` (objectmodel) is a separate
  concern. Gates after every phase: `pnpm build && pnpm test` (and lint at
  the end).

## Consequences

- `@ndigo/parser` and its Arcsecond coupling are gone as of 2026-06-03
  (`03d41b73`); glob/path/keypath/wildcard parsing primitives now live in
  `@ndigo/core`.
- `@ndigo/util` shed Ramda, date-fns, date-fns-tz (and later the curried
  string wrappers) in `4a785d0`; the `safe-regex` pre-check and 1000-entry
  LRU were added to `toRegExp` as collateral hardening.
- No `ramda`/`arcsecond` dependency remains in any package manifest; the
  `@ndigo/eslint-plugin` integration-layer encapsulation list was updated to
  drop Ramda (no longer needs encapsulating).

## References

- Plans: `docs/plans/2026-06-02_NATIVE_FIRST_REFACTOR.md`,
  `docs/migrations/2026-06-12_NATIVE_FIRST_REFACTOR.md`
- Package removal: commit `03d41b73` (2026-06-03)
- Util dependency removal: commit `4a785d0` (2026-06-11/12)
- Implementation: `packages/ndigo-core/src/{url-glob,keypath-expression,wildcard-expression}.ts`;
  no `ndigo-parser` package, no `ramda`/`arcsecond` in any `package.json`
- Related: [AD-34](2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md) (TypeScript
  native layer)

## Revisit Trigger

Revisit only if a hot-path pattern again requires the utilities that were
deleted natively (e.g. a recursive deep-assoc), and only with fresh
benchmark evidence — the default is native TypeScript at the call site.
