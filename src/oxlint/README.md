# Internal oxlint rules (`src/oxlint/`)

Repository-only oxlint rules — the enforcement that applies to _this_
monorepo (integration-layer boundaries, internal-file hygiene, house style)
rather than to BlueJS application code. Consumer-facing rules live in
[`@blue/oxlint-plugin`](../../packages/blue-oxlint-plugin/README.md).

`src/` is the home for repo-only cross-package concerns (AD-85); this
directory is **not a package** — no `package.json`, no build step, no
published artifact.

## Loading

Root `.oxlintrc.json` registers `plugin.ts` as an oxlint JS plugin under the
`internal` alias:

```jsonc
"jsPlugins": [
  "./packages/blue-oxlint-plugin/lib/index.js",
  { "name": "internal", "specifier": "./src/oxlint/plugin.ts" }
]
```

oxlint executes the TypeScript directly (Node ≥24 type stripping), so:

- relative imports **must** carry explicit `.ts` extensions — the loader
  resolves them against the filesystem, not through a compiler;
- there is no build step, workspace membership, or lockfile entry.

## Rules

| Rule                                           | Enforces                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `internal/no-direct-integration-imports`       | Imports of encapsulated libraries go through their integration packages, never directly           |
| `internal/no-internal-file-imports`            | No cross-package imports of internal files (`_*.ts`)                                              |
| `internal/no-internal-file-exports`            | No barrel re-exports of internal files at any `src/**/index.ts` depth                             |
| `internal/no-abstract-class-without-prefix`    | Abstract classes use the `Abstract`/`As` prefix convention                                        |
| `internal/no-mixed-case-acronyms`              | Acronyms follow `STYLE_GUIDE` casing                                                              |
| `internal/no-uppercase-regexp-constants`       | RegExp instances are objects — camelCase                                                          |
| `internal/no-global-state-in-create-factories` | `create*` factories must not reference mutable module/class state — the `create*` vs `get*` split |
| `internal/requires-doc-header`                 | Source files begin with the canonical doc header (`@module`/`@since`/`@author`)                   |

## Specs

`test/rules/*.spec.ts` run under the root vitest config:

```bash
pnpm test:internal
```
