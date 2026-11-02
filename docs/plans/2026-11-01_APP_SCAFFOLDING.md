# App Scaffolding — Phase A (`blue new`) and the `create-blue-app` path

**Status:** Phase A implemented and validated (2026-11-01, AD-85); Phase B
gated on the 1.0 publish (issue #10).
**Scope:** `@blue/generators` (new `app` kind + templates), `@blue/cli`
(`blue new`), the docs surfaces that describe app creation, and the entry
notes in AD-85 D-4.
**Decision record:** [AD-85](../decisions/2026-11-01_AD85_APP_SCAFFOLDING.md).

---

## 1. Summary

1. **Phase A (this plan, implemented):** an `app` generator in
   `@blue/generators` scaffolds `apps/NN-blue-<slug>` for the `node` and
   `browser` kinds — templates extracted from `apps/02-blue-hello-node` and
   `apps/01-blue-hello`, the reading-order number and dev port allocated
   automatically — and `@blue/cli` fronts it as `blue new <name>`. The
   factory loading path was fixed as part of A (it had silently broken
   under the TypeScript 7 toolchain — Nx's transpiler fallback calls the
   classic TS API): generator sources use `.ts` specifiers and both
   tsconfigs enable `rewriteRelativeImportExtensions`.
2. **Phase B (gated):** an npm `create-blue-app` bin for standalone
   projects, pinned to published versions, after the 1.0 package publish.
   Its project logic is framework-owned (new package or module), not the
   in-repo generator’s code path.
3. **Entry visibility (AD-85 D-4):** the Package Map gains an Entry marker
   and the README a “which packages do I install?” table; machine
   enforcement and the tooling-publishing decision wait for publish time.

## 2. Why now, why this shape

- The demo ladder teaches, but nothing creates: new apps are hand-copied and
  re-registered, and dev ports have collided (2026-10-07
  example-applications plan). The measured port conventions (five shapes,
  all 19 apps — session verification) make a safe default possible.
- An external scaffold cannot work pre-publish (unpublished packages); an
  in-repo scaffold is immediately useful to the contributor flow and
  battle-tests the prompts/templates that Phase B will reuse conceptually.
- AD-75’s division of labor already provides the seams: framework logic in a
  package, the CLI as a thin promptable front (AD-75 D-3).

## 3. Phase A deliverables (implemented)

| #   | Deliverable                                                                                                           | Where                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A0  | Generator factory loading fixed under the TS 7 toolchain (Node native stripping; `.ts` specifiers, rewritten on emit) | `packages/blue-generators/src/**`, generators + spec tsconfigs |
| A1  | `app` generator: `node` + `browser` kinds, templates from apps 01/02, manifest shape that passes the app gate         | `packages/blue-generators/src/generators/app/`                 |
| A2  | Numbering (next free `NN`) and dev-port allocation/validation (scan over the five documented conventions)             | `.../app/generator.ts`, `.../app/_ports.ts`                    |
| A3  | Shared kebab-name validation (third consumer: package, readme, app)                                                   | `packages/blue-generators/src/_validators.ts`                  |
| A4  | `app` registered in `generators.json`, exported from the package index, `@blue/generators` README updated             | `packages/blue-generators/`                                    |
| A5  | `blue new <name>` (`--kind`, `--number`, `--port`, `--description`, `--dry-run`) fronting `nx g @blue/generators:app` | `packages/blue-cli/src/commands/new.ts`                        |
| A6  | `blue generate app` fails with a pointer at `blue new` (one canonical path per artifact)                              | `packages/blue-cli/src/commands/generate.ts`                   |
| A7  | Tests: generator unit lane (structure, numbering, ports, manifests, rejections) + CLI argv/help lane                  | `packages/blue-generators/test/`, `packages/blue-cli/test/`    |
| A8  | Docs: AD-85, this plan, guide 25, CLI/generators READMEs, apps README, root README, CHANGELOG `[Unreleased]`          | `docs/`, package READMEs, `README.md`, `CHANGELOG.md`          |

Explicit non-goals for Phase A: updating the `apps/README.md` index rows and
the root README app table (manual, table-format-sensitive); registering the
generated app in `scripts/apps-smoke.mjs` (the probe is app-specific: route,
status, optional WebSocket); publishing anything.

## 4. Validation

Performed 2026-11-01 (dogfood; the throwaway apps were removed afterwards):

- `@blue/generators` unit lane: 5 files / 39 tests green (11 new app tests);
  `@blue/cli` argv spec green; the real bin lane covers the `blue new` help
  surface and the `blue generate app` pointer.
- Real runs, both kinds: `nx g @blue/generators:app` wrote
  `apps/20-blue-…` (node) and `apps/21-blue-…` (browser) — correct numbering
  and port allocation (3120), unescaped free text.
- The generated apps passed their own lanes end-to-end: node smoke 2/2;
  browser vite build + bundle guard + jsdom smoke 4/4.
- `node scripts/check-manifests.mjs` passed with both apps present; `oxfmt
  --check` clean on both.
- `nx g` now loads the factories through Node's native type stripping — no
  transpiler fallback, no TypeScript-API dependency (verified for the
  existing `package`/`readme` factories too).

All gates green at review time (2026-11-01): `pnpm lint`, `pnpm format:check`,
`pnpm typecheck` (per-project build lane + spec lane), `pnpm manifest:check`,
`pnpm docs:links`, and the regenerated `@blue/generators` / `@blue/cli` API
trees (`pnpm doc:api`).

## 5. Phase B outline (gated on the 1.0 publish)

1. Decide the owning package for standalone project templates (AD-75 D-3:
   framework-owned logic; the `create-blue-app` bin stays thin).
2. Standalone project shape: plain pnpm project (vite for browser, tsx for
   node), `@blue/cli` as a dev dependency, versions pinned to the published
   1.0 line, no Nx and no monorepo assumptions.
3. Prompt surface: target kind, extras (orm+orm-drizzle, auth-server,
   telemetry-node, management, cache, test harness), package manager; write
   a README that explains the installed closure.
4. `create-blue-app` publishes as the `npm create blue-app` discovery
   channel; a `blue new --external` (or equivalent) entry can follow once
   both paths share a template core, if they converge at all (AHA — do not
   unify pre-emptively).
5. `--nx` preset (`@blue/nx` plugin) remains a separate decision (AD-85 D-3).

## 6. Open questions

- Should Phase B templates be extracted from the Phase A templates or written
  standalone? Decide when the publish story fixes the target shape (the
  standalone project has different tsconfig/root assumptions).
- Entry-package marking mechanics (AD-85 D-4.2): a manifest marker versus a
  root `entry-packages.json`; decide with the README table in hand.
- Whether `blue new` should also register the app in `apps/README.md` /
  `apps-smoke.mjs` via a follow-up `register` generator step, or stay
  scaffold-only (current decision: scaffold-only).
