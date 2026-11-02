# AD-85: App scaffolding — `blue new` in-repo now, `create-blue-app` at publish

**Date:** 2026-11-01
**Status:** Accepted
**Deciders:** Framework owner (2026-11-01 onboarding/scaffolding discussion; the
gap was first recorded in the 2026-09-01 feature assessment §3.4)

---

## Context

BlueJS is 46 packages and 19 example applications, and its onboarding story is
the demo ladder plus per-path starter lists (README “Getting Started”, guide
01). Three gaps surfaced in the 2026-11-01 review of that story:

- **There is no way to create an app.** Every new app is hand-copied from a
  sibling and re-registered by hand; `apps/README.md` says only “New apps
  append at the next free number”. Port collisions have already happened
  (the 2026-10-07 example-applications plan found `blue-todo` dev 3000,
  `blue-hello-node` 3000, and `blue-api` 3000 unable to run together).
- **“Entry” packages are not a stated rule.** 45 of 46 packages are
  publishable; nothing stops a user from installing a layer-2 package
  (`@blue/factory`) or repo tooling (`@blue/oxlint-plugin`) and building on
  it. The README starter lists and the ARCHITECTURE Package Map are the only
  guidance, and neither marks the entry set explicitly.
- **The framework CLI deliberately has no `create/new`.** AD-75’s own
  research lists `create/new` as near-universal across framework CLIs
  (Rails, Nest, Quarkus, Next), yet the v1 surface table starts at `serve`
  and `upgrade` was deferred alongside it. `@blue/generators`’ existing
  kinds (`package`, `component`, `readme`, `header`) are workspace-internal:
  the `package` generator writes `packages/blue-*` and edits
  `vitest.aliases.ts` — none of them produce an application.

