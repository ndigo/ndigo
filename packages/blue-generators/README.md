# @blue/generators

Nx generators for BlueJS package, component, and documentation-header
scaffolding.

## Generators

| Generator  | Purpose                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `package`  | Scaffold a new `@blue/*` package: manifest, tsconfigs, empty `src/`/`test/`, and a standard-header `src/index.ts` |
| `component`| Generate a source + test file pair in an existing package, with the standard doc header        |
| `header`   | Add or replace the standard documentation header on an existing source file                    |

## The standard documentation header

Every BlueJS source file starts with one canonical TSDoc block (`@module`,
`@since`, `@author` — see `STYLE_GUIDE.md` §5):

```
/**
 * <One-line summary ending with a period>.
 *
 * @module blue-<package>
 * @since 1.0.0
 * @author Jeff Rose
 */
```

## Usage

```bash
# New package (writes packages/blue-<name>/, index.ts with standard header)
pnpm exec nx generate @blue/generators:package --name my-package

# New component inside an existing package (src + spec with standard headers)
pnpm exec nx generate @blue/generators:component --name my-service --package core \
    --summary "My service wires X to Y"

# Standardize an existing file's header (module inferred from its path)
pnpm exec nx generate @blue/generators:header --file packages/blue-core/src/widget.ts \
    --summary "Widget utilities"

# Replace a non-standard top doc block
pnpm exec nx generate @blue/generators:header --file apps/blue-todo/src/index.ts --force
```

### Header generator options

| Option     | Description                                                            |
| ---------- | ---------------------------------------------------------------------- |
| `--file`   | Target file (required)                                                 |
| `--module` | `@module` value; inferred from the path (`blue-*` package / app name)  |
| `--summary`| One-line description (omitted when not given)                          |
| `--author` | `@author` value (default `Jeff Rose`)                                  |
| `--force`  | Replace the existing top block instead of failing (idempotent guard)  |

`header` is intentionally dependency-free and does not run `formatFiles`:
its output is canonical by construction, and the formatting hook pulls in the
classic TypeScript API the TypeScript 7 runtime no longer exposes.

## Development

```bash
pnpm --filter @blue/generators test
pnpm --filter @blue/generators build:lib
```