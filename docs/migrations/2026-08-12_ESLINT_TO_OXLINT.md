# Migration: ESLint to oxlint

**Date:** 2026-08-12  
**Status:** Implemented  
**Author:** Jeff Rose

## Overview

This document describes the migration from ESLint to oxlint in the ndigo monorepo. oxlint is a fast, Rust-based linter from the OXC project that provides ESLint-compatible rules with 50-100x performance improvements.

## Motivation

- **Performance:** oxlint is 50-100x faster than ESLint for TypeScript linting
- **Simplified toolchain:** Reduces dependency count and complexity
- **Active development:** oxlint has strong community adoption (Kibana, Sentry, Renovate, etc.)

## What Changed

### Dependencies

**Removed from root `devDependencies`:**

- `eslint` (~9.17.0)
- `eslint-config-prettier` (~9.1.0)
- `eslint-plugin-prettier` (~5.2.1)
- `@typescript-eslint/parser` (~8.18.2)
- `@typescript-eslint/eslint-plugin` (~8.18.2)

**Added to root `devDependencies`:**

- `oxlint` (^1.78.0)
- `@oxlint/plugins` (^0.2.0)

### Configuration

**Replaced:** `eslint.config.mjs` (ESLint flat config)  
**With:** `.oxlintrc.json` (oxlint configuration)

The oxlint config was generated from the ESLint config using the `@oxlint/migrate` tool, then manually adjusted for oxlint-specific syntax.

### Custom Plugin (`@ndigo/eslint-plugin`)

The custom ESLint plugin was migrated to use oxlint's JS Plugin API:

- Wrapped with `eslintCompatPlugin` from `@oxlint/plugins` for dual compatibility
- Rules converted from `create(context)` to `createOnce(context)` + `before()` hook pattern
- Test files updated to use `oxlint/plugins-dev` RuleTester instead of `@typescript-eslint/rule-tester`

**All 4 custom rules migrated:**

1. `no-direct-integration-imports` — Blocks direct imports from encapsulated libraries
2. `no-internal-file-imports` — Blocks cross-package imports of underscore files
3. `no-internal-file-exports` — Blocks re-exporting internal files in public API
4. `no-browser-globals-in-isomorphic` — Flags browser globals in isomorphic code

### Documentation

**Updated:**

- `AGENTS.md` — Linting section, pre-commit validation, ESLint references
- `ARCHITECTURE.md` — Dependency Management Strategy enforcement section

## Migration Steps

1. Install oxlint: `pnpm add -D oxlint@^1.78.0 @oxlint/plugins@^0.2.0`
2. Generate config: `npx @oxlint/migrate eslint.config.mjs`
3. Review and adjust `.oxlintrc.json` for oxlint-specific syntax
4. Migrate custom plugin rules to oxlint JS Plugin API
5. Update test files to use `oxlint/plugins-dev` RuleTester
6. Update documentation references
7. Remove ESLint dependencies: `pnpm remove eslint eslint-config-prettier eslint-plugin-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`
8. Validate: `pnpm lint`, `pnpm test`, `pnpm build`

## Known Differences

### Rule Coverage

oxlint has 845+ built-in rules covering ESLint core, typescript-eslint, unicorn, and more. Most ndigo rules are covered natively. Custom rules use the JS Plugin API.

### Configuration Syntax

- oxlint uses `.oxlintrc.json` instead of `eslint.config.mjs`
- Severity levels: `"error"`, `"warn"`, `"off"` instead of `2`, `1`, `0`
- Some rule options may have different naming

### JS Plugins (Alpha)

The oxlint JS Plugin API is currently in alpha. This means:

- The API may change in future versions
- ndigo custom rules are migrated but may need updates
- The `eslintCompatPlugin` wrapper provides dual compatibility with ESLint

## Rollback Plan

If issues arise:

1. Revert the git commit
2. ESLint config (`eslint.config.mjs`) is still in git history
3. Custom rules remain in `@ndigo/eslint-plugin` (just need to swap back to ESLint API)
4. No data loss — oxlint config is additive, not destructive

## Future Considerations

### Type-Aware Linting

oxlint supports type-aware linting via `tsgolint` (built on TypeScript 7.0.2 native Go port). This could replace `tsc --noEmit` in the future, but ndigo currently relies on `tsc -b` for project references and decorator support.

### oxfmt (Formatter)

oxfmt is available as a Prettier replacement but is still in beta. Evaluation is planned for a future wave.

### oxc-transform (Transpiler)

oxc-transform is 4x faster than SWC but doesn't yet support TC39 decorators (tracked at [oxc#9170](https://github.com/oxc-project/oxc/issues/9170)). ndigo relies on TC39 decorators, so `tsc` must remain for building.

## References

- [oxlint Documentation](https://oxc.rs/docs/guide/usage/linter.html)
- [JS Plugins Documentation](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
- [Writing JS Plugins](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html)
- [Migrate from ESLint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html)
