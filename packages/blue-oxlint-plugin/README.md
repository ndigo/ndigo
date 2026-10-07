# Blue Oxlint Plugin

> Custom oxlint rules for BlueJS — enforce architecture conventions like encapsulated-import boundaries and canonical doc headers.

Custom **oxlint** rules that enforce BlueJS architecture conventions.

## Installation

```bash
pnpm add -D @blue/oxlint-plugin
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```jsonc
// .oxlintrc.json — load the plugin and enable a rule
{
    "jsPlugins": ["@blue/oxlint-plugin"],
    "rules": {
        "@blue/no-internal-file-imports": "error",
    },
}
```

## Usage

### Rules

| Rule                                     | Enforces                                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/no-direct-integration-imports`    | Imports of encapsulated libraries go through their integration packages, never directly                                            |
| `@blue/no-internal-file-imports`         | No cross-package imports of internal files (`_*.ts`)                                                                               |
| `@blue/no-internal-file-exports`         | No barrel re-exports of internal files                                                                                             |
| `@blue/no-browser-globals-in-isomorphic` | Isomorphic code must not reference browser globals                                                                                 |
| `@blue/no-mixed-case-acronyms`           | Acronyms follow `STYLE_GUIDE` casing                                                                                               |
| `@blue/no-uppercase-regexp-constants`    | RegExp instances are objects — camelCase                                                                                           |
| `@blue/no-cross-paradigm-decorators`     | Decorator families stay within their paradigm                                                                                      |
| `@blue/no-scheduled-in-browser`          | Disallow `@blue/scheduler` imports in browser-platform files                                                                       |
| `@blue/no-signals-in-entity`             | `@blue/signals` reactivity does not leak into entities                                                                             |
| `@blue/no-string-registry-lookup`        | Disallow string-literal registry lookups in source files                                                                           |
| `@blue/no-unsafe-view-name-literal`      | View-name literals are relative — no absolute prefixes, `..` segments, or NUL bytes (DSV-SEC-1)                                    |
| `@blue/no-duplicate-mapping-path`        | Duplicate method-level mapping paths of the same decorator kind in one class (class-local, best-effort); disabled in specs         |
| `@blue/no-abstract-class-without-prefix` | Abstract classes use the `Abstract`/`As` prefix convention                                                                         |
| `@blue/requires-doc-header`              | Source files begin with the canonical doc header (`@module`/`@since`/`@author`); repair with `nx generate @blue/generators:header` |

`no-duplicate-mapping-path` is method-level, class-local, and best-effort: it
compares only mapping decorators syntactically attached to methods of a single
class declaration, groups by normalized path AND decorator kind (so a
`@getMapping` and a `@postMapping` on one path are fine), and skips any
registration carrying extra conditions (`matrixParams`, `params`, …). Class-level
decorator paths are prefixes merged with the method paths and are never compared.
Paths composed dynamically, or contributed by a base class, are not seen. Deliberate
duplicate-registration fixtures are legitimate, so the rule is `off` in the repo's
spec/test override block.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/oxlint-plugin build:lib
pnpm --filter @blue/oxlint-plugin test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
