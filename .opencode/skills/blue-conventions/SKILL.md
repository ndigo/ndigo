---
name: blue-conventions
description: Core BlueJS coding conventions, dependency boundaries, naming rules, and ESM requirements.
---

# Blue Conventions

Use this skill whenever implementing or reviewing TypeScript/JavaScript changes in BlueJS.

## Core Rules

1. **ESM only**
    - No CommonJS `require`.
2. **Library Integration Layer**
    - Import encapsulated dependencies through integration packages.
    - Use `@blue/util` for `ramda`, `date-fns`, `date-fns-tz`, `seedrandom`, `slug`.
    - Use `@blue/parser` for `arcsecond`.
    - Use `@blue/model` for `objectmodel`.
3. **Decorators**
    - TC39 Stage 3 decorators only.
    - Decorators must be `camelCase` (e.g., `@injectable`, `@routeMapping`).
4. **Naming conventions**
    - Types/classes/interfaces: `PascalCase`.
    - Variables/functions/methods: `camelCase`.
    - Predicate functions: `is*`; duck typing: `like*`.
    - Acronyms in types: all-uppercase (`HTTPTransformer`, `JSONParser`).
5. **Transducers**
    - Transformer classes use `X*` prefix (`XCount`, `XToArray`).
    - Transformer variables use `xf` / `xform`.
6. **Error handling**
    - Prefer specific errors (e.g., `IllegalStateError`) over generic `Error`.

## Quick Checklist

- [ ] No direct imports from encapsulated libraries.
- [ ] Naming matches STYLE_GUIDE.
- [ ] Decorator names are camelCase.
- [ ] Internal files (`_*.ts`) are not exported publicly.

## References

- `AGENTS.md`
- `STYLE_GUIDE.md`
- `ARCHITECTURE.md`
- `references/IMPORT_RULES.md`
