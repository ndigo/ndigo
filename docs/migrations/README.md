# Migration Guides

This directory contains migration guides documenting breaking changes and upgrade paths for major transitions in the BlueJS project.

## Available Migrations

- [2026-11-04_VITEST_5_UPGRADE.md](./2026-11-04_VITEST_5_UPGRADE.md) - Vitest 4.0.18→5.1.0: `bench` fixture rewrite, per-lane config wiring, decorator lowering in test lanes
- [2026-11-04_PNPM_12_NX_24_UPGRADE.md](./2026-11-04_PNPM_12_NX_24_UPGRADE.md) - Toolchain upgrade: pnpm 11.4.0→12.16.1 (Rust rewrite) and Nx 23.2.1→24.0.4
- [2026-08-22_MIGRATION_TO_1.0.md](./2026-08-22_MIGRATION_TO_1.0.md) - Legacy → BlueJS 1.0 migration guide (TC39 decorators, API surface changes)
- [2026-08-12_ESLINT_TO_OXLINT.md](./2026-08-12_ESLINT_TO_OXLINT.md) - ESLint → oxlint migration
- [2026-06-18_CONTENT_NEGOTIATION_AND_TEMPLATE_VIEW_CONTRACT.md](./2026-06-18_CONTENT_NEGOTIATION_AND_TEMPLATE_VIEW_CONTRACT.md) - Wave 3 summary: content negotiation framework + template-view contract
- [2026-06-12_NATIVE_FIRST_REFACTOR.md](./2026-06-12_NATIVE_FIRST_REFACTOR.md) - Native-first refactor: Ramda/date-fns removed from `@blue/util`
- [2026-05-29_V1_MIGRATION.md](./2026-05-29_V1_MIGRATION.md) - V1 migration guide: breaking changes from the 10-wave roadmap
- [2026-05-27_PNPM_11_UPGRADE.md](./2026-05-27_PNPM_11_UPGRADE.md) - pnpm 11 upgrade (8.15.0→11.4.0), workspace config migration
- [2026-01-23_DEPENDENCIES.md](./2026-01-23_DEPENDENCIES.md) - Dependency modernization (Ramda, date-fns, etc.)
- [2026-01-23_PRETTIER.md](./2026-01-23_PRETTIER.md) - Prettier code formatting setup
- [2026-01-23_TOOLING.md](./2026-01-23_TOOLING.md) - Tooling migration (Yarn→pnpm, Lerna→Nx, Jest→Vitest)
- [2026-01-23_VITE.md](./2026-01-23_VITE.md) - Build tool migration (webpack→Vite)
- [2026-01-27_DOCS.md](./2026-01-27_DOCS.md) - Documentation generation setup
- [2026-01-27_NPMRC.md](./2026-01-27_NPMRC.md) - pnpm configuration optimization
- [2026-01-28_ESM_ONLY.md](./2026-01-28_ESM_ONLY.md) - ESM-only module system migration

## Naming Convention

Migration files follow the format: `YYYY-MM-DD_DESCRIPTION.md`

Where:

- `YYYY-MM-DD` - Date the migration was completed (ISO 8601 format)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases
