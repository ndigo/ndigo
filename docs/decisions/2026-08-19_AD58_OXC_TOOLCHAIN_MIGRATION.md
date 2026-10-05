# AD-58: OXC toolchain migration — oxlint/oxfmt, `tsc -b` retained

**Date:** 2026-08-19
**Status:** Accepted — implemented; oxlint+oxfmt are the lint/format gates,
`@blue/eslint-plugin` became `@blue/oxlint-plugin`, and `tsc -b` remains the
build.

## Context

The lint/build/test stack was TypeScript 5.9 (`tsc -b`, project references,
~29 packages), ESLint 9 + Prettier, and a dormant ESLint-installed-but-unused
`@blue/eslint-plugin`. OXC (oxc.rs) promised large speedups (oxlint ~50–100×
over ESLint; `@oxc-transform` ~10–30× over tsc emit). Three consecutive
evaluations ([2026-08-12_OXC_EVALUATION], [2026-08-19_OXC_EVALUATION_AND_MIGRATION_PLAN],
[2026-08-19_OXC_MIGRATION]) probed partial adoption — lint and formatting
first, transform-emit only behind a TC39-decorator/Symbol.metadata spike. The
decorator spike and project-references coupling decided against replacing tsc
emit; the realized decision kept `tsc -b` unchanged and adopted the OXC
tools it is genuinely good at.

## Evidence

- Root `package.json` scripts (verified today): `"lint": "oxlint --type-aware
--deny-warnings ."`, `"format": "oxfmt --write ."`,
  `"format:check": "oxfmt --check ."`, `"build": "nx run-many -t build:lib"`.
  No `eslint` or `prettier` script or entry remains.
- Root devDependencies: `oxlint ^1.85.0`, `oxfmt ^0.70.0`,
  `oxc-transform ^0.151.0`, `@oxlint/plugins ^1.85.0`, `oxlint-tsgolint ^7.0.2003`.
- `build:lib` target is still `"tsc -b tsconfig.build.json"` (verified in
  `packages/blue-core/package.json` and `packages/blue-oxlint-plugin/package.json`)
  — the build/emit path was **not** migrated to `@oxc-transform`.
- `packages/blue-oxlint-plugin/src/index.ts` builds the plugin via
  `eslintCompatPlugin` from `@oxlint/plugins`, `meta.name: '@blue/oxlint-plugin'`;
  no `@blue/eslint-plugin` package remains (`ls packages/` matches no `eslint`).
- The plugin ships 12 rules under `packages/blue-oxlint-plugin/src/rules/`,
  including the three checked: `no-browser-globals-in-isomorphic.ts`,
  `no-internal-file-exports.ts`, `no-uppercase-regexp-constants.ts`
  (plus `no-direct-integration-imports.ts`, `no-internal-file-imports.ts`,
  and seven more). Coupling with the original ruleset is the Library
  Integration Layer/AD-04 enforcement doctrine.
- `packages/blue-oxlint-plugin/package.json` first git entry:
  `249dfe13` (2026-09-10, "chore: commit uncommitted changes").
- The oxfmt/oxc-transform versions in root `package.json` have moved since
  (observed at `^0.68.0`/`^0.150.0` in `1173cd93`, 2026-09-28) — versions are
  current as of this ADR, not pinned to the plans.

## Decision

- **D-1 Lint:** adopt oxlint as the sole linter — it was already the
  execution engine; this ratifies enabling the built-in type-aware ruleset
  (`--type-aware --deny-warnings`) at repo root.
- **D-2 Format:** adopt oxfmt as the formatter, replacing Prettier
  (`format`/`format:check`). The migration plans marked Prettier "keep" and
  OXC's formatter optional; the realized direction committed to oxfmt
  instead, folding formatting into the OXC toolchain.
- **D-3 Plugin rename:** `@blue/eslint-plugin` became `@blue/oxlint-plugin`
  (rules are oxlint plugin rules authored against `@oxlint/plugins`
  `eslintCompatPlugin`; there is no ESLint runtime in the pipeline). Origin
  of the rule plugin: [AD-45](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md).
- **D-4 Build unchanged:** `tsc -b` stays as the build (`build:lib`). The
  proposed `tsc --noEmit` + `@oxc-transform` emit split (08-19 plans' "main
  event") was **rejected/deferred** — TC39-standard decorators +
  `Symbol.metadata` (via `@tsmetadata/polyfill`) and TypeScript project
  references were the kill criteria. `oxc-transform` remains only as a
  devDependency, unused in the build path.
- **D-5 Not migrated:** Vitest (test runner), Nx/pnpm, api-extractor all
  stay — no OXC equivalents (validated in the 08-19 evaluations).

## Consequences

- Lint and format run at OXC Rust speed through a single toolchain; the
  previous ESLint + Prettier pair (and their configs) are gone from the repo
  root.
- The custom rule family lives once, in `@blue/oxlint-plugin`, still enforcing
  the AD-04 browser-boundary rule and the internal/external file-import
  policies.
- `tsc -b` remains the sole build authority — no risk to decorator metadata
  or `.d.ts` emission, at the cost of not capturing the planned ~40–70%
  build-time reduction.

## References

- Plans: `docs/plans/2026-08-12_OXC_EVALUATION.md`,
  `docs/plans/2026-08-19_OXC_EVALUATION_AND_MIGRATION_PLAN.md`,
  `docs/plans/2026-08-19_OXC_MIGRATION.md`
- Implementation: `packages/blue-oxlint-plugin/src/index.ts`,
  `packages/blue-oxlint-plugin/src/rules/*.ts`, root `package.json`
  (`lint`/`format`/`format:check`, `build:lib`), commit `249dfe13` (2026-09-10)
- Related: [AD-45](2026-02-01_AD45_ARCHITECTURAL_LINT_RULES.md) (rule-plugin origin), [AD-04](2026-05-27_AD04_BROWSER_BOUNDARY_PLATFORM_WEB.md)

## Revisit Trigger

Revisiting the transform-emit migration (Slice 4 / Phase 2 of the 08-19 plans)
is worthwhile if OXC adds production-standard support for TC39 decorators +
`Symbol.metadata` or if `tsgo` (the native compiler) reaches GA for the kept
`tsc` type-check pass. Until then `tsc -b` stays authoritative for emit.
