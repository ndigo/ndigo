---
name: blue-decorators
description: TC39 Stage 3 decorator conventions and naming rules for BlueJS.
---

# Blue Decorators

## Required Standard

- Use modern TC39 Stage 3 decorators.
- `@tsmetadata/polyfill` supports `Symbol.metadata` usage.
- Do not use legacy `reflect-metadata` patterns.

## Naming Rule (Critical)

- Decorator identifiers must be `camelCase`.
    - ✅ `@injectable`, `@routeMapping`
    - ❌ `@Injectable`, `@RouteMapping`

## Usage Guidance

- Keep decorators focused and side-effect aware.
- Match architecture separation-of-concerns patterns from `ARCHITECTURE.md`.
