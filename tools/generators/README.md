# `@ndigo/generators` — repo-local Nx generators

The Nx generator collection behind `ndigo new` / `ndigo generate` (the
[`@ndigo/cli`](../../packages/ndigo-cli/README.md) workspace commands). This
is **repo-only tooling** (`tools/`, AD-93): it hard-codes this repository's
layout (`packages/ndigo-*`, `apps/NN-*`, `vitest.aliases.ts`) and bakes in
the repo's manifest rules, so it is a private workspace member and is never
published. Consumer scaffolding is
[`create-ndigo-app`](../../packages/create-ndigo-app/README.md); the deferred
consumer Nx story (AD-85 D-3) would be a new package, not this collection.

## Generators

| Generator   | Purpose                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `app`       | Scaffold an example application under `apps/NN-ndigo-<name>` (`node` or `browser` kind), allocating number + port  |
| `package`   | Scaffold a new `@ndigo/*` package: manifest, tsconfigs, empty `src/`/`test/`, and a standard-header `src/index.ts` |
| `component` | Generate a source + test file pair in an existing package, with the standard doc header                            |
| `header`    | Add or replace the standard documentation header on an existing source file                                        |
| `readme`    | Scaffold a new package `README.md` on the standard Ndigo template                                                  |

## Running

```bash
pnpm exec nx generate @ndigo/generators:app --name hello-widget --kind node
pnpm exec nx generate @ndigo/generators:package --name my-package
pnpm exec nx generate @ndigo/generators:readme --name my-package
pnpm exec nx generate @ndigo/generators:component --name my-service --package core --summary "My service wires X to Y"
pnpm exec nx generate @ndigo/generators:header --file packages/ndigo-core/src/widget.ts --summary "Widget utilities"
```

`ndigo new <name>` and `ndigo generate <kind>` front the same collection; the
`app` generator's options are documented in
[guide 25](../../docs/guides/25-ndigo-cli.md). `header` is intentionally
dependency-free and does not run `formatFiles`: its output is canonical by
construction (see the generator's TSDoc).

## Development

```bash
pnpm --filter @ndigo/generators build:lib
pnpm --filter @ndigo/generators test
```

Nx loads the generator factories with Node's native TypeScript stripping,
which requires exact specifiers: relative imports in Nx-loaded generator
files carry the `.ts` extension (AD-85), and the package tsconfigs set
`rewriteRelativeImportExtensions` so `tsc` emits `.js` for the built `lib/`.
Keep the flag in sync between `tsconfig.json` and `tsconfig.build.json` when
touching either.
