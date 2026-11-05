# TypeScript Config & Package Setup Consistency

**Status:** Draft — Phase 0 executed 2026-11-03 on `chore/tsconfig-low-risk-cleanup`.
**Scope:** every `tsconfig*.json` under `packages/`, `apps/`, and the repo root.
**Post-rename baseline:** `9bf74957 chore(repo): rename ndigo → ndigo (#79)`.

## 1. Why this plan exists

The monorepo carries **138 tracked tsconfig files** for 47 packages and 19 apps.
That count is structural: each project needs an editor/lint lane and an emit
lane, and TypeScript has no wildcard `extends`. The problem is not the count —
it is that the two lanes are not applied consistently, and three alias tables
have drifted apart.

Phase 0 removed the genuinely dead config and the two over-broad/vestigial
settings. This plan covers the rest.

## 2. Current inventory (after Phase 0)

| Area              |   Count | Shape                                                                              |
| :---------------- | ------: | :--------------------------------------------------------------------------------- |
| Root              |       4 | `tsconfig.base.json`, `tsconfig.json`, `tsconfig.build.json`, `tsconfig.spec.json` |
| `src/`            |       1 | repo-only tooling tree (AD-86)                                                     |
| `packages/`       |      94 | 47 × (`tsconfig.json` + `tsconfig.build.json`)                                     |
| `apps/`           |      39 | 19 × (IDE + build) + `apps/tsconfig.json`                                          |
| **Tracked total** | **138** |                                                                                    |
| `archive/`        |      12 | untracked; `archive/` is gitignored                                                |

Lane contract today:

- `packages/<pkg>/tsconfig.json` — editor + `oxlint --type-aware`; maps
  `@ndigo/*` to sibling `src`; `rootDir: "../../"`.
- `packages/<pkg>/tsconfig.build.json` — `tsc -b`; composite, declarations,
  `outDir: lib`, tests excluded. Every package's `build:lib` runs it.
- `apps/<app>/tsconfig.build.json` — `pnpm typecheck` only (apps have no
  `build:lib`).
- `tsconfig.spec.json` — the only lane that typechecks tests and
  `apps/*/client`.

## 3. Findings

| ID  | Finding                                               | Evidence                                                                                                                                                                                                                            | Severity       |
| :-- | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| C1  | App inheritance is three-way                          | 10 apps extend `apps/tsconfig.json`, 8 extend `../../tsconfig.base.json`, `apps/07-ndigo-views` extends nothing                                                                                                                     | High           |
| C2  | App build configs bypass the build base               | 17 extend their IDE config, 2 extend `apps/tsconfig.json`; **0** extend `tsconfig.build.json`. They inherit `erasableSyntaxOnly: true` from the base, unlike package builds                                                         | High           |
| C3  | Three package IDE configs are hybrids                 | `ndigo-log`, `ndigo-signals`, `ndigo-socket` extend root `tsconfig.json` and set `composite`/`outDir`/`rootDir`; `ndigo-socket`'s build config extends its IDE config                                                               | Medium         |
| C4  | Nine build configs carry dead path overrides          | `@ndigo/*` → `../ndigo-*/index` in `ndigo-content`, `ndigo-factory`, `ndigo-host`, `ndigo-inspect`, `ndigo-orm`, `ndigo-router`, `ndigo-telemetry`, `ndigo-telemetry-node`, `ndigo-telemetry-web`; no package has a root `index.ts` | Medium         |
| C5  | IDE aliases omit subpaths                             | Package configs only map `@ndigo/*` → `../ndigo-*/src`; `@ndigo/util/types`, `@ndigo/redis/cache`, `@ndigo/auth-core/scrypt`, etc. fall back to built `lib/`                                                                        | High           |
| C6  | Three alias tables                                    | `vitest.aliases.ts`, `tsconfig.spec.json` paths, and per-package `paths` are maintained by hand                                                                                                                                     | High           |
| C7  | Build base duplicates the editor base                 | `tsconfig.build.json` repeats 8 flags and does not extend `tsconfig.base.json`; `erasableSyntaxOnly: false` is implicit                                                                                                             | Low            |
| C8  | `apps/*/client` is spec-lane-only                     | App IDE/build includes are `src/**/*`; client code is covered only by `tsconfig.spec.json`                                                                                                                                          | Low (document) |
| C9  | No config guard                                       | A new package can ship one config, a wrong `extends`, or a stale alias without failing a gate                                                                                                                                       | High           |
| C10 | `tsconfig.spec.json` is not an Nx input               | It is a root script, not an Nx target; harmless today, fragile if `typecheck` becomes one                                                                                                                                           | Low            |
| C11 | TypeDoc depends on the root config's implicit include | `scripts/doc-api.mjs` passes no `tsconfig`, so TypeDoc discovers the root `tsconfig.json` from its cwd; narrowing it to root tooling broke doc generation for all 47 packages (CI on PR #97: `typedoc exited 3`)                    | High           |

