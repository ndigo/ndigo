# AD-47: Consolidate query/matrix string parsing into `@ndigo/http`

**Date:** 2026-02-03
**Status:** Accepted — implemented 2026-02-06 (759 lines removed from
`@ndigo/router`)

## Context

Query-string and matrix-string parsing/stringification were triplicated across
`@ndigo/parser`, `@ndigo/http`, and `@ndigo/router` because `@ndigo/router` did not
depend on the other two packages and duplicated the code (~95% identical query
parser; matrix parsers cloned). The `@ndigo/http` implementation was newer, used
a cleaner `Parser`/`Stringifier` class pattern, and belongs with HTTP protocol
concerns.

## Evidence

- `docs/plans/2026-02-03_URL_PARSING_DUPLICATION.md` quantifies the duplication
  (~300–400 lines across 6 files) and weighs four options: router depends on
  parser/http (A), new `@ndigo/url` package (B), promote to `@ndigo/util` (C),
  parser canonical (D).
- `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md` (COMPLETE)
  fixes on option A: `@ndigo/http` becomes canonical, `@ndigo/router` consumes it.
- `docs/plans/2026-02-06_CONSOLIDATION_COMPLETE.md` reports: 759 lines deleted
  from `@ndigo/router` (4 source + 4 test files), 167 new RFC 3986 / WHATWG /
  Matrix-URI compliance tests, 261 tests passing in `@ndigo/http`, router
  backward-compat re-exports.
- **Verified current homes (2026-10-04):** `packages/ndigo-http/src/query-string.ts`
  and `packages/ndigo-http/src/matrix-string.ts` are the canonical
  implementations (package root, exported from `packages/ndigo-http/src/index.ts`);
  the earlier `src/parsers/{query-expression,matrix-expression}.ts` parser
  combinators no longer exist (removed with `@ndigo/parser`/Arcsecond in
  `03d41b73` 2026-06-03). `packages/ndigo-http/src/transformers/url-search-params-transformer.ts`
  and query handling still live in `@ndigo/http`.
- Consolidation commit: `0a4bd98e` (2026-02-06) "refactor(http,router):
  consolidate query/matrix string utilities"; router dependency gained in
  `packages/ndigo-router/package.json`.

## Decision

- D-1 `@ndigo/http` is the single source of truth for query-string and
  matrix-string parse/stringify.
- D-2 `@ndigo/router` depends on `@ndigo/http` and keeps backward-compatible
  re-exports of the four utilities; the duplicated router source files are
  deleted.
- D-3 Rejected: a dedicated `@ndigo/url` package, promotion to `@ndigo/util`, and
  making `@ndigo/parser` canonical (coupling / bloat / circularity).

## Consequences

- 759 lines removed from `@ndigo/router`; HTTP gained a `MatrixString` class and
  167 specification-compliance tests (>95% adherence, deviations documented in
  `docs/reference/2026-02-06_URL_PARSING_SPECIFICATIONS.md`).
- Zero breaking changes for router consumers; `@ndigo/http` now owns URL string
  utilities used by routing and the transform pipeline.

## References

- Plans: `docs/plans/2026-02-03_URL_PARSING_DUPLICATION.md`,
  `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md`,
  `docs/plans/2026-02-06_CONSOLIDATION_COMPLETE.md`
- Implementation: `packages/ndigo-http/src/query-string.ts`,
  `packages/ndigo-http/src/matrix-string.ts`; commit `0a4bd98e` (2026-02-06);
  `packages/ndigo-router/package.json` dependency on `@ndigo/http`
- Related: [AD-49](2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md) (uses
  `@ndigo/http` URL/string utilities)

## Revisit Trigger

Revisit if URL parsing needs to be shared outside the HTTP boundary (a new
non-HTTP consumer) or if the retained URLSearchParams deviations matter to a
consumer that needs exact WHATWG parity.
