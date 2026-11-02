# @blue/generators

> Nx generators for BlueJS — scaffold applications, packages, components, READMEs, and standard documentation headers.

Nx generators for BlueJS application, package, component, README, and documentation-header scaffolding.

## Installation

```bash
pnpm add @blue/generators
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```bash
# New application (writes apps/NN-blue-<name>/ through the `app` generator;
# `blue new <name>` from @blue/cli fronts the same generator)
pnpm exec nx generate @blue/generators:app --name hello-widget --kind node

# New package (writes packages/blue-<name>/, index.ts with standard header)
pnpm exec nx generate @blue/generators:package --name my-package

# New package README on the standard template
pnpm exec nx generate @blue/generators:readme --name my-package
```

## Usage

### Generators

| Generator   | Purpose                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `app`       | Scaffold an example application under `apps/NN-blue-<name>` (`node` or `browser` kind), allocating number + port  |
| `package`   | Scaffold a new `@blue/*` package: manifest, tsconfigs, empty `src/`/`test/`, and a standard-header `src/index.ts` |
| `component` | Generate a source + test file pair in an existing package, with the standard doc header                           |
| `header`    | Add or replace the standard documentation header on an existing source file                                       |
| `readme`    | Scaffold a new package `README.md` on the standard BlueJS template                                                |

### App generator options

| Option          | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `--name`        | App slug (kebab-case, without the `blue-` prefix; required)           |
| `--kind`        | `node` (HTTP server) or `browser` (Vite SPA); required                |
| `--number`      | Reading-order number (defaults to one past the highest existing app)  |
| `--port`        | Dev port (defaults to the first free multiple-of-ten slot above 3000) |
| `--description` | One-line description used in the manifest and README                  |

### Component + header generators

```bash
# New component inside an existing package (src + spec with standard headers)
pnpm exec nx generate @blue/generators:component --name my-service --package core \
    --summary "My service wires X to Y"

# Standardize an existing file's header (module inferred from its path)
pnpm exec nx generate @blue/generators:header --file packages/blue-core/src/widget.ts \
    --summary "Widget utilities"

# Replace a non-standard top doc block
pnpm exec nx generate @blue/generators:header --file apps/03-blue-todo/src/index.ts --force
```

### Header generator options

| Option      | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| `--file`    | Target file (required)                                                |
| `--module`  | `@module` value; inferred from the path (`blue-*` package / app name) |
| `--summary` | One-line description (omitted when not given)                         |
| `--author`  | `@author` value (default `Jeff Rose`)                                 |
| `--force`   | Replace the existing top block instead of failing (idempotent guard)  |

`header` is intentionally dependency-free and does not run `formatFiles`: its output is canonical by construction, and the formatting hook pulls in the classic TypeScript API the TypeScript 7 runtime no longer exposes.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/generators test
```

Nx loads the generator factories with Node's native TypeScript stripping,
which requires exact specifiers: relative imports in Nx-loaded generator
files carry the `.ts` extension (AD-85), and the package tsconfigs set
`rewriteRelativeImportExtensions` so `tsc` emits `.js` for the built
`lib/`. Keep the flag in sync between `tsconfig.json` and
`tsconfig.build.json` when touching either.

## See Also

- [@blue/core](../blue-core/README.md) — packages the `header` and `readme` generators standardize

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
