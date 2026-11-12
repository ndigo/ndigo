# `create-ndigo-app` — standalone scaffold (Phase B, pulled forward to 1.0)

**Status:** Completed (2026-11-05)
**Scope:** new package `packages/create-ndigo-app` (`create-ndigo-app` on
npm), plus the ADR update and docs.
**Decision record:** [AD-92](../decisions/2026-11-05_AD92_CREATE_NDIGO_APP_AT_1_0.md);
amends AD-85 D-2's Phase B gate.

---

## 1. Summary

Ship `create-ndigo-app` as part of the 1.0 release rather than after it. The
package is a thin, zero-dependency Node bin that scaffolds a **standalone**
pnpm project (no monorepo, no Nx, no `apps/NN-*` numbering, no
`vitest.aliases.ts`) from templates that use the AD-90 presets
(`createNodeApplication` / `createWebApplication`) for both the `node` and
`browser` kinds. `@ndigo/*` versions are pinned to `~0.0.1`; a `--local`
dev mode rewrites them to `file:` links against the workspace so the scaffold
is exercisable today.

## 2. Owning package and shape (AD-92 D-2/D-3)

- New package `packages/create-ndigo-app`, npm name `create-ndigo-app`
  (unscoped, so `npm create ndigo-app@latest` resolves it).
- Bin: `bin/create-ndigo-app.js` (ESM, `#!/usr/bin/env node`).
- Own runtime deps: **none** — Node built-ins only (`fs`, `path`,
  `readline`, `process`). Prompts use `readline`.
- Templates under `templates/node/` and `templates/browser/` (plain project
  files), copied via `fs.cpSync` with substitution.
- The decorator-lowering plugin ships as a copied
  `scripts/vite-plugin-lower-decorators.mjs` inside the scaffolded browser
  app (the only way to keep browser bundles valid without a published
  tooling package).
- No `@ndigo/generators` / `@nx/devkit` dependency (those are Nx-coupled
  and stay in-repo).

## 3. Template shape

### node

- `package.json` — `@ndigo/boot`, `@ndigo/context`, `@ndigo/dispatcher`,
  `@ndigo/log`, `@ndigo/platform-node`, `@ndigo/util` at `~0.0.1`;
  devDeps `@ndigo/test`, `tsx`, `typescript`; scripts `start`/`test`.
- `tsconfig.json`, `tsconfig.build.json` — standalone (no monorepo
  inheritance, `moduleResolution: bundler`, `rewriteRelativeImportExtensions`).
- `src/index.ts` — `createNodeApplication([AppConfiguration], { port: 3000 })`.
- `src/app-configuration.ts`, `src/app-controller.ts` (one handler).
- `test/app.smoke.spec.ts` — `bootApp` + `MockHTTP` against `/hello`.
- `README.md`.

### browser

- `package.json` — `@ndigo/context`, `@ndigo/dispatcher`,
  `@ndigo/platform-web`, `@ndigo/view-webcomponent` at `~0.0.1`;
  devDeps `@ndigo/test`, `@tsmetadata/polyfill`, `vite`, `vitest`, `tsx`.
- `vite.config.ts` — decorator-lowering plugin + dev port.
- `index.html` with `#app`.
- `src/index.ts` — `await createWebApplication([AppConfiguration])`.
- `src/app-configuration.ts`, `src/app-controller.ts`,
  `src/app-view.ts` (custom element `app-view`).
- `test/app.smoke.spec.ts` + `test/bundle.spec.ts` (HI-1 guard).
- `README.md`.

## 4. CLI surface

```
create-ndigo-app [dir] [--kind node|browser] [--description "..."]
                 [--port N] [--yes] [--local]
```

- Prompts for missing values (readline, defaults: `./ndigo-app`, `node`).
- `--yes` accepts all defaults (non-interactive, CI-friendly).
- `--local` rewrites `@ndigo/*` entries to `file:` links against the
  workspace (dev mode).
- Refuses to overwrite a non-empty target directory unless `--force`.
- Prints next steps (`pnpm install`, `pnpm start`/`pnpm dev`).

## 5. Phases

| #   | Deliverable                                                                                                                     | Where                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 0.1 | ADR-91 (this decision) + plan index entry                                                                                       | `docs/decisions/`, `docs/plans/`                                                 |
| 1.1 | Package skeleton: `package.json` (name `create-ndigo-app`, bin, files, no deps), `tsconfig.json`, `README.md`                   | `packages/create-ndigo-app/`                                                     |
| 1.2 | Standalone templates (node + browser) adapted from the Phase A templates and the AD-90 presets                                  | `packages/create-ndigo-app/templates/`                                           |
| 1.3 | CLI bin: prompts, flags, file writing, `--local` rewrite, next-steps output                                                     | `packages/create-ndigo-app/bin/create-ndigo-app.js`, `src/`                      |
| 1.4 | Package tests: scaffold into a temp dir (dev mode) and assert manifest shape + `pnpm build` + `pnpm test` of the scaffolded app | `packages/create-ndigo-app/test/`                                                |
| 1.5 | Docs: root README "Getting Started" mention, AD-85 D-2 revisit, CHANGELOG Added entry                                           | `README.md`, `docs/decisions/2026-11-01_AD85_APP_SCAFFOLDING.md`, `CHANGELOG.md` |
| 1.6 | Gates: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm manifest:check`, `pnpm format:check`, `pnpm docs:links`                    | repo root                                                                        |

## 6. Risks and rollback

| Risk                                                  | Mitigation                                                                       | Rollback                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| Standalone templates drift from the in-repo templates | Both now use the presets; document the sync point; a future unification decision | Revert the package directory  |
| `~0.0.1` pins don't resolve pre-publish               | `--local` dev mode + a publish-time smoke (pack + install in a clean dir)        | Gate the publish on the smoke |
| Decorator-lowering plugin copied into each app        | Single file, versioned with the scaffold; update in lockstep                     | —                             |
| Scope creep (extras, --nx)                            | Explicitly out of scope for v1; revisit triggers recorded                        | —                             |

## 7. Definition of done

- [ ] Package builds (`pnpm build`) and its tests pass.
- [ ] `create-ndigo-app /tmp/x --kind node --yes --local` produces a runnable app whose `pnpm test` (smoke) passes.
- [ ] `create-ndigo-app /tmp/y --kind browser --yes --local` produces a runnable app whose `pnpm test` (build + bundle guard + smoke) passes.
- [ ] Manifest gate passes on the scaffolded app (dead deps, closure).
- [ ] `docs/plans/README.md` moves this plan to Completed with the execution date.
- [ ] AD-85's Phase B status updated to "implemented at 1.0".
