# OXC Evaluation and Migration Plan for BlueJS Monorepo

## Executive Summary

This document evaluates the adoption of OXC (Open eXtension Compiler) in the BlueJS monorepo, analyzing its potential to replace existing tooling including TypeScript compiler (`tsc`), ESLint, and Prettier. OXC offers significant performance improvements with `oxlint` being 50-100x faster than ESLint and `oxc-transform` providing 4x faster transpilation than SWC. However, critical compatibility issues exist: TC39 decorators (used extensively in BlueJS), lack of TypeScript project references support, and alpha status of JS plugins for custom rules. The recommended migration path involves phased adoption starting with oxlint alongside ESLint, followed by formatter evaluation, and conditional transformer adoption after resolving decorator support.

## Current Tooling Audit

BlueJS currently uses a robust toolchain built around:

- **TypeScript 6.0.3** (`tsc -b`) for building 28 packages with project references
- **ESLint 9.17.0** + **@typescript-eslint 8.18.2** for linting
- **Prettier 3.4.2** for formatting
- **Nx 21.0.0** for monorepo orchestration
- **Vitest 3.0.0** for testing
- **Custom ESLint plugin** (`@blue/eslint-plugin`) with 4 rules:
    - `no-direct-integration-imports` - blocks direct imports from encapsulated libs
    - `no-internal-file-imports` - blocks cross-package imports of underscore files
    - `no-internal-file-exports` - blocks re-exporting internal files in public API
    - `no-browser-globals-in-isomorphic` - flags browser globals in isomorphic code
- **TC39 decorators** (via @tsmetadata/polyfill)
- **ESM-only**, targeting **ES2022**
- Build time: ~30s, test time: ~2min

## OXC Component Analysis

| Component         | Status            | Key Features                                                                     | Limitations                                       |
| ----------------- | ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| **oxlint**        | Stable (v1.78.0)  | 845+ built-in rules, 50-100x faster than ESLint, type-aware linting via tsgolint | No JS plugin support for custom rules             |
| **oxc-transform** | Stable (v0.144.0) | 4x faster than SWC, TS stripping, JSX/TSX, ES2026→ES2015 lowering                | No TC39 decorators support, no project references |
| **oxfmt**         | Beta (v0.63.0)    | Can replace Prettier                                                             | Different config format, still beta               |
| **oxc-minifier**  | Alpha             | Basic minification                                                               | Not production-ready                              |

## Compatibility Matrix

| Feature               | tsc | oxlint              | ESLint | oxlint vs ESLint | Prettier | oxfmt                   | Prettier vs oxfmt |
| --------------------- | --- | ------------------- | ------ | ---------------- | -------- | ----------------------- | ----------------- |
| Type-aware linting    | ✅  | ✅ (via tsgolint)   | ✅     | ✅               | ❌       | ❌                      | ❌                |
| TC39 decorators       | ✅  | ❌                  | ✅     | ❌               | ❌       | ❌                      | ❌                |
| Project references    | ✅  | ❌                  | ❌     | ❌               | ❌       | ❌                      | ❌                |
| JS plugin support     | ❌  | ❌ (alpha)          | ✅     | ❌               | ❌       | ❌                      | ❌                |
| Isolated declarations | ✅  | ✅                  | ❌     | ❌               | ❌       | ❌                      | ❌                |
| Performance (linting) | ⚠️  | ✅ (50-100x faster) | ⚠️     | ✅               | ⚠️       | ✅ (4x faster than SWC) | ✅                |

## Migration Feasibility

### What Can Migrate

- **oxlint** can replace ESLint for linting with minimal configuration changes
- **oxfmt** can replace Prettier for formatting (with config migration)
- **oxc-transform** can handle transpilation for non-decorator code

### What Cannot Migrate

- **TC39 decorators** - No support in oxc-transform
- **TypeScript project references** - Required for BlueJS's 28-package build
- **Custom ESLint plugin rules** - JS plugins are alpha quality

### What's Risky

- Replacing `tsc` with `oxc-transform` without decorator support
- Removing ESLint before migrating custom rules to oxlint
- Switching formatter without verifying formatting consistency

## Risk Assessment

| Risk                          | Likelihood | Impact   | Mitigation                                                  |
| ----------------------------- | ---------- | -------- | ----------------------------------------------------------- |
| Decorator incompatibility     | High       | Critical | Wait for TC39 decorator support or implement workarounds    |
| Project reference breakage    | Medium     | High     | Verify isolated declarations compliance across all packages |
| Custom rule migration failure | Medium     | Medium   | Migrate rules gradually and maintain parallel runs          |
| Formatting inconsistency      | Low        | Low      | Run both formatters in parallel during transition           |
| Performance regression        | Low        | Low      | Benchmark before full adoption                              |

## Recommended Migration Waves

### Wave 0: Foundation (Low Risk)

1. Install oxlint alongside ESLint
2. Run `@oxlint/migrate` to generate `.oxlintrc.json`
3. Identify rule gaps and mismatches
4. Verify native rules coverage for BlueJS ruleset

### Wave 1: Linter Migration (Medium Risk)

1. Replace ESLint with oxlint in CI and local `pnpm lint`
2. Migrate `@blue/eslint-plugin` to oxlint JS Plugins (alpha)
3. Test all 4 custom rules work correctly
4. Remove ESLint dependencies

### Wave 2: Formatter Evaluation (Low-Medium Risk)

1. Install oxfmt alongside Prettier
2. Run `oxfmt --check` in CI parallel to `prettier --check`
3. Identify formatting differences
4. Decide: adopt oxfmt or keep Prettier until 1.0

### Wave 3: Transformer (High Risk — Conditional)

1. Only if TC39 decorators blocker is resolved or workarounds found
2. Verify `isolatedDeclarations` compliance across all 28 packages
3. Test `.d.ts` generation quality
4. Replace `tsc -b` with oxc-transform for transpilation

### Wave 4: Consolidation (Low Risk)

1. Remove all old tooling (ESLint, Prettier, tsc)
2. Clean up dependencies
3. Update documentation

## Expected Benefits

| Tool          | Current          | OXC Alternative                  | Improvement    |
| ------------- | ---------------- | -------------------------------- | -------------- |
| Linting       | 2-3s per package | ~0.02-0.03s per package          | 50-100x faster |
| Formatting    | 1-2s per package | ~0.25s per package               | 4x faster      |
| Transpilation | 20s total        | ~5s total (if supported)         | 4x faster      |
| Build time    | ~30s             | ~10s (if all components adopted) | ~67% reduction |

## Rollback Plan

If issues arise during migration:

1. Revert oxlint to ESLint by restoring ESLint dependencies and configuration
2. Revert oxfmt to Prettier by removing oxfmt and restoring Prettier config
3. Revert oxc-transform to tsc by restoring TypeScript build scripts
4. Maintain parallel runs of old and new tools until stability is confirmed
5. Document rollback steps in `docs/migrations/` for future reference
