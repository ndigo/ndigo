# Internal oxlint rules (`src/oxlint/`)

Repository-only oxlint rules — the enforcement that applies to _this_
monorepo (integration-layer boundaries, internal-file hygiene, house style,
and the two rules that key off this repository's package layout) rather than
to Ndigo application code. Consumer-facing rules live in
[`@ndigo/oxlint-plugin`](../../packages/ndigo-oxlint-plugin/README.md).

`src/` is the home for repo-only cross-package concerns (AD-86); this
directory is **not a package** — no `package.json`, no build step, no
published artifact.

## Loading

Root `.oxlintrc.json` registers `plugin.ts` as an oxlint JS plugin under the
`internal` alias:

```jsonc
"jsPlugins": [
  "./packages/ndigo-oxlint-plugin/lib/index.js",
  { "name": "internal", "specifier": "./src/oxlint/plugin.ts" }
]
```

oxlint executes the TypeScript directly (Node ≥24 type stripping), so:

- relative imports **must** carry explicit `.ts` extensions — the loader
  resolves them against the filesystem, not through a compiler;
- there is no build step, workspace membership, or lockfile entry.

## Rules

| Rule                                           | Enforces                                                                                                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `internal/no-direct-integration-imports`       | Imports of encapsulated libraries go through their integration packages, never directly                                                                               |
| `internal/no-internal-file-imports`            | No cross-package imports of internal files (`_*.ts`)                                                                                                                  |
| `internal/no-internal-file-exports`            | No barrel re-exports of internal files at any `src/**/index.ts` depth                                                                                                 |
| `internal/no-abstract-class-without-prefix`    | Abstract classes use the `Abstract`/`As` prefix convention                                                                                                            |
| `internal/no-mixed-case-acronyms`              | Acronyms follow `STYLE_GUIDE` casing                                                                                                                                  |
| `internal/no-uppercase-regexp-constants`       | RegExp instances are objects — camelCase                                                                                                                              |
| `internal/no-global-state-in-create-factories` | `create*` factories must not reference mutable module/class state — the `create*` vs `get*` split                                                                     |
| `internal/no-browser-globals-in-isomorphic`    | Browser globals are guarded in isomorphic packages; browser-only packages (`@ndigo/platform-web`, `@ndigo/dom`, `@ndigo/view-webcomponent`, `@ndigo/boot`) are exempt |
| `internal/no-raw-console`                      | Raw `console.warn`/`console.error`/`console.log` calls in package source go through `@ndigo/log` (allow-listed: `@ndigo/log`, `@ndigo/util`)                          |
| `internal/requires-doc-header`                 | Source files begin with the canonical doc header (`@since`/`@author`)                                                                                                 |
| `internal/no-upward-layer-imports`             | Package imports flow only downward through the derived layer ranks (see below)                                                                                        |

`no-browser-globals-in-isomorphic` and `no-raw-console` returned from the
consumer package until they are de-hardcoded for app repos (#116) — both key
off this repository's `packages/ndigo-*` layout.

## Layer ranks

`_layers.ts` assigns every runtime package a rank derived from the actual
dependency direction — `rank(p) = 1 + max(rank(deps))` over `dependencies` and
`peerDependencies`, never `devDependencies` (tests and benches may reach across
layers). `internal/no-upward-layer-imports` applies to runtime `src/**` code
and allows an import only when the target's rank is at or below the importer's;
equal ranks are siblings and may cross-import freely. Tooling packages
(`@ndigo/cli`, `create-ndigo-app`, `@ndigo/oxlint-plugin`, `@ndigo/test`) sit
outside the layer system.

The ranks are a **derived** artifact: `test/layers.spec.ts` recomputes them
from the package manifests and fails on drift, and walks every package's `src/`
(the enforced surface) to prove no upward imports exist. A dependency change
that reorders the graph therefore fails `pnpm test:internal` until `_layers.ts`
is updated deliberately.

## Specs

`test/rules/*.spec.ts` and `test/layers.spec.ts` run under the root vitest
config:

```bash
pnpm test:internal
```
