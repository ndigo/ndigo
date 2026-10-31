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

| Rule                                     | Enforces                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@blue/no-direct-integration-imports`    | Imports of encapsulated libraries go through their integration packages, never directly                                                                 |
| `@blue/no-internal-file-imports`         | No cross-package imports of internal files (`_*.ts`)                                                                                                    |
| `@blue/no-internal-file-exports`         | No barrel re-exports of internal files at any `src/**/index.ts` depth                                                                                   |
| `@blue/no-browser-globals-in-isomorphic` | Isomorphic code must not reference browser globals                                                                                                      |
| `@blue/no-mixed-case-acronyms`           | Acronyms follow `STYLE_GUIDE` casing                                                                                                                    |
| `@blue/no-uppercase-regexp-constants`    | RegExp instances are objects — camelCase                                                                                                                |
| `@blue/no-cross-paradigm-decorators`     | Decorator families stay within their paradigm                                                                                                           |
| `@blue/no-scheduled-in-browser`          | Disallow `@blue/scheduler` imports in browser-platform files                                                                                            |
| `@blue/no-signals-in-entity`             | `@blue/signals` reactivity does not leak into entities                                                                                                  |
| `@blue/no-string-registry-lookup`        | Disallow string-literal registry lookups in source files                                                                                                |
| `@blue/no-unsafe-view-name-literal`      | View-name literals are relative — no absolute prefixes, `..` segments, or NUL bytes (DSV-SEC-1); `IslandView` names must be valid custom-element tags   |
| `@blue/no-duplicate-mapping-path`        | Duplicate method-level mapping paths of the same HTTP-method identity in one class (class-local, best-effort); disabled in specs                        |
| `@blue/no-abstract-class-without-prefix` | Abstract classes use the `Abstract`/`As` prefix convention                                                                                              |
| `@blue/requires-doc-header`              | Source files begin with the canonical doc header (`@module`/`@since`/`@author`); repair with `nx generate @blue/generators:header`                      |
| `@blue/no-raw-console`                   | Raw `console.warn`/`console.error`/`console.log` calls in package source are banned — log through `@blue/log` (allow-listed: `@blue/log`, `@blue/util`) |

`no-duplicate-mapping-path` is method-level, class-local, and best-effort: it
compares only mapping decorators syntactically attached to methods of a single
class declaration and groups by normalized path AND resolved HTTP-method
identity — the method-less family (`routeMapping`, `requestMapping`,
`publicMapping`, `privateMapping`, `socketMapping`, `stompMapping`, i.e. "any
method") shares one bucket, while the verb decorators (`getMapping`, …,
`queryMapping`) each map to their fixed method, so `@getMapping` and
`@postMapping` on one path are fine but `@routeMapping` and `@requestMapping`
on one path are not. It resolves aliased decorator identifiers (renamed imports
and local `const` aliases), accepts no-substitution template literals, and skips
any registration carrying extra conditions (`matrixParams`, `params`, `method`,
…). Class-level decorator paths are prefixes merged with the method paths and are
never compared. Paths composed dynamically, or contributed by a base class, are
not seen. Deliberate duplicate-registration fixtures are legitimate, so the rule
is `off` in the repo's spec/test override block.

`no-raw-console` scopes itself to `packages/blue-*/src/**` and reports direct
`console.warn`/`console.error`/`console.log` call sites, steering framework
logging through `@blue/log` (the `getLogger(...)` seam) so records follow the
configured logger and carry trace context. `@blue/log` (the console bridge
itself) and `@blue/util` (the documented leaf exception) are allow-listed, and
spec/test files are out of scope — they legitimately spy on the console.

`no-unsafe-view-name-literal` branches on the callee: `IslandView` is validated
against the custom-element tag grammar (lowercase, ≥1 hyphen, non-reserved)
while `ModelAndView` and `resolveViewName` keep the relative-path (DSV-SEC-1)
contract. The rule's predicates are asserted against the runtime helpers
(`isSafeViewName`, `isValidCustomElementName`) over a shared vector table.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
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
