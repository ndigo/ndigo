# AD-89: Layer-boundary enforcement — derived ranks, not named tiers

**Date:** 2026-11-03
**Status:** Accepted
**Deciders:** Framework owner (issue #80; 2026-11-03)

---

## Context

AD-88 kept the monorepo; issue #80 asked for mechanical enforcement of the
package layering so illegal imports fail the build instead of living in docs.
The stock mechanism — Nx `tags` + `depConstraints` — ships as
`@nx/enforce-module-boundaries`, an **ESLint** plugin. This repository lints
with oxlint plus its own `internal/*` plugin (AD-86), so the check had to be
repo-native either way.

A hand-tiered map (kernel → platform → views → …) was measured against the
real dependency graph and **does not fit**: `platform-node` is an aggregator
that imports ~18 packages (near the top, not the bottom), `dispatcher`
legitimately sits above `view`, and `boot` imports `router`/`context`. Any
named-tier scheme would be violated by today's tree, forcing either false
exceptions or a disruptive reorganization unrelated to the goal.

## Decision

Derive the order from the graph itself:

- `rank(p) = 1 + max(rank(d))` over `p`'s `dependencies` + `peerDependencies`;
  `devDependencies` are excluded (tests and benches may reach across layers).
  Leaf packages rank 0; the runtime graph is acyclic today.
- `src/oxlint/_layers.ts` commits that map (with rank-group comments) plus the
  tooling exemption list (`@ndigo/cli`, `@ndigo/generators`,
  `@ndigo/oxlint-plugin`, `@ndigo/test`).
- `internal/no-upward-layer-imports` reports every `@ndigo/<target>` import in
  a package's **runtime `src/**`** where the target's rank exceeds the
  importer's — static imports, re-exports and literal `import()` included.
  Equal ranks are siblings and may cross-import freely.
- `src/oxlint/test/layers.spec.ts` recomputes the ranks from the manifests
  (failing on drift or cycles) and walks every package's `src/` to prove zero
  upward imports; it runs with the other internal specs in the quality lane
  (`pnpm test:internal`).

## Consequences

- An upward import in runtime code fails `pnpm lint`; a dependency change that
  reorders the graph fails `pnpm test:internal` until `_layers.ts` is updated
  deliberately — the map cannot silently drift.
- Nx tags were **not** added: without the ESLint plugin they would be cosmetic
  metadata duplicating the map. If a second consumer appears (graph grouping,
  a future `depConstraints` bridge), tags can be generated from this data.
- The map is a snapshot of today's architecture: renaming or merging packages
  requires touching `_layers.ts` (the spec fails loudly otherwise).

**Revisit trigger:** a second consumer of the layer data (tags/tooling) or a
dependency graph that stops being acyclic — either reopens the ranking
mechanism.
