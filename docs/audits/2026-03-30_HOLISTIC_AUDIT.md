# Holistic Repository Audit

**Date:** 2026-03-30
**Author:** opencode
**Scope:** 7-dimension comprehensive audit across 21 packages

## Executive Summary

A holistic audit was performed across 7 dimensions covering the entire ndigo monorepo. The audit identified **2 critical**, **12 medium**, and **10 low-severity** findings. The monorepo is generally well-structured with strong convention adherence, but has architectural layer violations, metadata pattern duplication, documentation staleness, and minor consistency gaps that should be addressed.

### Finding Distribution

| Dimension             | Critical | Medium | Low | Clean          |
| --------------------- | -------- | ------ | --- | -------------- |
| Architecture Layers   | 2        | 2      | 2   | -              |
| Naming & Style        | 0        | 1      | 1   | 6 checks clean |
| Test Coverage         | 0        | 4      | 0   | -              |
| Documentation         | 0        | 5      | 3   | -              |
| Dependency Health     | 0        | 3      | 1   | 2 checks clean |
| API Surface & Exports | 0        | 2      | 1   | 3 checks clean |
| DRY / Duplication     | 0        | 2      | 2   | 1 check clean  |

---

## Dimension 1: Architecture Layer Consistency

Verified that cross-package imports respect the layered architecture defined in `ARCHITECTURE.md`.

| #   | Severity | Package                    | Finding                                                                                                                                                                                      |
| --- | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Critical | `@ndigo/model` (L0)        | `src/event.ts` imports `asEventEmitter` from `@ndigo/context` (L3) — upward layer violation. Also latent circular dependency risk since `@ndigo/model` declares `@ndigo/context` as peerDep. |
| 2   | Critical | `@ndigo/validate` (L2)     | `src/route-parameter.ts` imports types from `@ndigo/dispatcher` (L5) — publicly exported upward layer violation.                                                                             |
| 3   | Medium   | `@ndigo/platform-web` (L6) | Missing `peerDependencies` block entirely; all `@ndigo/*` deps are only in `devDependencies`.                                                                                                |
| 4   | Medium   | `@ndigo/model` (L0)        | Imports `objectmodel` via `../node_modules/...` relative paths — fragile, non-portable.                                                                                                      |
| 5   | Low      | `@ndigo/http` (L4)         | Commented-out dead code in `query-string.ts` contains banned direct `ramda` import.                                                                                                          |
| 6   | Low      | `@ndigo/boot` (L7)         | `@ndigo/dispatcher` in `devDependencies` only; not in `peerDependencies` — may need peer dep.                                                                                                |

### Recommendations

1. Move `EventModel` to `@ndigo/domain` (L6) or invert control so `@ndigo/model` stays dependency-free.
2. Move `ParameterExtractor`/`ParameterValueConverter` interfaces down to `@ndigo/core` (L1) or move `validatedBy()` up to `@ndigo/dispatcher` (L5).
3. Add `peerDependencies` block to `@ndigo/platform-web/package.json`.
4. Replace `../node_modules/objectmodel/src/...` imports with bare specifier subpaths.
5. Delete commented-out ramda import block in `query-string.ts`.
6. Audit whether `@ndigo/boot` surfaces `@ndigo/dispatcher` types; if so, add peer dep.

---

## Dimension 2: Naming & Style Compliance

Checked adherence to STYLE_GUIDE.md conventions across the entire codebase.

| #   | Severity | Finding                                                                                                                                                                                                             |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | Medium   | **3 transducer naming violations**: `TransducerTransformer` (`ndigo-http`), `CompositionTransformer` (`ndigo-http`), `DelegatingTransformer` (`ndigo-core`) should use `X*` prefix per STYLE_GUIDE.md Section 3.10. |
| 8   | Low      | **~20 potential internal file naming issues**: Files in `@ndigo/platform-web` and `@ndigo/parser` that appear to be internal helpers but lack `_` prefix. Requires manual review to determine if truly internal.    |

### Checks Passing Clean

- Acronym casing (HTTP, JSON, URL — all uppercase)
- Decorator naming (all camelCase)
- Abstract class prefix (all use `Abstract*`)
- Role-based suffixes (Handler, Resolver, Strategy, Factory, etc.)
- Private field convention (`#` syntax)
- UPPER_SNAKE_CASE RegExp constants (none found — correct)

---

## Dimension 3: Test Coverage Gaps

Compared source files against test files to identify untested code paths.

