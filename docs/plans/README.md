# Implementation Plans

This directory contains detailed implementation plans for major features and enhancements in the BlueJS project.

## Available Plans

- [2025-01-30_PARSER_ENHANCEMENT.md](./2025-01-30_PARSER_ENHANCEMENT.md) - Parser enhancement and optimization plan
- [2025-02-01_FILE_REFACTORING.md](./2025-02-01_FILE_REFACTORING.md) - File size refactoring plan for 15 large files
- [2025-02-03_URL_PARSING_DUPLICATION.md](./2025-02-03_URL_PARSING_DUPLICATION.md) - URL parsing code duplication resolution
- [ESLINT_PLUGIN.md](./ESLINT_PLUGIN.md) - Custom ESLint plugin for architectural enforcement
- [INTERNAL_FILE_NAMING_REVIEW.md](./INTERNAL_FILE_NAMING_REVIEW.md) - Future review of internal file naming convention

## Completed Plans

- [2025-02-01_UTILITY_ORGANIZATION.md](./2025-02-01_UTILITY_ORGANIZATION.md) - ✅ Archived: Utility organization (Phases 1-2 Complete)
- [2025-02-03_URL_PARSING_DUPLICATION.md](./2025-02-03_URL_PARSING_DUPLICATION.md) - ✅ Implemented: URL parsing code duplication resolution

## Incomplete Plans

These plans have been created but not yet implemented:

| File | Status | Created | Description |
|------|--------|---------|-------------|
| `INTERNAL_FILE_NAMING_REVIEW.md` | Not Started | 2025-02-01 | Review and re-evaluate internal file naming convention |
| `2025-02-01_FILE_REFACTORING.md` | Not Started | 2025-02-01 | Refactor files >300 lines that violate SRP |
| `ESLINT_PLUGIN.md` | Not Started | 2025-02-01 | Create @blue/eslint-plugin with architectural rules + enforcement mechanisms |
| `2025-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md` | Ready for Implementation | 2025-02-03 | Consolidate query string and matrix string utilities from router to http |

**Note:** At the start of each session, review this list and consider if any plans should be addressed.

## Naming Convention

Plan files follow the format: `YYYY-MM-DD_DESCRIPTION.md`

Where:
- `YYYY-MM-DD` - Date the plan was created (ISO 8601 format)
- `_` - Underscore separator (consistent with UPPER_SNAKE_CASE constants)
- `DESCRIPTION` - Brief description in ALL_CAPS with underscores for multi-word phrases

## Purpose

Implementation plans provide:
- Detailed technical specifications
- Step-by-step implementation approach
- Testing and validation strategies
- Timeline and milestones
- Dependencies and prerequisites
