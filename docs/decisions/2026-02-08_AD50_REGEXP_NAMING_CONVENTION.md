# AD-50: RegExp constants use `camelCase` with `Rule` suffix

**Date:** 2026-02-08
**Status:** Accepted — implemented 2026-02-11 (`7d58ca0`); break enforced by
`@ndigo/no-uppercase-regexp-constants`

## Context

RegExp constants were named `UPPER_SNAKE_CASE` (`EMAIL_REGEX`, `DATE_PATTERN`)
even though a RegExp is an object value, not an uppercase constant. The style
guide calls for `camelCase` object constants; 37 RegExp constants across 5
files needed a standardized `Rule` suffix and a breaking rename (some were
public API via `@ndigo/validate`'s `formats.*` namespace).

## Evidence

- `docs/plans/2026-02-08_REGEX_NAMING_CONVENTION.md` (Completed) lists the full
  rename table — 31 constants in `@ndigo/validate` (`formats.ts`, 30 exported;
  `standard-constraints.ts`), 4 file-local in `@ndigo/http` parsers, 2 in
  `@ndigo/platform-web` `cookie-expression.ts`. `DEFAULT_DATE_FORMAT` (a string,
  not a RegExp) is excluded.
- Commit records the breaking rename: `7d58ca0` (2026-02-11)
  "refactor(validate,http,platform-web): rename UPPER_SNAKE_CASE RegExp
  constants to camelCase".
- **Enforcement verified live (2026-10-04):**
  `packages/ndigo-oxlint-plugin/src/rules/no-uppercase-regexp-constants.ts`
  flags any `UPPER_SNAKE_CASE` identifier (`/^[A-Z][A-Z0-9_]*$/`) initialized
  with a RegExp literal; registered in
  `packages/ndigo-oxlint-plugin/src/index.ts:31` and enabled as
  `@ndigo/no-uppercase-regexp-constants: "error"` in `.oxlintrc.json` (rule entry), run
  via the repo `lint` script (`package.json:20`). The rule cites
  STYLE_GUIDE §3.9.
- Introduced as an enforced oxlint rule 2026-09-05 (`0e366d9b` "lint: enforce
  naming conventions as oxlint rules").

## Decision

- D-1 RegExp constants are named `camelCase` with a `Rule` suffix
  (e.g. `emailRule`, `dateRule`) — RegExp instances are objects, so they are
  not `UPPER_SNAKE_CASE` constants.
- D-2 The rename is a breaking change for `@ndigo/validate`'s public `formats.*`
  namespace; consumers update references.
- D-3 Enforce the convention with an automated lint rule.

## Consequences

- All 37 constants renamed; the convention is now machine-enforced as an error
  across the monorepo, so `UPPER_SNAKE_CASE` RegExp declarations fail lint.
- No test files referenced the constants by name, so the rename was
  low-risk beyond the public `formats.*` surface.

## References

- Plan: `docs/plans/2026-02-08_REGEX_NAMING_CONVENTION.md`
- Implementation: `packages/ndigo-oxlint-plugin/src/rules/no-uppercase-regexp-constants.ts`,
  `.oxlintrc.json` (`@ndigo/no-uppercase-regexp-constants: error`); commits
  `7d58ca0` (2026-02-11), `0e366d9b` (2026-09-05)
- Related: [AD-45](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md) (rule plugin)

## Revisit Trigger

Revisit if a consumer still ships `UPPER_SNAKE_CASE` RegExp constants in a
migration-in-progress package and needs a transitional allowance, or if the
`Rule` suffix convention should extend to other object-literal constants.
