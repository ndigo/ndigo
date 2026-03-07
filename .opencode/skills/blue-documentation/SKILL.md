---
name: blue-documentation
description: Documentation structure and naming standards for BlueJS docs and guides.
---

# Blue Documentation

## Directory Structure

Project docs belong in:

- `docs/migrations/`
- `docs/plans/`
- `docs/reference/`
- `docs/audits/`

## Naming Convention

Use:

`YYYY-MM-DD_DESCRIPTION.md`

Examples:

- `2025-01-23_DEPENDENCIES.md`
- `2025-02-01_DEPENDENCY_AUDIT.md`

## Content Expectations

- Migration docs: breaking changes + upgrade path.
- Plan docs: technical approach + execution/testing strategy.
- Audit docs: findings + recommendations.
- Reference docs: technical specs/config/dependency references.

## Keep in Sync

If changing shared guidance boundaries, keep `README.md` and `AGENTS.md` synchronized.
