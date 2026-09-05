# Contributing to BlueJS

Thanks for contributing! This document is the contract for working in this
repository: how to install, validate, change a package, and prepare a release.

## Repository shape

- **Monorepo**: pnpm workspaces (`packages/*`, `apps/*`) with Nx task
  orchestration. Every package is `@blue/<name>` under `packages/blue-<name>`.
- **Packages are strictly typed**: TypeScript `strict` is enabled in every
  package (see Task 9 remediation). Public API changes must keep declarations
  `any`-free where the contract is public.
- **Package boundaries are enforced** (see `docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`):
    - `@blue/boot` is platform-neutral — never import `@blue/platform-node` or
      `@blue/platform-web` from its runtime source (enforced by
      `packages/blue-boot/test/platform-boundary.spec.ts`).
    - Isomorphic core packages must not import `node:` builtins or DOM globals.
- **One license**: ISC (root `LICENSE`). Every publishable package manifest
  conforms to `scripts/check-manifests.mjs` (ISC, `exports` map, `type: module`,
  `sideEffects`, `~0.0.1` blue workspace protocol).

## Prerequisites

- **Node.js ≥ 22** (runtime; CI uses 22)
- **pnpm ≥ 11** (corepack recommended: `corepack enable && corepack prepare pnpm@11 --activate`)

## Install

```bash
corepack enable          # once
pnpm install             # installs all workspace packages
```

## Validate before you push

All of these must pass; CI runs them on every PR:

```bash
pnpm build               # all library packages (tsc -b per package)
pnpm test                # unit + integration suites (per package)
pnpm lint                # Oxlint — must report ZERO warnings
pnpm format:check        # Prettier over maintained files only
pnpm audit --prod        # production advisories — must be clean
pnpm manifest:check      # package manifest conformance
pnpm doc                 # TypeDoc — must emit 0 errors, 0 warnings
```

Format the code you touched:

```bash
pnpm exec prettier --write <changed files>
```

## Changing a package

1. Read the package README and the repo graph first: `graft map` / `graft ask
"<question>"` give exact `file:line` spans — re-ask freely, it is cheap.
2. Follow existing conventions: `#private` fields, executor `new Promise`,
   `defineProperty` for readonly public fields, barrel-controlled exports.
3. Run the package's own loop while working:
   `pnpm --filter @blue/<name> build:lib && pnpm --filter @blue/<name> test`
4. For behavior changes, add or update a test in the package's `test/` — tests
   defend observable behavior, boundaries, transitions, and real errors.
5. **Sequential-await loops**: if a loop must stay sequential (ordering is
   contractual), add a line-scoped `oxlint-disable-next-line no-await-in-loop`
   with a reason — never silently parallelize ordering-sensitive code.
6. If you change a public signature, run `pnpm --filter @blue/<name> api-report`
   (API Extractor) and review the report diff.
7. Run the full validation list above before opening a PR.

## Dependency changes

- Do not add vulnerable transitive deps. After changing any manifest, run
  `pnpm audit --prod` and `pnpm manifest:check`.
- Security overrides live in `pnpm-workspace.yaml` (`overrides`). Prefer a real
  upgrade in the owning package over an override; document overrides.
- Workspace blue dependencies use the `~0.0.1` protocol — do not introduce
  `workspace:` protocols (see `scripts/check-manifests.mjs`).

## Generated files

- `doc-html/`, `doc-md/`, `lib/`, `dist/`, `coverage/` are generated and
  gitignored. Do not commit them.
- TypeDoc reads from built `lib/*.d.ts` — after changing a public doc comment,
  rebuild the lib (`pnpm --filter @blue/<name> build:lib`) before running
  `pnpm doc`.

## Keeping the repo graph (`graft/`) fresh

The repo is indexed by `graft/` (a local, gitignored context graph). When the
graph goes stale you lose symbol/call-site accuracy — queries answer from the
last build.

- **During editing**: the graft MCP server auto-refreshes the tier-1 wiring
  graph before every query, so small edits stay visible without any action.
- **After large changes** (a PR-sized batch, a re-architecture, deleting or
  moving many files): refresh the deep tier once at a natural boundary
  (task/PR completion — not mid-edit):

    ```bash
    pnpm graft:build     # = graft build --deep --allow-partial
    ```

    `--allow-partial` tolerates environments where the deep summarizer can't
    run (e.g. no model available); the structural graph is still fully rebuilt.

- CI runs `graft build` (tier-1, deterministic, $0) + `graft check` on every
  PR; `graft check` failing means a fingerprint/wiring regression.

## Releases

Release process is per-package via npm. Before publishing:

1. All validation gates green (above).
2. `pnpm pack --dry-run` for the package and import it from a clean consumer
   to verify the exports map resolves.
3. Version bumps are semver; the repository tag documents the API report diff
   (API Extractor) — breaking changes require a major bump.

## Reporting issues

- Bugs and security issues: see `SECURITY.md` for the responsible-disclosure
  process.
- Feature requests: open an issue with the affected package(s).
