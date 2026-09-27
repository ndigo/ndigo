# Blue Oxlint Plugin

> Custom oxlint rules for BlueJS — enforce architecture conventions like encapsulated-import boundaries and canonical doc headers.

Custom **oxlint** rules that enforce BlueJS architecture conventions.

## Installation

```bash
pnpm add -D @blue/oxlint-plugin
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Rules

| Rule                                     | Enforces                                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/no-direct-integration-imports`    | Imports of encapsulated libraries go through their integration packages, never directly                                            |
| `@blue/no-internal-file-imports`         | No cross-package imports of internal files (`_*.ts`)                                                                               |
| `@blue/no-internal-file-exports`         | No barrel re-exports of internal files                                                                                             |
| `@blue/no-browser-globals-in-isomorphic` | Isomorphic code must not reference browser globals                                                                                 |
| `@blue/no-mixed-case-acronyms`           | Acronyms follow `STYLE_GUIDE` casing                                                                                               |
| `@blue/no-uppercase-regexp-constants`    | RegExp instances are objects — camelCase                                                                                           |
| `@blue/no-cross-paradigm-decorators`     | Decorator families stay within their paradigm                                                                                      |
| `@blue/no-signals-in-entity`             | `@blue/signals` reactivity does not leak into entities                                                                             |
| `@blue/no-abstract-class-without-prefix` | Abstract classes use the `Abstract`/`As` prefix convention                                                                         |
| `@blue/requires-doc-header`              | Source files begin with the canonical doc header (`@module`/`@since`/`@author`); repair with `nx generate @blue/generators:header` |

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
