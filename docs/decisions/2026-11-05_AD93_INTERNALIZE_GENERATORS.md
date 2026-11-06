# AD-93: `packages/` stays consumer-only — the generator collection moves to `tools/`

**Date:** 2026-11-05
**Status:** Accepted
**Deciders:** Framework owner (2026-11-05)

---

## Context

AD-86 D1 made `packages/` the consumer surface — every directory there must
be publishable, and repo-only tooling lives elsewhere. `@ndigo/generators`
predates that rule and violated its intent: it is repo-shaped tooling (it
hard-codes `packages/ndigo-*` and `apps/NN-*` paths, edits
`vitest.aliases.ts`, and bakes in this repository's manifest rules), yet it
sat in `packages/` as a publishable-shaped package because the gate's only
hard stop is `private: true` and AD-85 D-4.3 deferred its publish decision.
Nothing consumes it as a package: `@ndigo/cli` shells
`nx g @ndigo/generators:*`, resolved through pnpm workspace hoisting.

## Decision

### D-1 — Internalize the collection

`@ndigo/generators` moves to `tools/generators/` as a `private: true`
workspace member (`tools/*` in `pnpm-workspace.yaml`). The name stays
`@ndigo/generators`, so `ndigo new` / `ndigo generate` and every documented
`nx g @ndigo/generators:*` invocation keep working unchanged; `private`
hard-stops any publish. The collection drops out of `pnpm doc:api` and
`manifest:check` (both `packages/`-scoped) and out of the layer system
(AD-89's tooling set).

### D-2 — The repo-only homes are role-based

- `scripts/` — one-shot probes and root tooling entry points.
- root `src/` — repo-only code loaded **by path**, with no package identity:
  the internal oxlint plugin (`.oxlintrc.json` points at
  `./src/oxlint/plugin.ts`; no `package.json`, no workspace membership, no
  build).
- `tools/` — repo-only code that must **present as a package**: a resolvable
  name (`nx g @ndigo/generators:*`), a collection manifest
  (`generators.json`), workspace-linked dependencies (`@nx/devkit`,
  `@ndigo/util`). This is Nx's own local-plugin convention
  (`nx g @nx/plugin:plugin tools/<name>`; the docs' caution: "use the name
  defined in `tools/my-plugin/package.json`").
- `packages/` — consumer packages only.

### D-3 — Public-intent classification corrected

Of the three packages AD-85 D-4.3 grouped as "repo-only tooling", only
`@ndigo/generators` is repo-only: `@ndigo/oxlint-plugin` is the consumer
rule set (AD-86 D2) and `@ndigo/inspect` is the editor/CI manifest substrate
(AD-70 D-4). Their publish decisions stand on their own records.

## Alternatives considered

- **Move to root `src/`.** Rejected: `src/` is contractually "not a package"
  (no `package.json`, no workspace membership), and a generator collection
  cannot be loaded by path — Nx resolves it by package name. Package
  identity is the requirement that decides the home.
- **Keep it in `packages/` as `private: true`.** Rejected: AD-86 D1 forbids
  private packages under `packages/` (mechanically enforced), and the
  surface's meaning is exactly what this change restores.
- **Publish it.** Rejected (AD-85 D-4.3, revisited): it is shaped by this
  repository's layout. The consumer Nx story, if it lands, is a new package
  (AD-85 D-3's `@ndigo/nx` plugin), not this collection.

## Consequences

- `packages/` contains only consumer packages — AD-86 D1 holds with no
  exceptions.
- The generators keep their Nx loading constraints (Node type-stripping,
  `.ts` specifiers, `rewriteRelativeImportExtensions`) and their lanes via
  Nx project inference; `tools/*` joins the `typecheck` filters; the alias
  table and spec tsconfig point at `tools/generators/src`.
- The repo-only homes each have one documented sentence:
  [`tools/README.md`](../../tools/README.md) and
  [`src/README.md`](../../src/README.md).
- Revisit trigger: a second package-shaped repo-only tool appears (then
  `tools/` is proven as a home), or the collection needs consumer
  distribution (then it graduates to a new package per AD-85 D-3).

## References

- AD-86 D1 (the published surface), AD-85 D-4.3 (the deferred decision this
  resolves), AD-70 D-4 (`@ndigo/inspect`), AD-89 (`_layers.ts` tooling set).
- The moved collection: `tools/generators/` (formerly
  `packages/ndigo-generators/`).
