# AD-86: `packages/` is the consumer surface — repo-only lint rules live in root `src/`

**Date:** 2026-10-31
**Status:** Accepted
**Deciders:** Framework owner (pre-1.0 lint surface review — issue #50)

---

## Context

`@ndigo/oxlint-plugin` bundles 16 rules that serve two different missions:

- **Consumer-usage guards** (8) catch wrong use of the ndigo API in app
  code: they fire on decorator/paradigm mistakes, unsafe view-name literals,
  string registry lookups, duplicate mapping paths, `@scheduled` in browser
  code, and `console` bypassing `@ndigo/log`. These are meaningful to every
  app author — and to their agents: oxlint ships `oxlint --lsp` (editor
  delivery) and shareable configs via `oxlint.config.ts` `extends`, so a
  published rule set plus preset reaches consumer editors, CI, and agent
  shells through one artifact.
- **Repo-only guards** (8) enforce this monorepo's layout and house style:
  integration-layer boundaries keyed to `/packages/ndigo-*` paths
  (`no-direct-integration-imports`), internal-file imports/exports, doc
  headers (module/since/author), acronym casing, the `Abstract` prefix,
  UPPERCASE regexp constants, and create-factory global state.

Both missions ride the same package. That conflicts with two directions:

1. `packages/` is the published product surface. A package that is _not_
   intended for consumers breaks the namespace's meaning — the directory a
   reader (human or agent) treats as "installable ndigo" must not contain
   repo-only tooling.
2. The planned consumer artifact — a published plugin plus a
   `recommended` preset, wired by `ndigo init` — needs the public package to
   be publishable, documented, tested, and free of monorepo assumptions.
   If the repo-only rules stay, they become de-facto public API and
   maintenance surface.

Root `src/` previously held a barrel shim (`export * from '@ndigo/core'`)
deleted 2026-10-04 as dead. Reviving the location gives repo-only
cross-package concerns a home outside `packages/`.

**Feasibility evidence (probed 2026-10-31, oxlint 1.90, Node 24.22):**

- oxlint executes raw TypeScript jsPlugins directly — a single-file plugin
  and a multi-file plugin with relative `./rule.ts` imports both reported
  correctly; no build step is involved.
- The explicit alias form
  `{ "name": "internal", "specifier": "./src/oxlint/plugin.ts" }` registers
  a stable rule namespace.
- Two plugins coexist in one config: the string form
  (`./packages/ndigo-oxlint-plugin/lib/index.js`, namespace `@ndigo`) next to
  the aliased internal plugin — both fired in the same run.
- Root `engines` already require Node ≥24, so type-stripping is guaranteed
  in dev and CI. (Upstream jsPlugins is still alpha and not semver'd —
  acceptable for a repo-internal plugin; the published package keeps
  shipping compiled JS so consumers' Node/oxlint setups are not assumed to
  execute TS.)

## Decision

### D1 — `packages/` is the published surface

Every directory under `packages/` must be publishable: not `private: true`,
and carrying the artifacts of a consumer package (`files`, `exports`,
README, generated API docs). Repo-only tooling lives elsewhere: `scripts/`
(root probes), root `src/` (cross-package concerns), `agent-local/` (agent
overrides). `scripts/check-manifests.mjs` enforces the boundary so the
principle cannot silently regress.

### D2 — One rule set per mission

The consumer mission stays in `@ndigo/oxlint-plugin` and is exactly the eight
usage guards listed above. The repo-only eight move out:

| Moved to root `src/` (new rule ID)             |
| :--------------------------------------------- |
| `internal/no-direct-integration-imports`       |
| `internal/no-internal-file-imports`            |
| `internal/no-internal-file-exports`            |
| `internal/no-uppercase-regexp-constants`       |
| `internal/no-abstract-class-without-prefix`    |
| `internal/no-mixed-case-acronyms`              |
| `internal/requires-doc-header`                 |
| `internal/no-global-state-in-create-factories` |

A rule is public iff it guards use of the framework API; it is repo-only iff
it enforces this monorepo's layout or house style.

### D3 — Root `src/` hosts repo-only cross-package concerns; the internal plugin is uncompiled TS

`src/oxlint/` holds `plugin.ts`, `rules/`, and the moved specs. It is
**not** a package: no `package.json`, no workspace membership, no build
output, no published artifact. Root `.oxlintrc.json` loads it with an
explicit alias:

```json
"jsPlugins": [
  "./packages/ndigo-oxlint-plugin/lib/index.js",
  { "name": "internal", "specifier": "./src/oxlint/plugin.ts" }
]
```

A `src/README.md` states the purpose so the location is not mistaken for a
package source tree or a new barrel (its predecessor was deleted as one).

### D4 — The consumer surface is evolved as follow-up work

De-hardcoding the eight public rules for app repos (path assumptions,
hardcoded `@ndigo/*` package lists), the `recommended` preset, and
`ndigo init` wiring are separate issues. This ADR fixes the boundary; it does
not ship the consumer artifact.

## Consequences

- Rule IDs change for the eight moved rules (`@ndigo/x` → `internal/x`); the
  root config is updated. Effective coverage on `packages/` + `apps/` is
  unchanged.
- `pnpm lint` keeps building only the public plugin; the internal rules need
  no build step (`src/oxlint` specs run via `pnpm test:internal`, wired as
  its own CI step; `tsconfig.spec.json` covers `src/**`).
- `@ndigo/oxlint-plugin` shrinks to the consumer surface; its README and
  generated `api/` tree reflect that. No consumer import paths change (the
  repository is unpublished; there are no external consumers).
- `check-manifests` gains the publishable-surface guardrail — the D1
  principle is mechanically enforced, not just documented.
- Docs updated: AGENTS.md §4.4 (rule table, "Updating Rules" path),
  ARCHITECTURE.md lint references, AD-45 path note.
- Follow-ups (separate issues): consumer preset + de-hardcoding +
  `todomvc/examples/bluejs` smoke test; `ndigo init` wiring.
- **Revisit trigger:** oxlint dropping TS jsPlugin execution (internal rules
  would then need compiling), or the consumer preset needing rule sources
  shared with the repo.

## Alternatives considered

- **Rename the package to `@ndigo/oxlint-plugin-private`, add a new public
  package.** Rejected: still places repo-only tooling under `packages/`,
  contradicting D1, and drags it through the full package discipline
  (README, API docs, manifest conformance).
- **A `tools/oxlint-internal/` directory.** Rejected: root `src/` is the
  agreed home for repo-only cross-package concerns; a bare folder is viable
  precisely because oxlint executes TS plugins, so no build or package
  scaffolding is needed.
- **Keep all 16 rules public behind a "repo" preset.** Rejected:
  repo-layout and house-style rules would become de-facto public API — the
  exact surface burden AD-84 removed for `@ndigo/util`.
- **Ship the internal rules as a private workspace package.** Rejected:
  unnecessary machinery — no build step, dependency graph, or publish
  metadata is required for TS files oxlint loads directly.
