# Ndigo Oxlint Plugin

> Consumer-facing oxlint rules for Ndigo — guard application code against wrong framework usage.

Custom **oxlint** rules that catch common mistakes when building Ndigo
applications: mixed decorator paradigms, unsafe view names, string-literal
registry lookups, duplicate route mappings, reactivity leaking into entities,
and Node-only scheduling in browser code. Rules that key off the Ndigo
repository's own layout (integration-layer boundaries, internal-file hygiene,
doc headers, naming conventions, the console policy, and browser-global
guards) live in the repository's internal plugin at root `src/oxlint/` — they
are not part of this package.

## Installation

```bash
pnpm add -D @ndigo/oxlint-plugin
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```jsonc
// .oxlintrc.json — load the plugin and enable a rule
{
    "jsPlugins": ["@ndigo/oxlint-plugin"],
    "rules": {
        "@ndigo/no-cross-paradigm-decorators": "error",
    },
}
```

## Usage

### Rules

| Rule                                  | Enforces                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ndigo/no-cross-paradigm-decorators` | Decorator families stay within their paradigm                                                                                                         |
| `@ndigo/no-scheduled-in-browser`      | Disallow `@ndigo/scheduler` imports in browser-platform files                                                                                         |
| `@ndigo/no-signals-in-entity`         | `@ndigo/signals` reactivity does not leak into entities                                                                                               |
| `@ndigo/no-string-registry-lookup`    | Disallow string-literal registry lookups in source files                                                                                              |
| `@ndigo/no-unsafe-view-name-literal`  | View-name literals are relative — no absolute prefixes, `..` segments, or NUL bytes (DSV-SEC-1); `IslandView` names must be valid custom-element tags |
| `@ndigo/no-duplicate-mapping-path`    | Duplicate method-level mapping paths of the same HTTP-method identity in one class (class-local, best-effort); disabled in specs                      |

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

`no-unsafe-view-name-literal` branches on the callee: `IslandView` is validated
against the custom-element tag grammar (lowercase, ≥1 hyphen, non-reserved)
while `ModelAndView` and `resolveViewName` keep the relative-path (DSV-SEC-1)
contract. The rule's predicates are asserted against the runtime helpers
(`isSafeViewName`, `isValidCustomElementName`) over a shared vector table.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/oxlint-plugin build:lib
pnpm --filter @ndigo/oxlint-plugin test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
