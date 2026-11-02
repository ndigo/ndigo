# `src/` — repo-only cross-package concerns

Code in this tree serves the BlueJS **repository itself** — never a consumer.
It is not a package: no `package.json`, no workspace membership, no build
step, no published artifact. Consumer-facing code lives in `packages/`
(AD-86); repo-only tooling that doesn't span packages lives in `scripts/`.

Current tenants:

- `oxlint/` — the internal oxlint plugin: repository-only rules (integration
  boundaries, internal-file hygiene, house style) loaded directly from
  TypeScript by oxlint. See [`oxlint/README.md`](oxlint/README.md).

If you are tempted to add a barrel here: don't — this location's predecessor
(`src/index.ts`, an `export * from '@blue/core'` shim) was deleted as dead
code on 2026-10-04.
