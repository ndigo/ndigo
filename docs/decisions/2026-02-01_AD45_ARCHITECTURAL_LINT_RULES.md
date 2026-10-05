# AD-45: Enforce architectural rules with a dedicated lint plugin

**Date:** 2026-02-01
**Status:** Accepted — implemented 2026-03-29 as `@blue/eslint-plugin`; renamed
`@blue/oxlint-plugin` during the OXC migration (2026-08-21), see [AD-58](2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md)

## Context

Architectural constraints — integration-layer imports, internal-file boundaries,
barrel hygiene — cannot be expressed in TypeScript, `package.json`, or standard
lint rules. Without enforcement they regress silently. The plan proposes a
dedicated plugin carrying custom rules to lock them down in CI.

## Evidence

- Plan `docs/plans/2026-02-01_ESLINT_PLUGIN.md` defines three rules —
  `no-direct-integration-imports`, `no-internal-file-imports`,
  `no-internal-file-exports` — and a plugin entry point registering them.
- Born as `@blue/eslint-plugin`: `7c484c3f` (2026-03-30) "feat(eslint-plugin):
  add @blue/eslint-plugin with 3 architecture enforcement rules".
- Renamed during the OXC migration: `aff5b77a` (2026-08-21) "fix: complete OXC
  migration — fix plugin.configs crash and createOnce filename bug". Only
  `packages/blue-oxlint-plugin/` exists today (no `blue-eslint-plugin` dir).
- **Verified live (2026-10-04):** `packages/blue-oxlint-plugin/src/index.ts`
  registers all three rules (plus `no-uppercase-regexp-constants` etc.) under
  plugin name `@blue/oxlint-plugin`, via `eslintCompatPlugin`.
- Enforced through the repo lint gate: `package.json:20` `"lint": "oxlint
--type-aware --deny-warnings ."`, and `.oxlintrc.json` sets
  `@blue/no-direct-integration-imports: "warn"`,
  `@blue/no-internal-file-imports: "error"`,
  `@blue/no-internal-file-exports: "error"`.

## Decision

- D-1 Build a dedicated plugin (`@blue/eslint-plugin`, later
  `@blue/oxlint-plugin`) for repository-specific architectural rules, not
  general style rules.
- D-2 Ship the three architecture rules: `no-direct-integration-imports`
  (encapsulated libraries only through their integration layer),
  `no-internal-file-imports` (no cross-package `_*.ts` imports),
  `no-internal-file-exports` (no `_*.ts` re-exports from public barrels).
- D-3 Enable the rules as errors in the repo-wide lint config, gating on `pnpm lint`.

## Consequences

- The integration-layer and internal-file rules still exist verbatim in
  `packages/blue-oxlint-plugin/src/rules/`.
- `@blue/no-internal-file-imports` remains `error` (`.oxlintrc.json:68`) as the
  non-negotiable boundary; `no-direct-integration-imports` stays `warn`.

## References

- Plan: `docs/plans/2026-02-01_ESLINT_PLUGIN.md`
- Implementation: `packages/blue-oxlint-plugin/src/rules/{no-direct-integration-imports,no-internal-file-imports,no-internal-file-exports}.ts`,
  commits `7c484c3f` (2026-03-30), `aff5b77a` (2026-08-21); enforced via
  `package.json` (`lint` script) + `.oxlintrc.json`
- Related: [AD-46](2026-02-01_AD46_INTERNAL_FILE_EXPORT_CONVENTION.md), [AD-58](2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md)

## Revisit Trigger

Revisit if a new enforcement class (import boundaries, licensing, bundle gates)
needs a rule and the plugin's rule surface or the lint gate must grow.
