# Contributing to Ndigo

Thanks for contributing! This document is the contract for working in this
repository: how to install, validate, change a package, and prepare a release.

## Repository shape

- **Monorepo**: pnpm workspaces (`packages/*`, `apps/*`) with Nx task
  orchestration. Every package is `@ndigo/<name>` under `packages/ndigo-<name>`.
- **Packages are strictly typed**: TypeScript `strict` is enabled in every
  package (see Task 9 remediation). Public API changes must keep declarations
  `any`-free where the contract is public.
- **Package boundaries are enforced** (see `docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`):
    - `@ndigo/boot` is platform-neutral — never import `@ndigo/platform-node` or
      `@ndigo/platform-web` from its runtime source (enforced by
      `packages/ndigo-boot/test/platform-boundary.spec.ts`).
    - Isomorphic core packages must not import `node:` builtins or DOM globals.
- **One license**: ISC (root `LICENSE`). Every publishable package manifest
  conforms to `scripts/check-manifests.mjs` (ISC, `exports` map, `type: module`,
  `sideEffects`, `~0.0.1` ndigo workspace protocol).

## Prerequisites

- **Node.js ≥ 24** (runtime; CI uses 24)
- **pnpm ≥ 12** (corepack recommended: `corepack enable && corepack prepare pnpm@12 --activate`)

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
pnpm typecheck           # per-project tsc -b + the spec lane (tsconfig.spec.json checks src AND test files, TST-A)
pnpm lint                # Oxlint — must report ZERO warnings
pnpm format:check        # oxfmt over maintained files only
pnpm docs:links          # relative-link integrity (docs + package/app READMEs)
pnpm audit --prod        # production advisories — must be clean
pnpm manifest:check      # package manifest conformance
pnpm doc                 # TypeDoc — must emit 0 errors, 0 warnings
```

Format the code you touched:

```bash
pnpm exec oxfmt <changed files>
```

## Changing a package

1. Read the package README and the repo graph first: `graft map` / `graft ask
   "<question>"` give exact `file:line` spans — re-ask freely, it is cheap.
2. Follow existing conventions: `#private` fields, executor `new Promise`,
   `defineProperty` for readonly public fields, barrel-controlled exports.
3. Run the package's own loop while working:
   `pnpm --filter @ndigo/<name> build:lib && pnpm --filter @ndigo/<name> test`
4. For behavior changes, add or update a test in the package's `test/` — tests
   defend observable behavior, boundaries, transitions, and real errors.
5. **Sequential-await loops**: if a loop must stay sequential (ordering is
   contractual), add a line-scoped `oxlint-disable-next-line no-await-in-loop`
   with a reason — never silently parallelize ordering-sensitive code.
6. Run the full validation list above before opening a PR.

## READMEs

Every `README.md` in this repo is scaffolded on the standard template via the
`readme` generator — `pnpm exec nx generate @ndigo/generators:readme --name <package>` —
then filled in: lead with value, show a runnable example, and keep it focused on a
new user. Never include internal tracking IDs (`AD-##`, `D##`), plan or
decision-record links, commit notes, or descriptions of removed features — those
belong in `docs/`. Scaffold or update the affected README whenever you add or
change a package or app.

## Plans and decision records

Plans (`docs/plans/`) and ADRs (`docs/decisions/`) are reviewable engineering
artifacts with the same verification bar as code. Model the structure of the
recent ADR/plan pairs (e.g. AD-26): `Date`/`Status` header first, then Problem,
Decisions (D-N), Risks, Sequencing (waves with per-wave gates), Verification.
Minimum requirements before a plan is ready to build:

- **Every code claim cites an exact span** — `package/path:line` taken from
  the repo graph (`graft ask` / `graft skeleton` / `graft grep`), never from
  memory. No span, no claim: mark it unverified.
- **Every named API is one of three kinds**: existing (span cited), new
  (marked "new"/"adds"), or shelved idea (marked "never implemented"). Never
  present a nonexistent API as shipped.
- **Acceptance criteria are mechanically possible.** Each "spec asserts" must
  trace to an existing primitive or to a prerequisite change named in the same
  wave (e.g. "Wave 2 lands the DataBinder change before the `instanceof`
  gate"). A gate the current code cannot satisfy means the plan is still a
  proposal — say so.
- **Verification runs the CI lane, not a subset.** Wave gates list the
  commands CI runs, starting with `pnpm build` — an Nx dependency cycle fails
  there before any test executes, so a green test run alone is not evidence.
- **Lifecycle is tracked**: `Proposal` → review (record findings and fixes in
  the doc) → `Accepted` (ADR recorded) → `Implemented` (status header updated,
  gap-analysis rows refreshed, index entry moved in `docs/plans/README.md`).
- **Links are bidirectional**: companion decision ↔ plan, superseded docs,
  prerequisite docs.

Naming: `YYYY-MM-DD_DESCRIPTION.md` (docs/README.md).

## Dependency changes

- Do not add vulnerable transitive deps. After changing any manifest, run
  `pnpm audit --prod` and `pnpm manifest:check`.
- Security overrides live in `pnpm-workspace.yaml` (`overrides`). Prefer a real
  upgrade in the owning package over an override; document overrides.
- Workspace ndigo dependencies use the `~0.0.1` protocol — do not introduce
  `workspace:` protocols (see `scripts/check-manifests.mjs`).

## Generated files

- `lib/`, `dist/`, `coverage/`, `.tscache/` are generated and gitignored. Do
  not commit them.
- **Documentation is committed.** The per-package API references
  (`packages/<name>/api/`) and the root `API.md` index are
  generated by `pnpm doc:api` and tracked — CI fails when they drift
  (`pnpm doc:check`).
- TypeDoc reads from built `lib/*.d.ts` — after changing a public doc comment,
  rebuild the lib (`pnpm --filter @ndigo/<name> build:lib`) before running
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

## Agent configuration (`.opencode/`, `.omp/`)

The repository's AI-agent definitions are **generated, not hand-edited**.

- Source of truth: the neutral store in
  [`development-agents`](https://github.com/jeff/development-agents)
  (agents, skills, per-harness shims) plus this repo's `agent-local/`
  (repo-specific overrides, e.g. the `graft` skill).
- Regenerate: `pnpm agents:sync` — renders all harness copies + the
  `.agent-gen.json` sha256 manifest.
- Validate: `pnpm agents:check` — manifest + structural invariants
  (CI-gated).
- Edit `development-agents/` or `agent-local/` and regenerate; never edit
  generated files under `.opencode/agents`, `.omp/agents`.
- Repo-owned deployment files (`opencode.json`, `.opencode/plugins/`,
  `AGENTS.md`) are authored in-repo but carry editor code-execution reach, so
  they sit under the same drift gate: hashes live in `.agent-local.json`,
  refreshed with `node scripts/agents-check.mjs --update` after any edit to
  those files (commit the manifest alongside).
- Models: not part of the deployment — agents inherit the session model
  (OpenCode `model`, OMP `modelRoles`, configured outside the store).

## Releases

Release process is per-package via npm. Before publishing:

1. All validation gates green (above).
2. `pnpm pack --dry-run` for the package and import it from a clean consumer
   to verify the exports map resolves.
3. Version bumps are semver — breaking changes require a major bump.

## Reporting issues

- Bugs and security issues: see `SECURITY.md` for the responsible-disclosure
  process.
- Feature requests: open an issue with the affected package(s).