C5 is the user-visible one: in VS Code, go-to-definition for
`@ndigo/util/types` lands in `packages/ndigo-util/lib/...`, not
`packages/ndigo-util/src/type/...`, because the wildcard substitution produces
a nonexistent path and resolution falls through to `node_modules`.

## 4. Target model

```
tsconfig.base.json              editor/lint defaults
tsconfig.json                   root tooling only (vitest.config.ts, vitest.aliases.ts)
tsconfig.build.json             build defaults; extends base, erasableSyntaxOnly: false
tsconfig.spec.json              repo-wide spec lane
packages/tsconfig.base.json     NEW: full @ndigo/* alias table + rootDir repo root
apps/tsconfig.json              shared app defaults
src/tsconfig.json               repo-only tooling
```

Per package:

```jsonc
// packages/<pkg>/tsconfig.json
{
    "extends": "../tsconfig.base.json",
    "include": ["src/**/*"],
}
```

```jsonc
// packages/<pkg>/tsconfig.build.json
{
    "extends": "../../tsconfig.build.json",
    "compilerOptions": {
        "composite": true,
        "outDir": "./lib",
        "rootDir": "./src",
    },
    "include": ["src/**/*"],
}
```

Per app:

```jsonc
// apps/<app>/tsconfig.json
{
    "extends": "../tsconfig.json",
    "include": ["src/**/*"],
}
```

```jsonc
// apps/<app>/tsconfig.build.json
{
    "extends": "../../tsconfig.build.json",
    "compilerOptions": {
        "composite": true,
        "outDir": "./lib",
        "rootDir": "./src",
    },
    "include": ["src/**/*"],
}
```

Only genuine per-project differences remain: `ndigo-socket` (`lib: ["ES2024",
"DOM"]`), `ndigo-generators` (`rewriteRelativeImportExtensions`), apps 06/07
(`lib`), and any package that is Node-only or browser-only.

### Why `packages/tsconfig.base.json`

Relative `paths` and `rootDir` in an extended config resolve against the file
that declares them. A base at `packages/` can therefore hold:

```jsonc
{
    "extends": "../tsconfig.base.json",
    "compilerOptions": {
        // Root packages use the wildcard; explicit subpath families
        // (@ndigo/util/types, @ndigo/redis/cache, ...) are added in Phase 2.
        "paths": { "@ndigo/*": ["./ndigo-*/src"] },
        "rootDir": "..",
    },
}
```

`include`, `outDir`, and `rootDir` for emit stay in each package's build
config, because those must be package-relative.

## 5. Work plan

### Phase 0 — Low-risk cleanup (done 2026-11-03)

- [x] Delete `tsconfig.vscode.json` (unreferenced, 107 errors, superseded by
      the per-package IDE configs).
- [x] Remove the stale `!{projectRoot}/tsconfig.spec.json` Nx input (no
      per-project spec configs exist).
- [x] Narrow root `tsconfig.json` to `vitest.config.ts` + `vitest.aliases.ts`
      (was a 3,504-file / 4,299-error program that swept `archive/` and
      `lib/`).
- [x] Fix the 12 `scripts/*.mjs` lint warnings the now-valid root config
      exposed (`void test(...)`; guard `child.pid` in `apps-smoke.mjs`).
- [x] Add root `tsconfig.docs.json` and point `scripts/doc-api.mjs` at it —
      CI on PR #97 exposed the coupling: TypeDoc discovers the root config
      from its cwd, so the narrowing broke generation for all 47 packages.
