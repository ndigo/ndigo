# AD-92: `create-ndigo-app` — standalone scaffold ships at 1.0

**Date:** 2026-11-05
**Status:** Accepted
**Deciders:** Framework owner (2026-11-05)

---

## Context

AD-85 Phase A shipped the in-repo `app` generator and `ndigo new`, and
deferred Phase B — an npm `create-ndigo-app` bin for standalone projects —
to "after the 1.0 publish" (issue #10), on the argument that a scaffold
emitting `"@ndigo/*": "~0.0.1"` for unpublished packages is worse than no
scaffold.

The framework is now at the point where that argument weakens: the
entrypoint story is settled (AD-90's presets are the default path for both
Node and browser apps), the example apps are migrated, and the templates are
preset-based. Shipping the scaffold _with_ 1.0 (rather than after it) means
the getting-started story is complete on day one — a user who runs
`npm create ndigo-app@latest` lands on the same defaults the in-repo apps
use, with no monorepo assumptions.

The blocker AD-85 named (unpublished packages) is real but tractable: the
scaffold's `package.json` pins the `@ndigo/*` line (`~0.0.1`) exactly as
the in-repo apps do, and the scaffold is testable locally against the
workspace through `file:`/workspace links (`--local` dev mode) without
publishing. The published artifact is validated against the real registry
at publish time.

## Evidence

- AD-85 D-2 (Phase B outline), D-3 (`--nx` preset deferred), and the
  revisit trigger ("the 1.0 publish lands, issue #10").
- AD-85 D-4 (entry-package visibility): the entry set is implicit and the
  scaffold must install only entry packages.
- AD-90: the presets are the default entrypoint path; the scaffold should
  reuse them rather than the pre-preset long form.
- AD-75 D-3: framework-owned project logic lives in a package; the
  `create-*` bin stays a thin wrapper for discovery.
- `packages/ndigo-generators/src/generators/app/` (Phase A templates) and
  `packages/ndigo-cli/src/commands/new.ts` (the in-repo front).
- `scripts/apps-smoke.mjs` (the runtime probe gate every app satisfies).

## Decision

### D-1 — Phase B ships at 1.0, not after it

The `create-ndigo-app` package is built and validated in-repo now, so it can
ship in the same 1.0 release as the framework packages. AD-85's revisit
trigger is satisfied by "the 1.0 release is being prepared" rather than "the
1.0 release has landed". The package is not published from this task; it
becomes publishable at the 1.0 release, alongside everything else.

### D-2 — Owning package and shape

A new package, **`create-ndigo-app`** (unscoped, so `npm create ndigo-app`
works), owns the standalone templates and the thin CLI bin. It does **not**
depend on `@ndigo/generators` (which pulls Nx and the monorepo substrate) or
on any `@ndigo/*` package at runtime — the bin only writes files and runs
`pnpm install`. The generated project depends on `@ndigo/*`.

The in-repo `ndigo new` (Nx generator) and `create-ndigo-app` (standalone)
**do not share a template core** (AHA — AD-85's open question resolved in
favour of standalone templates). They share conventions (the same file
suffixes, the same presets) but each owns its own copy; unification waits
for both paths to stabilise. The standalone templates adapt the Phase A
templates, now preset-based, to flat-project assumptions (no `apps/NN-*`
numbering, no `vitest.aliases.ts`, no root tsconfig inheritance, no Nx).

### D-3 — Standalone project shape

- Plain pnpm project: `vite` for the browser kind, `tsx` for the node kind.
- Scripts: `start`/`dev`, `build`, `test` (`vite build && vitest run` for
  browser, `vitest run` for node).
- `@ndigo/cli` as a dev dependency (so the app gets `ndigo serve`/`dev`/
  `inspect`/`doctor`); `@ndigo/test` as a dev dependency (so `bootApp` and
  the smoke/bundle tests work).
- `@ndigo/*` runtime dependencies pinned to `~0.0.1` (the 1.0 line), with
  `catalog:`-equivalent concrete versions for the tooling (`vite`, `tsx`,
  `vitest`, `typescript`, `@tsmetadata/polyfill`).
- The decorator-lowering plugin ships as a copied
  `scripts/vite-plugin-lower-decorators.mjs` inside the scaffold, because
  browser bundles cannot ship raw TC39 decorators and the plugin is
  repo-local today.
- No Nx, no `apps/` numbering, no `vitest.aliases.ts` (the generated
  project resolves `@ndigo/*` from its own `node_modules`).

### D-4 — CLI and prompt surface (first cut)

Prompts for: target directory (default `./ndigo-app`), kind (`node` or
`browser`), description. Non-interactive via flags (`--kind`, `--dir`,
`--description`, `--port`, `--yes`). No extras prompt in the first cut
(orm/auth/telemetry/management/cache/test harness) and no `--nx` preset —
those remain separate decisions per AD-85 D-2/D-3. The prompt library is
Node's built-in `readline` (zero runtime dependencies).

### D-5 — Dev-mode version pinning (the publish blocker)

The scaffold pins `~0.0.1` for `@ndigo/*`. Pre-publish, a `--local`
flag (and the `CREATE_NDIGO_APP_LOCAL` env var) rewrites those entries to
`file:` links against the workspace so the scaffolded app resolves the
local packages and `pnpm install` + `pnpm test` can run now. At publish
time the `--local` rewrite is a no-op (published versions exist) and the
flag is undocumented to consumers. This is the same dev-mode escape hatch
`@ndigo/generators` implicitly relies on through the workspace.

### D-6 — What the scaffold proves

A scaffolded app must pass the same gates as a hand-written app:
`pnpm install`, `pnpm build`, `pnpm test` (smoke + bundle guard), and
`pnpm lint`/`pnpm format:check` where applicable. The package's own test
suite scaffolds into a temp directory (dev mode) and runs those gates.

### D-7 — Entry-package visibility (unchanged)

AD-85 D-4 stands: the scaffold installs only entry packages (layer 6–7 plus
additive feature packages); layers 0–5 arrive transitively. The scaffold's
manifest is checked by the same dead-dependency discipline.

## Alternatives considered

- **Extend `@ndigo/generators` with a standalone kind** — rejected: the
  generator is Nx-coupled (`@nx/devkit`, `Tree`), and pulling Nx into a
  consumer's install is unacceptable. The framework-owned logic lives in the
  standalone package instead.
- **Share one template core between `ndigo new` and `create-ndigo-app`** —
  rejected pre-emptively (AHA): the standalone shape (flat project, no
  monorepo) differs enough that unification would couple the two and slow
  both. Revisit when both paths stabilise.
- **Publish a pre-release of `@ndigo/*` now** — rejected: it requires npm
  auth not available in this session, and a half-published surface is worse
  than a dev-mode scaffold. The 1.0 release is the single publish event.
- **Browser-only or node-only first cut** — rejected: parity with Phase A
  (both kinds) keeps the two scaffolding stories coherent, and the preset
  work (AD-90) makes both one-liners.

## Consequences

- A new workspace package `packages/create-ndigo-app` (unscoped npm name
  `create-ndigo-app`), with its own `bin`, templates, and tests.
- The standalone templates must track the in-repo templates when the
  presets or conventions change (two copies). The app generator's
  `bundle.spec.ts` shape is reused in the scaffold.
- The decorator-lowering plugin ships inside the scaffolded app (a copied
  script), which is the only way to keep browser bundles valid without a
  published tooling package.
- `docs/guides/` gains a `create-ndigo-app` getting-started note at publish
  time; the root README's starter lists mention it alongside `ndigo new`.
- `@ndigo/cli` is not required by the scaffold (the scaffold writes a project
  that _may_ add `@ndigo/cli` as a dev dependency), so there is no cycle.

## Revisit trigger

- The 1.0 publish lands (issue #10) — the `--local` rewrite becomes a
  no-op and the package is published as `create-ndigo-app@latest`.
- A real multi-project user need appears — then the `--nx` preset and
  `@ndigo/nx` plugin get their own decision (AD-85 D-3).
- Extras (orm/auth/telemetry/management/cache/test harness) are requested —
  add an interactive prompt + conditional template inclusion.
- The two template sets drift enough that unification (shared core) becomes
  cheaper than duplication.
