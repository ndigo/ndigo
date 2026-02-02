# Implementation Plans

This directory contains detailed implementation plans for major features and enhancements in the BlueJS project.

## Available Plans

- [2025-01-30_PARSER_ENHANCEMENT.md](./2025-01-30_PARSER_ENHANCEMENT.md) - Parser enhancement and optimization plan
- [2025-02-01_FILE_REFACTORING.md](./2025-02-01_FILE_REFACTORING.md) - File size refactoring plan for 15 large files
- [2025-02-01_UTILITY_ORGANIZATION.md](./2025-02-01_UTILITY_ORGANIZATION.md) - Utility organization violations and remediation plan (Phase 1 Complete)
- [INTERNAL_FILE_NAMING_REVIEW.md](./INTERNAL_FILE_NAMING_REVIEW.md) - Future review of internal file naming convention

## Incomplete Plans

These plans have been created but not yet implemented:

| File | Status | Created | Description |
|------|--------|---------|-------------|
| `INTERNAL_FILE_NAMING_REVIEW.md` | Not Started | 2025-02-01 | Review and re-evaluate internal file naming convention |
| `2025-02-01_FILE_REFACTORING.md` | Not Started | 2025-02-01 | Refactor files >300 lines that violate SRP |
| `2025-02-01_UTILITY_ORGANIZATION.md` | Phase 1 Complete | 2025-02-01 | Extract duplicated utilities (Phase 2+ pending) |

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
