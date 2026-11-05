# Codebase Audits

This directory contains audit reports analyzing various aspects of the ndigo codebase.

## Available Audits

- [2026-11-03_POST_RENAME_CLEANUP_AUDIT.md](./2026-11-03_POST_RENAME_CLEANUP_AUDIT.md) - Post-rename dead-code/dependency audit (knip report mode + manual verification; dead files pruned, findings triaged to #90–#92)

- [2026-10-07_OXC_UPDATE_AND_MATURITY_ASSESSMENT.md](./2026-10-07_OXC_UPDATE_AND_MATURITY_ASSESSMENT.md) - OXC toolchain update (oxlint/oxfmt 1.87/0.72) and maturity re-assessment of the unadopted tools (oxc-transform decorators, parser, minify, resolver)
- [2026-09-13_FRAMEWORK_GAP_ANALYSIS.md](./2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) - Enterprise-framework gap analysis (missing features, incomplete features, Content/i18n direction with implement-vs-wrap split, client-side angle)
- [2026-09-05_FRAMEWORK_ASSESSMENT.md](./2026-09-05_FRAMEWORK_ASSESSMENT.md) - Framework feature/redundancy/purpose evaluation (public-API vs framework-internal classification, reactive/event overlap, validation split, semantic enforcement)
- [2026-08-22_PACKAGE_REVIEW.md](./2026-08-22_PACKAGE_REVIEW.md) - Package-by-package code review (Wave 10 checkpoint findings, 1.0 blockers)
- [2026-08-21_OXC_ADOPTION_ASSESSMENT.md](./2026-08-21_OXC_ADOPTION_ASSESSMENT.md) - OXC toolchain adoption assessment (decision: AD-58)
- [2026-04-03_RAMDA_BENCHMARK_ANALYSIS.md](./2026-04-03_RAMDA_BENCHMARK_ANALYSIS.md) - Ramda vs native JS performance benchmarks across all @ndigo/util categories
- [2026-03-30_HOLISTIC_AUDIT.md](./2026-03-30_HOLISTIC_AUDIT.md) - 7-dimension holistic repository audit (architecture, naming, tests, docs, deps, API, DRY)
- [2026-03-08_PACKAGE_ANALYSIS.md](./2026-03-08_PACKAGE_ANALYSIS.md) - Monorepo package maturity and documentation audit
- [2026-02-01_DEPENDENCY_AUDIT.md](./2026-02-01_DEPENDENCY_AUDIT.md) - Library Integration Layer compliance audit

## Naming Convention

Audit files follow the format: `YYYY-MM-DD_DESCRIPTION.md`

Where:

- `YYYY-MM-DD` - Date the audit was performed (ISO 8601 format)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases

## Purpose

Audit reports provide:

- Comprehensive analysis of specific codebase aspects
- Identification of patterns and anti-patterns
- Violation detection
- Recommendations for improvements
- Baseline measurements for tracking progress