The external half of the story — an npm `create-blue-app` — cannot ship yet:
the packages are unpublished pre-1.0 (README), and a scaffold that emits
`"@blue/boot": "~0.0.1"` for a package nobody can install is worse than no
scaffold. The 1.0 release gate (issue #10, milestone `1.0.0`) is the
dependency, not the design.

## Evidence

- `docs/reference/2026-09-01_FEATURE_ASSESSMENT.md:131` — “CLI scaffold
  (`create-blue`) — Post-1.0 polish. Generators exist for packages.”
- AD-75 evidence (“create/new near-universal”) and D-2’s v1 surface table
  (`serve`, `dev`, `generate`, `db:*`, `inspect`, `doctor`; no `new`).
- `apps/README.md` (progression, ports, “next free number”) and
  `docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md` (port registry, per-app
  definition of done).
- Gates a generated app must satisfy: `scripts/check-manifests.mjs` rule 10
  (app closure/dead-dependency discipline, config-file imports included) and
  rule 9 (alias targets); `scripts/apps-smoke.mjs` (the Node probe registry);
  `requires-doc-header` (source/test headers).
- Session verification (2026-11-01): every existing app’s dev port is
  discoverable from five conventions — vite `server: { port }`,
  `process.env.PORT ??= 'N'`/`process.env['PORT'] ??= 'N'`,
  `getEnv('PORT', 'N')`, a `DEFAULT_PORT` constant, and the
  `process.env.PORT ? … : N` fallback — covering all 19 apps.
- Session finding (2026-11-01): Nx’s generator loader had silently broken
  under the TypeScript 7 toolchain — its transpiler fallback calls the
  classic TypeScript API (`require('typescript').readConfigFile`), which the
  TS 7 package does not expose, so **every** `nx g @blue/generators:*`
  invocation failed. Phase A fixes the loading path natively: generator
  sources import their own modules with `.ts` specifiers (Node’s native
  type stripping loads them) and `rewriteRelativeImportExtensions` in both
  generators tsconfigs rewrites them to `.js` on emit.

## Decision

### D-1 — Phase A: the `app` generator + `blue new` (in-repo)

`@blue/generators` gains an **`app`** kind that scaffolds an example
application under `apps/NN-blue-<slug>`:

- Two kinds: **`node`** (templates extracted from `apps/02-blue-hello-node`)
  and **`browser`** (templates extracted from `apps/01-blue-hello`, including
  the HI-1 bundle guard, which every browser app ships).
- The **reading-order number** defaults to one past the highest existing
  `apps/NN-*` (explicit `--number` overrides; a taken number is an error).
- The **dev port** defaults to the first free multiple-of-ten slot above 3000
  by scanning the apps through the same five conventions; an explicit
  `--port` that collides with a scanned port is an error naming the owner.
  The scan is best-effort by construction (documented in the generator), and
  an unrecognized convention leaves a port unseen — the escape hatch is the
  explicit `--port`.
- `@blue/cli` gains **`blue new <name>`** (`--kind`, `--number`, `--port`,
  `--description`, `--dry-run`) as a thin front over
  `nx g @blue/generators:app` — AD-75 D-3’s division holds: the generator
  owns numbering, ports, and templates; the CLI owns the promptable flag
  surface. `blue generate app` remains unknown-by-design and points at
  `blue new`.

The generated manifest must pass the existing app manifest gate on creation
(private, declared closure, tooling exemptions) — the generator is judged by
the same rules as a hand-written app.

### D-2 — Phase B: `create-blue-app` at publish

An npm `create-blue-app` package (bin of the same name, the `npm create
blue-app@latest` convention) ships when the 1.0 packages are on the
registry. It is **not** a repackaging of the in-repo generator: an external
scaffold writes a standalone project (its own `package.json`, vite/tsx
scripts, and README) pinned to published versions, with no monorepo
assumptions (no `vitest.aliases.ts`, no `apps/` numbering, no root tsconfig
inheritance). The framework-owned project logic lives in a package (AD-75
D-3); the `create-*` bin stays a thin wrapper for discovery.

Revisit trigger: the 1.0 publish lands (issue #10). Until then, Phase B stays
a plan, not an implementation.

### D-3 — Nx stays the in-repo substrate; consumers do not need it

Nx remains how this repository runs its generators (`nx g
@blue/generators:<kind>`, `generators.json` factories over `src/`, no build
step required for generator execution). For consumers, Nx stays **optional**:
`blue` resolves `package.json` scripts shell-free (guide 25) and works in a
plain pnpm project, so a single-app scaffold does not require the Nx
learning curve. A `create-blue-app --nx` preset with a `@blue/nx` plugin
(app/lib generators, serve executor, graph integration) is deferred to its
own decision when a real multi-project user need appears — `nx init` is the
documented add-later path, so the Nx-free default does not close the door.

### D-4 — Entry-package visibility (implementation deferred)

The entry set is already implicit — layer 6–7 packages (`@blue/boot`,
`@blue/platform-node`, `@blue/platform-web`, `@blue/dispatcher`,
`@blue/view*`, `@blue/cli`) plus additive feature packages (`orm`,
`orm-drizzle`, `auth-*`, `telemetry-*`, `management`, `cache`, `jobs`,
`redis`, `test`) — with layers 0–5 pulled transitively (“Standalone use:
every package resolves its own install closure”, Package Map). The decision:

1. The **Package Map** gains an explicit Entry marker, and the README gains a
   “which packages do I install?” table.
2. Enforcement is **not** added yet — a `blue.entry` marker or
   `entry-packages.json` checked by `scripts/check-manifests.mjs` waits until
   the rule has stabilized (Rule of Three; the scaffold first carries the
   entry set in practice).
3. Whether repo-only tooling (`@blue/generators`, `@blue/oxlint-plugin`,
   `@blue/inspect`) publishes at all is decided per package at publish time;
   `private: true` is the only hard stop npm offers.
4. No `@blue/blue` umbrella meta-package: it duplicates the platform hubs
   and drifts; the scaffold templates plus starter lists carry the entry set.

## Alternatives considered

- **Reuse the `package` generator for apps, or one generator for both.** Its
  invariants differ (packages get `lib/` build output, api docs, alias-table
  entries; apps are private with scripts and ports). Rejected — a shared
  target abstraction buys nothing until the standalone Phase B exists.
- **Make `number`/`port` operator-supplied always.** Numbering is mechanical
  and ports have collided before; the defaults remove the ceremony while
  explicit flags stay available. Rejected.
- **Ship `blue new` as the public `create-blue-app` now.** The output would
  reference unpublished packages. Rejected — gated on the 1.0 publish (D-2).
- **Require Nx in consumer scaffolds.** The CLI works over plain scripts; Nx
  adds no value for a single app. Rejected (D-3).
- **A `@blue/blue` umbrella package.** Duplicates the platform hubs’
  closures and drifts. Rejected (D-4.4).

## Consequences

- Contributors scaffold apps with `blue new <slug> --kind node|browser`
  (or `pnpm exec nx g @blue/generators:app …`); numbering, ports, and the
  manifest shape stop being copy-paste decisions. Index maintenance
  (`apps/README.md` rows, the root README table) stays manual — table
  editing is not generator material.
- The templates become the second consumer of the app conventions (after the
  apps themselves): a change to the vite decorator policy or the smoke-test
  shape should land in both, and drift is visible because generated apps are
  ordinary apps under the existing gates.
- Costs: the port scan is best-effort (documented); `_ports.ts` must learn a
  new convention if one appears. The `app` generator has no external story
  until Phase B.
- **Loading constraint (found while implementing Phase A):** Nx loads
  generator factories with Node’s native TypeScript stripping, which needs
  exact specifiers. Relative imports in Nx-loaded generator files therefore
  carry the `.ts` extension; both generators tsconfigs enable
  `rewriteRelativeImportExtensions` so `tsc` emits `.js` for the built
  `lib/`, and the root spec typecheck sets `allowImportingTsExtensions`
  (its lane is `noEmit`). A relative import written the usual `.js` way
  still passes the unit tests (Vitest resolves either) but breaks `nx g` —
  the flags and the specifier form must stay in sync.
- `blue generate app` intentionally fails with a hint; the CLI surface keeps
  one canonical path per artifact (`blue new` for apps, `blue generate` for
  everything else).

## References

- The 2026-11-01 onboarding discussion (session) — the entry-package and
  scaffolding review this record resolves.
- AD-75 (framework CLI; D-2 surface, D-3 framework-owned features) and its
  create/new research bullet.
- `docs/reference/2026-09-01_FEATURE_ASSESSMENT.md` §3.4.
- `docs/plans/2026-11-01_APP_SCAFFOLDING.md` — Phase A deliverables and the
  Phase B outline.
- `scripts/check-manifests.mjs` (app rules 9–10), `scripts/apps-smoke.mjs`,
  `apps/README.md`, `docs/plans/2026-10-07_EXAMPLE_APPLICATIONS.md`.
