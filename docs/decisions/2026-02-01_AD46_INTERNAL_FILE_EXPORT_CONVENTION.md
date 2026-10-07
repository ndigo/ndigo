# AD-46: Internal files (underscore-prefixed) never exported through barrels

**Date:** 2026-02-01
**Status:** Accepted — archived 2026-02-03; enforcement live via
`@blue/no-internal-file-exports`

## Context

The `_*.ts` internal-file convention (packages' private utilities) depends on
discipline: nothing stops a package barrel (`src/index.ts`) from re-exporting
`./_util`, silently widening the public API and coupling consumers to
implementation details. After Phase 1 remediation deleted seven `_util.ts`
files that were pure re-export shells, the convention needed an enforced rule,
not a guideline.

## Evidence

- `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md` (archived 2026-02-03) lays
  down the rules: internal files must contain real local utilities
  ("if you delete all re-export lines and the file becomes empty, the file
  shouldn't exist"); `_*.ts` files must not be exported from `index.ts`;
  Phase 4 (validation/enforcement) is delegated to `ESLINT_PLUGIN.md`.
- `docs/plans/2026-02-01_INTERNAL_FILE_NAMING_REVIEW.md` weighs keeping the
  hybrid naming (`_util.ts` vs `_<domain>.ts` vs descriptive) versus
  standardizing or moving to `src/internal/`.
- **Enforcement exists today (2026-10-04):**
  `packages/blue-oxlint-plugin/src/rules/no-internal-file-exports.ts` implements
  the rule — it only reports on `src/index.ts` (`/src\/index\.ts$/`) and flags
  `ExportAllDeclaration` whose source starts with `./_`.
  Registered in `packages/blue-oxlint-plugin/src/index.ts:29` and enabled as
  `@blue/no-internal-file-exports: "error"` in `.oxlintrc.json` (rule entry), run by the
  repo global `lint` script (`package.json:20`, `oxlint --type-aware
  --deny-warnings .`).
- Same-phase companion rules (`@blue/no-internal-file-imports: "error"`,
  `@blue/no-direct-integration-imports: "warn"`) live in the same plugin
  directory (see [AD-45](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md)).

## Decision

- D-1 Underscore-prefixed files (`_*.ts`) are package-internal and MUST NOT be
  re-exported from a package barrel (`src/index.ts`).
- D-2 Keep the hybrid naming (generic `_util.ts`, domain `_<domain>.ts`,
  descriptive single-algorithm) rather than standardizing to one pattern or
  moving to `src/internal/` directories — recorded in the naming review plan.
- D-3 Enforce D-1 automatically with a lint rule (`no-internal-file-exports`)
  rather than reviews.

## Consequences

- The no-export rule is enforced across the monorepo by oxlint
  (`@blue/no-internal-file-exports` = error); public API expansion through
  internal files is now a lint failure.
- Internal files continue to appear in `packages/*/src/_*.ts` (e.g.
  `packages/blue-context/src/_util.ts`) but never leave the package boundary.

## References

- Plans: `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md`,
  `docs/plans/2026-02-01_INTERNAL_FILE_NAMING_REVIEW.md`
- Implementation: `packages/blue-oxlint-plugin/src/rules/no-internal-file-exports.ts`,
  `.oxlintrc.json` (`@blue/no-internal-file-exports: error`)
- Related: [AD-45](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md)

## Revisit Trigger

Revisit if a package legitimately needs to share an internal utility across
packages (promote it to a public API instead) or if barreling moves to
directory-based `src/internal/` organization that the rule must learn to allow.

## Update (2026-10-06)

- The `no-internal-file-exports` rule now also flags **named re-exports**
  (`ExportNamedDeclaration` with a `./_`-prefixed source), not only `export *`
  (`ExportAllDeclaration`); the companion `no-internal-file-imports` rule now
  also covers `export * from '@blue/<pkg>/_…'`.
- The one live violation this surfaced — `blue-auth-core` re-exporting
  `./_decorators` from its barrel — was fixed per the revisit trigger by
  promoting the file to a public filename: `src/decorators.ts` (spec renamed to
  `test/decorators.spec.ts`; the barrel now exports `./decorators`).
