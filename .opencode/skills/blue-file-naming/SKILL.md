---
name: blue-file-naming
description: BlueJS file/module naming rules, internal module conventions, and utility extraction guidelines.
---

# Blue File Naming

## File Naming

- Source files: `kebab-case.ts`.
- Internal-only files: underscore prefix (`_util.ts`, `_validators.ts`).
- Test helpers may also use underscore prefix in `test/`.

## Internal vs Public Modules

- Public API must be exported through `src/index.ts`.
- Internal underscore modules are implementation details.
- Never import underscore modules across packages.

## Utility Extraction Guidance

1. One use: keep inline.
2. Three+ uses in same category: extract dedicated utility file.
3. Four+ uses cross-category in same package: extract to `_util.ts` or domain internal file.
4. Cross-package reuse: promote to `@blue/util`.

## Naming Patterns

- Interfaces: `[Domain][Role]`.
- Concrete classes: `[Description][Role]`.
- Abstract classes: `Abstract[Description][Role]`.
- Role suffixes: `*Handler`, `*Resolver`, `*Strategy`, `*Factory`, etc.