| #   | Severity | Package             | Finding                                                                                                                                   |
| --- | -------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | Medium   | `@ndigo/dispatcher` | `route-handler-execution-chain.ts` has zero tests (critical code path). All strategy files also untested. 17 untested source files total. |
| 10  | Medium   | `@ndigo/core`       | `error.ts` (custom error classes), `constructable.ts`, enumerable helpers — 13 untested source files.                                     |
| 11  | Medium   | `@ndigo/telemetry`  | 14 untested source files: all `instrumentation/*`, loggers, and config modules. Missing error path `.toThrow()` tests.                    |
| 12  | Medium   | `@ndigo/factory`    | `registry.ts` (core component) has no dedicated test file. 4 untested source files.                                                       |

### Coverage Quality Notes

- `@ndigo/domain`: High quality — 3/6 files tested, rest are type-only.
- `@ndigo/orm`: High quality — 52 tests across 5 test files covering all public API.
- `@ndigo/factory`: High overall — `scope.ts` and `lifecycle.ts` well-tested.

---

## Dimension 4: Documentation Freshness

Checked root documentation and package-level docs for staleness.

| #   | Severity | Finding                                                                                                                                                                                        |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13  | Medium   | **Stale `@ndigo/logger` references**: Multiple `.md` and source files reference `@ndigo/logger` but `packages/ndigo-logger/` does not exist (removed/renamed to `@ndigo/telemetry`).           |
| 14  | Medium   | **`CLAUDE.md` references**: `STYLE_GUIDE.md` and migration docs still reference `CLAUDE.md` (renamed to `AGENTS.md`).                                                                          |
| 15  | Medium   | **`reflect-metadata` remnants**: Found in `vite.config.lib.ts`, `ndigo-print/vite.config.js`, `ndigo-boot/vite.config.js`, `ndigo-demo/index.js` — project migrated to `@tsmetadata/polyfill`. |
| 16  | Medium   | **Root `README.md` missing new packages**: Does not mention `@ndigo/orm`, `@ndigo/eslint-plugin`, or `@ndigo/telemetry`.                                                                       |
| 17  | Medium   | **Missing package READMEs**: `@ndigo/orm` and `@ndigo/eslint-plugin` have no `README.md` file.                                                                                                 |
| 18  | Low      | **`experimentalDecorators: false`**: Present in several `tsconfig*.json` files — harmless but unnecessary since ndigo uses standard TC39 decorators.                                           |
| 19  | Low      | **Missing plan documents**: No dedicated plan docs for Phase 2 (FeatureMetricRecorder dedup) or Phase 3 (telemetry integration).                                                               |
| 20  | Low      | **Plans index discrepancy**: `docs/plans/README.md` references `2026-02-08_REGEX_NAMING_CONVENTION.md` but actual file is dated `2026-02-07`.                                                  |

---

## Dimension 5: Dependency Health

Analyzed all 21 `package.json` files for cross-package protocol compliance, version consistency, and integration layer adherence.

