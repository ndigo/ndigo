# Blue Oxlint Plugin

Custom **oxlint** rules that enforce BlueJS architecture conventions.

## Installation

```bash
pnpm add -D @blue/oxlint-plugin
```

## Rules

| Rule | Enforces |
| -----| -------- |
| `@blue/no-direct-integration-imports` | Imports of encapsulated libraries go through their integration packages, never directly |
| `@blue/no-internal-file-imports` | No cross-package imports of internal files (`_*.ts`) |
| `@blue/no-internal-file-exports` | No barrel re-exports of internal files |
| `@blue/no-browser-globals-in-isomorphic` | Isomorphic code must not reference browser globals |
| `@blue/no-mixed-case-acronyms` | Acronyms follow `STYLE_GUIDE` casing |
| `@blue/no-uppercase-regexp-constants` | RegExp instances are objects — camelCase |
| `@blue/no-cross-paradigm-decorators` | Decorator families stay within their paradigm |
| `@blue/no-signals-in-entity` | `@blue/signals` reactivity does not leak into entities |
| `@blue/no-abstract-class-without-prefix` | Abstract classes use the `Abstract`/`As` prefix convention |
| `@blue/requires-doc-header` | Source files begin with the canonical doc header (`@module`/`@since`/`@author`); repair with `nx generate @blue/generators:header` |

## Integration Layer Concept

BlueJS wraps external libraries behind stable framework-facing contracts:

- `@blue/util` re-exports curated functionality (native implementations — the
  Ramda/arcsecond-based layers were removed)
- Other packages import helpers through those layers

This plugin keeps the boundary honest by refusing direct integration-package
imports.

## Development

```bash
pnpm --filter @blue/oxlint-plugin build:lib
pnpm --filter @blue/oxlint-plugin test
```