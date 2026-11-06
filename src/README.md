# `src/` — repo-only cross-package concerns

Code in this tree serves the Ndigo **repository itself** — never a consumer.
It is not a package: no `package.json`, no workspace membership, no build
step, no published artifact. Consumer-facing code lives in `packages/`
(AD-86); repo-only tooling that doesn't span packages lives in `scripts/`.

Current tenants:

- `oxlint/` — the internal oxlint plugin: repository-only rules (integration
  boundaries, internal-file hygiene, house style) loaded directly from
  TypeScript by oxlint. See [`oxlint/README.md`](oxlint/README.md).

Package-shaped repo-only tooling — a resolvable name, a collection manifest,
workspace-linked dependencies — lives in [`tools/`](../tools/README.md)
instead (AD-93).

If you are tempted to add a barrel here: don't — this location's predecessor
(`src/index.ts`, an `export * from '@ndigo/core'` shim) was deleted as dead
code on 2026-10-04.