| #   | Severity | Finding                                                                                                                                                                                |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21  | Medium   | **`@ndigo/platform-web`**: All `@ndigo/*` deps in `devDependencies` only — missing `peerDependencies` block. (Same as finding #3.)                                                     |
| 22  | Medium   | **`@ndigo/boot`**: `@ndigo/dispatcher` in `devDependencies` but NOT in `peerDependencies`. (Same as finding #6, confirmed.)                                                            |
| 23  | Medium   | **Zod version mismatch**: `@ndigo/validate` uses `zod@^4.3.6` (dependencies), `@ndigo/platform-web` uses `zod@^3.24.2` (devDependencies) — major version split.                        |
| 24  | Low      | **`@ndigo/http` direct ramda import**: `src/query-string.ts` line 12 imports 13 functions directly from `ramda` instead of `@ndigo/util` — active library integration layer violation. |

### Checks Passing Clean

- All `@ndigo/*` cross-references use `~0.0.1` version specifier.
- Integration layer packages correctly encapsulate their respective libraries in `package.json`.

### External Dependency Inventory

| External Package                 | Used By                                  |
| -------------------------------- | ---------------------------------------- |
| `@opentelemetry/*` (14 packages) | `@ndigo/telemetry`                       |
| `@typescript-eslint/utils`       | `@ndigo/eslint-plugin`                   |
| `@fingerprintjs/fingerprintjs`   | `@ndigo/print`                           |
| `arcsecond`                      | `@ndigo/parser`                          |
| `date-fns`, `date-fns-tz`        | `@ndigo/util`                            |
| `objectmodel`                    | `@ndigo/model`                           |
| `ramda`                          | `@ndigo/util`                            |
| `seedrandom`                     | `@ndigo/util`                            |
| `slug`                           | `@ndigo/util`                            |
| `zod`                            | `@ndigo/validate`, `@ndigo/platform-web` |

---

## Dimension 6: API Surface & Exports

Checked barrel completeness, internal file leaks, cross-package internal imports, and export consistency.

| #   | Severity | Finding                                                                                                                                                                                     |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25  | Medium   | **`@ndigo/factory`**: `src/entry.ts` exports `class Entry` but it is not re-exported in `src/index.ts`.                                                                                     |
| 26  | Medium   | **`@ndigo/core`**: `src/validator.ts` exports `interface Validator` but it is not re-exported in `src/index.ts`.                                                                            |
| 27  | Low      | **Inconsistent type export style**: `@ndigo/orm` and `@ndigo/validate` use explicit `export type { ... }`, while `@ndigo/core`, `@ndigo/context`, and `@ndigo/factory` use `export * from`. |

### Checks Passing Clean

- No `export * from './_*'` violations (internal file wildcard leak).
- No cross-package imports of underscore-prefixed internal files.
- `package.json` `exports` fields are consistent across all packages.

---

## Dimension 7: DRY / Code Duplication

Analyzed specific duplication patterns across the codebase, applying the Rule of Three guideline.

| #   | Severity | Finding                                                                                                                                                                                                                                                                                                                                                                         |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28  | Medium   | **`getMetadata()` helper duplicated 6+ times**: Identical `Symbol.metadata` extraction function in `@ndigo/telemetry` (2x), `@ndigo/dispatcher` (3x), `metadata-manager.ts` (1x) — with minor return type variations. Additional simpler variants in `@ndigo/context`, `@ndigo/orm`, `@ndigo/view-webcomponent`. Meets Rule of Three threshold for extraction to `@ndigo/core`. |
| 29  | Medium   | **Generic `Error` usage (29 instances)**: Many `throw new Error(...)` where `IllegalStateError` or domain-specific errors would be more appropriate. `IllegalStateError` used 14 times, `TypeError` 40 times (generally correct), custom errors 13 times.                                                                                                                       |
| 30  | Low      | **Decorator factory patterns**: Each package creates its own decorator factories with structurally similar but functionally distinct implementations. No shared `createClassDecorator()` utility warranted — the variation is functional, not duplication.                                                                                                                      |
| 31  | Low      | **`like*()` utility functions**: All consistently imported from `@ndigo/util` across all packages. No duplication detected. (Exception: `@ndigo/http/query-string.ts` direct ramda import — covered by finding #24.)                                                                                                                                                            |

---

## Prioritized Remediation Plan

### Tier 1 — Critical / High-Impact

| Priority | Finding(s) | Action                                                                                                                                  | Effort |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| P1       | #1         | Move `EventModel` to `@ndigo/domain` or invert the dependency so `@ndigo/model` stays L0                                                | Medium |
| P2       | #2         | Move `ParameterExtractor`/`ParameterValueConverter` interfaces down to `@ndigo/core`, or move `validatedBy()` up to `@ndigo/dispatcher` | Medium |
| P3       | #24        | Fix `@ndigo/http/query-string.ts` — replace direct `ramda` import with `@ndigo/util`                                                    | Small  |
| P4       | #28        | Extract shared `getMetadata()` utility to `@ndigo/core` — used by 6+ files across 4 packages                                            | Medium |

### Tier 2 — Medium / Consistency

| Priority | Finding(s) | Action                                                                                        | Effort |
| -------- | ---------- | --------------------------------------------------------------------------------------------- | ------ |
| P5       | #3, #21    | Add `peerDependencies` to `@ndigo/platform-web/package.json`                                  | Small  |
| P6       | #7         | Rename 3 transformer classes: add `X` prefix (`XTransducerTransformer`, etc.)                 | Small  |
| P7       | #23        | Resolve zod version split — either upgrade `@ndigo/platform-web` to zod 4 or align both       | Small  |
| P8       | #13        | Remove/update stale `@ndigo/logger` references across docs                                    | Small  |
| P9       | #14        | Replace `CLAUDE.md` references with `AGENTS.md`                                               | Small  |
| P10      | #16, #17   | Update root README with new packages; add READMEs for `@ndigo/orm` and `@ndigo/eslint-plugin` | Small  |
| P11      | #25, #26   | Decide whether `Entry` and `Validator` should be public API and update barrels                | Small  |

### Tier 3 — Low / Cleanup

| Priority | Finding(s) | Action                                                                                         | Effort |
| -------- | ---------- | ---------------------------------------------------------------------------------------------- | ------ |
| P12      | #4         | Fix `@ndigo/model` `objectmodel` import paths to use bare specifiers                           | Small  |
| P13      | #5         | Delete dead commented-out code in `query-string.ts`                                            | Tiny   |
| P14      | #15        | Clean up `reflect-metadata` references from vite configs and demo                              | Small  |
| P15      | #18        | Remove unnecessary `experimentalDecorators: false` from tsconfigs                              | Tiny   |
| P16      | #29        | Audit 29 generic `Error` usages for upgrade to specific error classes                          | Medium |
| P17      | #9-12      | Write tests for critical untested code paths (dispatcher chain, core errors, factory registry) | Large  |
