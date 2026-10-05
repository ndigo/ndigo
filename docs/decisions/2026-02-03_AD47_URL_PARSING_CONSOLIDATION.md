# AD-47: Consolidate query/matrix string parsing into `@blue/http`

**Date:** 2026-02-03
**Status:** Accepted — implemented 2026-02-06 (759 lines removed from
`@blue/router`)

## Context

Query-string and matrix-string parsing/stringification were triplicated across
`@blue/parser`, `@blue/http`, and `@blue/router` because `@blue/router` did not
depend on the other two packages and duplicated the code (~95% identical query
parser; matrix parsers cloned). The `@blue/http` implementation was newer, used
a cleaner `Parser`/`Stringifier` class pattern, and belongs with HTTP protocol
concerns.

## Evidence

- `docs/plans/2026-02-03_URL_PARSING_DUPLICATION.md` quantifies the duplication
  (~300–400 lines across 6 files) and weighs four options: router depends on
  parser/http (A), new `@blue/url` package (B), promote to `@blue/util` (C),
  parser canonical (D).
- `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md` (COMPLETE)
  fixes on option A: `@blue/http` becomes canonical, `@blue/router` consumes it.
- `docs/plans/2026-02-06_CONSOLIDATION_COMPLETE.md` reports: 759 lines deleted
  from `@blue/router` (4 source + 4 test files), 167 new RFC 3986 / WHATWG /
  Matrix-URI compliance tests, 261 tests passing in `@blue/http`, router
  backward-compat re-exports.
- **Verified current homes (2026-10-04):** `packages/blue-http/src/query-string.ts`
  and `packages/blue-http/src/matrix-string.ts` are the canonical
  implementations (package root, exported from `packages/blue-http/src/index.ts`);
  the earlier `src/parsers/{query-expression,matrix-expression}.ts` parser
  combinators no longer exist (removed with `@blue/parser`/Arcsecond in
  `03d41b73` 2026-06-03). `packages/blue-http/src/transformers/url-search-params-transformer.ts`
  and query handling still live in `@blue/http`.
- Consolidation commit: `0a4bd98e` (2026-02-06) "refactor(http,router):
  consolidate query/matrix string utilities"; router dependency gained in
  `packages/blue-router/package.json`.

## Decision

- D-1 `@blue/http` is the single source of truth for query-string and
  matrix-string parse/stringify.
- D-2 `@blue/router` depends on `@blue/http` and keeps backward-compatible
  re-exports of the four utilities; the duplicated router source files are
  deleted.
- D-3 Rejected: a dedicated `@blue/url` package, promotion to `@blue/util`, and
  making `@blue/parser` canonical (coupling / bloat / circularity).

## Consequences

- 759 lines removed from `@blue/router`; HTTP gained a `MatrixString` class and
  167 specification-compliance tests (>95% adherence, deviations documented in
  `docs/reference/2026-02-06_URL_PARSING_SPECIFICATIONS.md`).
- Zero breaking changes for router consumers; `@blue/http` now owns URL string
  utilities used by routing and the transform pipeline.

## References

- Plans: `docs/plans/2026-02-03_URL_PARSING_DUPLICATION.md`,
  `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md`,
  `docs/plans/2026-02-06_CONSOLIDATION_COMPLETE.md`
- Implementation: `packages/blue-http/src/query-string.ts`,
  `packages/blue-http/src/matrix-string.ts`; commit `0a4bd98e` (2026-02-06);
  `packages/blue-router/package.json` dependency on `@blue/http`
- Related: [AD-49](2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md) (uses
  `@blue/http` URL/string utilities)

## Revisit Trigger

Revisit if URL parsing needs to be shared outside the HTTP boundary (a new
non-HTTP consumer) or if the retained URLSearchParams deviations matter to a
consumer that needs exact WHATWG parity.
