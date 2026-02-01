# Migration Guides

This directory contains migration guides documenting breaking changes and upgrade paths for major transitions in the BlueJS project.

## Available Migrations

- [2025-01-23-DEPENDENCIES.md](./2025-01-23-DEPENDENCIES.md) - Dependency modernization (Ramda, date-fns, etc.)
- [2025-01-23-PRETTIER.md](./2025-01-23-PRETTIER.md) - Prettier code formatting setup
- [2025-01-23-TOOLING.md](./2025-01-23-TOOLING.md) - Tooling migration (Yarn→pnpm, Lerna→Nx, Jest→Vitest)
- [2025-01-23-VITE.md](./2025-01-23-VITE.md) - Build tool migration (webpack→Vite)
- [2025-01-27-DOCS.md](./2025-01-27-DOCS.md) - Documentation generation setup
- [2025-01-27-NPMRC.md](./2025-01-27-NPMRC.md) - pnpm configuration optimization
- [2025-01-28-ESM-ONLY.md](./2025-01-28-ESM-ONLY.md) - ESM-only module system migration

## Naming Convention

Migration files follow the format: `YYYY-MM-DD-DESCRIPTION.md`

Where:
- `YYYY-MM-DD` - Date the migration was completed
- `DESCRIPTION` - Brief description in ALL CAPS