- Validation: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:tooling`,
  `pnpm doc:check`.

### Phase 1 — App standardization

- [ ] Make all 19 apps extend `apps/tsconfig.json`; remove the 8 direct
      `tsconfig.base.json` extends and the self-contained
      `apps/07-ndigo-views` config.
- [ ] Move shared app flags into `apps/tsconfig.json`; keep only `lib`/`types`
      overrides per app.
- [ ] Make all app build configs extend `../../tsconfig.build.json`.
- [ ] Decide and document `erasableSyntaxOnly` for apps: either set `false`
      explicitly (match packages) or keep `true` and record why.
- [ ] Decide whether `client/**/*` joins the app IDE/build include or stays
      spec-lane-only (C8).

Acceptance: every app has exactly two configs; `extends` is uniform;
`pnpm typecheck` and `pnpm build` green; a `tsc -p apps/<app>/tsconfig.json`
run has no cross-app errors.

### Phase 2 — Package IDE standardization

- [ ] Add `packages/tsconfig.base.json` with the full alias table, including
      every subpath family used in source (`@ndigo/util/{type,string,crypto}`,
      `@ndigo/redis/{cache,pubsub,locks,rate-limit,jobs}`,
      `@ndigo/auth-core/scrypt`, `@ndigo/signals/decorators`,
      `@ndigo/platform-web/browser-dispatcher`,
      `@ndigo/flags-openfeature/web`, `@ndigo/core/converter`).
- [ ] Convert all 47 package IDE configs to extend it.
- [ ] Fix the three hybrids (`ndigo-log`, `ndigo-signals`, `ndigo-socket`) so
      the IDE config has no emit settings; keep `ndigo-socket`'s DOM lib in
      both lanes.
- [ ] Verify subpath navigation: `@ndigo/util/types` must resolve to
      `packages/ndigo-util/src/type`.

Acceptance: no package IDE config declares `outDir`/`composite`; subpath
imports resolve to `src`; `pnpm lint` green.

### Phase 3 — Build config standardization

- [ ] Make `tsconfig.build.json` extend `tsconfig.base.json` and set
      `erasableSyntaxOnly: false` explicitly.
- [ ] Convert `ndigo-socket`'s build config to the standard shape.
- [ ] Remove the nine dead `@ndigo/*` → `../ndigo-*/index` overrides; rely on
      Nx-ordered `lib/` resolution like the other 38 packages.
- [ ] Decide whether package build configs need `strict` per package or
      whether it moves into the build base.

Acceptance: `pnpm build` and `pnpm typecheck` green; no build config has a
`paths` override except a documented special case.

### Phase 4 — One alias table

- [ ] Choose a source of truth: `vitest.aliases.ts` (runtime) or a small
      `tsconfig.aliases.json` consumed by both.
- [ ] Generate `tsconfig.spec.json` `paths` and
      `packages/tsconfig.base.json` `paths` from it, or add a check that fails
      on drift.
- [ ] Preserve subpath-before-root ordering.

Acceptance: adding a new subpath export requires one edit; a drift check fails
if the three consumers disagree.

### Phase 5 — Guard, docs, CI

- [ ] Add `scripts/check-tsconfigs.mjs` (or a Vitest spec) asserting:
      every package/app has exactly two configs; `extends` matches the
      contract; no `@ndigo` leftovers; aliases match the source of truth.
- [ ] Wire it into `pnpm manifest:check` or a new `pnpm tsconfig:check` in CI.
- [ ] Add `packages/tsconfig.base.json` to `nx.json` `sharedGlobals`.
- [ ] Document the two-lane model in `ARCHITECTURE.md` and the config contract
      in `CONTRIBUTING.md`.
- [ ] Index this plan in `docs/plans/README.md`.

Acceptance: the guard fails on a deliberately broken config; CI runs it.

### Phase 6 — Optional strictness pass

- [ ] Decide whether `strict: true` belongs in the base (38 package build
      configs set it, 9 do not).
- [ ] Decide `types`/`lib` policy for Node-only vs browser-only packages
      (the IDE base currently has no `types: ["node"]`, so sibling-source
      navigation surfaces `process`/`global` errors).

This phase changes code diagnostics, not just config; keep it separate.

## 6. Validation matrix

| Command                                        | Covers                                         |
| :--------------------------------------------- | :--------------------------------------------- |
| `pnpm typecheck`                               | every package/app build config + the spec lane |
| `pnpm lint`                                    | editor/lint configs via `oxlint --type-aware`  |
| `pnpm build`                                   | 47 `build:lib` emit lanes                      |
| `pnpm test`                                    | runtime behavior after config changes          |
| `pnpm test:tooling`                            | root scripts (`void test` fixes)               |
| `tsc -p packages/<pkg>/tsconfig.json --noEmit` | IDE lane for one package                       |
| `tsc -p apps/<app>/tsconfig.json --noEmit`     | IDE lane for one app                           |

## 7. Risks and rollback

- **`extends` path semantics.** Paths in a base resolve against the base file,
  not the child. `packages/tsconfig.base.json` must use `./ndigo-*/src` and
  `rootDir: ".."`. Validate with `tsc --showConfig`.
- **`erasableSyntaxOnly` flip.** Moving app builds onto `tsconfig.build.json`
  changes their syntax gate. If apps must stay erasable, set it explicitly in
  `apps/tsconfig.json` or the app build base.
- **Incremental state.** Changing `extends` chains can leave stale
  `.tsbuildinfo`; delete `**/*.tsbuildinfo` and rebuild if results look wrong.
- **Nx cache.** New shared bases must join `sharedGlobals` or cached builds
  will not invalidate.
- **Rollback.** Each phase is a separate branch/PR; `git revert` restores the
  previous config shape. No runtime code changes except Phase 0's script lint
  fixes.

## 8. Out of scope

- Adding TypeScript project references (`composite` graph); Nx already orders
  `build:lib` with `dependsOn: ^build:lib`.
- Renaming the `lib/` output directory or changing the package publish layout.
- Rewriting historical docs that still mention `@ndigo/*`; the rename sweep is
  tracked separately.
- The untracked `archive/` tree; delete its 12 configs locally if desired.
