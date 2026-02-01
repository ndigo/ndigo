# Migration Guides

This directory contains migration guides documenting breaking changes and upgrade paths for major transitions in the BlueJS project.

## Available Migrations

- [2025-01-23_DEPENDENCIES.md](./2025-01-23_DEPENDENCIES.md) - Dependency modernization (Ramda, date-fns, etc.)
- [2025-01-23_PRETTIER.md](./2025-01-23_PRETTIER.md) - Prettier code formatting setup
- [2025-01-23_TOOLING.md](./2025-01-23_TOOLING.md) - Tooling migration (Yarn→pnpm, Lerna→Nx, Jest→Vitest)
- [2025-01-23_VITE.md](./2025-01-23_VITE.md) - Build tool migration (webpack→Vite)
- [2025-01-27_DOCS.md](./2025-01-27_DOCS.md) - Documentation generation setup
- [2025-01-27_NPMRC.md](./2025-01-27_NPMRC.md) - pnpm configuration optimization
- [2025-01-28_ESM_ONLY.md](./2025-01-28_ESM_ONLY.md) - ESM-only module system migration

## Naming Convention

Migration files follow the format: `YYYY-MM-DD_DESCRIPTION.md`

Where:
- `YYYY-MM-DD` - Date the migration was completed (ISO 8601 format)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases
