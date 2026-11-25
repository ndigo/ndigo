# Contributing to Ndigo

Thanks for contributing! This document is the contract for working in this
repository: how to install, validate, change a package, and prepare a release.

## Repository shape

- **Monorepo**: pnpm workspaces (`packages/*`, `apps/*`) with Nx task
  orchestration. Every package is `@ndigo/<name>` under `packages/ndigo-<name>`.
- **Packages are strictly typed**: TypeScript `strict` is enabled in every
  package (see Task 9 remediation). Public API changes must keep declarations
  `any`-free where the contract is public.
- **Package boundaries are enforced**:
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

Run the whole lane locally with one command:

```bash
pnpm hooks:install   # once per clone: worktree guard + pre-push lane
pnpm preflight       # every gate below, fail-fast order (~5 min on a dev box)
pnpm preflight:fast  # format, lint, links, typecheck, agent content only
```

`preflight` mirrors `.github/workflows/ci.yml` and is what the pre-push hook
runs. GitHub-hosted runner minutes are a hard monthly budget (2,000 on the free
tier), so a push carries its own proof and CI is the backstop, not the first
run. `git push --no-verify` skips the hook; `PREFLIGHT=fast git push` runs the
fast gates only.

Every gate individually:

```bash
pnpm build               # all library packages (tsc -b per package)
pnpm test                # unit + integration suites (per package)
pnpm typecheck           # per-project tsc -b + the spec lane (tsconfig.spec.json checks src AND test files, TST-A)
pnpm lint                # Oxlint — must report ZERO warnings
pnpm format:check        # oxfmt over maintained files only
pnpm docs:links          # relative-link integrity (docs + package/app READMEs)
pnpm guides:check        # guide contract: titles, metadata, fences, index
pnpm doc:coverage        # zero-tolerance TSDoc depth gate
pnpm audit --prod        # production advisories — must be clean
pnpm manifest:check      # package manifest conformance
pnpm agent-content:check # CLI assets, templates, and skills snapshot drift
pnpm doc                 # TypeDoc — must emit 0 errors, 0 warnings
```

CI cost is itself a tracked gate: `pnpm ci:usage` replays the run history and
reports billable minutes per workflow, job, and day (issue #276).

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

## Module visibility

- **Public API** is `packages/<name>/src/index.ts`. Only what that file exports is
  stable and subject to semantic versioning.
- **Internal files** are prefixed with `_` (`src/_util.ts`, `test/_fixtures.ts`).
  They are implementation details: never exported from the public API, never
  imported across packages.
- Internal files must contain real local utilities, not pass-through re-exports.
  The extraction hierarchy, naming, and file-size targets live in
  [STYLE_GUIDE §4.4–4.5](./STYLE_GUIDE.md#44-utility-function-organization).

## READMEs

Every `README.md` in this repo is scaffolded on the standard template via the
`readme` generator — `pnpm exec nx generate @ndigo/generators:readme --name <package>` —
then filled in: lead with value, show a runnable example, and keep it focused on a
new user. Never include internal tracking IDs (`AD-##`, `D##`), plan or
decision-record links, commit notes, or descriptions of removed features — those
belong in `docs/`. Scaffold or update the affected README whenever you add or
change a package or app.

## Plans and decision records

Plans (`docs/plans/`, kept locally, not published) and ADRs
(`docs/decisions/`) are reviewable engineering artifacts with the same
verification bar as code. Model the structure of the recent ADR/plan pairs
(e.g. the most recent pair): `Date`/`Status` header first, then Problem, Decisions (D-N),
Risks, Sequencing (waves with per-wave gates), Verification.
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
  gap-analysis rows refreshed, index entry moved in `docs/plans/README.md`
  (local-only).
- **Links are bidirectional**: companion decision ↔ plan, superseded docs,
  prerequisite docs.

Naming: `YYYY-MM-DD_DESCRIPTION.md` (docs/README.md).

## Dependency management

### Library integration layers

External dependencies are encapsulated by a single Ndigo package that acts as an
**integration layer**. Other packages import from the integration layer, never
directly from the external library.

| Integration layer  | Encapsulated library   | Kind     | Why                                                                                                         |
| :----------------- | :--------------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `@ndigo/ai-sdk`    | `ai`                   | Adapter  | Takes upstream values at its entry points (`LanguageModel`) and exposes the framework contract (`AIModel`). |
| `@ndigo/boot`      | `@toon-format/toon`    | Boundary | Decodes TOON through an injectable function; no SDK type escapes.                                           |
| `@ndigo/view-toon` | `@toon-format/toon`    | Boundary | Encodes TOON; owns `TOONEncodeOptions` and the sanitized `IllegalStateError`.                               |
| `@ndigo/signals`   | `@preact/signals-core` | Facade   | Deliberately re-exports the upstream API; upstream types are the contract.                                  |

**Direct dependencies** — zod, OpenTelemetry, ejs, i18next, OpenFeature, `ws`,
`helmet`, `jose`, `@redis/client`, `drizzle-orm` — are imported where needed
and are not wrapped.

**When to add a layer:** use an adapter when a consumer must supply an upstream
value; a boundary when the framework owns the contract and the upstream is an
implementation detail; a facade when the upstream API is deliberately adopted.
If none applies, do not create a package — a wrapper with no integration point
is not a capability (`@ndigo/dom` is the cautionary example).

The encapsulated-library set is the set enforced by the
`internal/no-direct-integration-imports` oxlint rule (`INTEGRATION_LAYER_MAP` in
`src/oxlint/_constants.ts`, wired through `.oxlintrc.json`, severity `error`).
The rule covers static imports, named re-exports, `export *`, and dynamic
`import()`. Add the library there first, then here.

### Manifest dependency sections

Every package declares exactly the dependencies it uses, in three enforced
sections (`scripts/check-manifests.mjs` — CI, `pnpm manifest:check`):

1. **`dependencies`** — every import made from `src/`, including `@ndigo/*`.
   This is the standalone-install closure: `npm install @ndigo/http` pulls
   `core`, `factory`, `util`, and OTel's API automatically.
2. **`devDependencies`** — imports used only by `test/`, `bench/`, and root
   `vitest.config.ts`/`vite.config.ts`, plus `@types/*` and build tooling.
3. **`peerDependencies`** — reserved for host-provided contracts, allowlisted
   per package in the checker (`PEER_ALLOWLIST` in
   `scripts/check-manifests.mjs` — the single source of truth): `@ndigo/oxlint-plugin
   → oxlint` (plugin contract), `@ndigo/telemetry-node → ws` (host-provided
   types), `@ndigo/platform-node → swagger-ui-dist` (asset-only docs UI),
   `@ndigo/redis → @ndigo/cache`/`@ndigo/factory`/`@ndigo/socket` (node-only
   capability subpaths), and `@ndigo/boot → @toon-format/toon` (optional).
   Any new peer needs a deliberate decision + allowlist entry in the checker.

**Rule of thumb:** if a package cannot run right after `npm install <pkg>`,
the missing resolver is a manifest bug — not the consumer's job. There is no
"consumer must also install these" section.

### Usage rules

1. **Only integration layer packages** may import from their encapsulated libraries.
2. **All other packages** must import through the integration layer.
3. **Test files** (`*.spec.ts`, `*.test.ts`) may import external libraries for
   mocking purposes.
4. **Type-only imports** (`import type`) are permitted when the library is
   declared in `peerDependencies` — see [Type-only imports](#type-only-imports).

**Correct:**

```typescript
// In @ndigo/core or any non-integration package
import { aiSdkModel } from '@ndigo/ai-sdk'; // ✅ Import from integration layer
```

**Incorrect:**

```typescript
// In @ndigo/core or any non-integration package
import { generateText } from 'ai'; // ❌ Direct import bypasses integration layer
```

**Allowed in tests:**

```typescript
// In @ndigo/core/test/my-service.spec.ts
import { vi } from 'vitest';
vi.mock('@ndigo/util');
```

### Package categories

Three categories decide who consumes a package; they are orthogonal to the
numeric layer ranks in `LAYER_RANK` (`src/oxlint/_layers.ts`), which decide what
a package may import.

| Category               | What it is                                                                                                     | Where it lives                                                            | Consumers                     |
| :--------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :---------------------------- |
| **Tooling**            | Dev-time code that never runs inside an application                                                            | `TOOLING_PACKAGES` (`cli`, `oxlint-plugin`, `test`), `tools/`, `scripts/` | Maintainers, authoring agents |
| **Runtime capability** | An opt-in package an application installs and runs                                                             | `packages/` — the published surface                                       | Applications                  |
| **Agent surface**      | The agent-facing subset of runtime capabilities: MCP tools, MCP Apps, A2UI, WebMCP, the `AgentBridge` contract | Wherever the implementing package lives (for example `@ndigo/mcp`)        | Runtime agents                |

A **capability** is the unit between a package and a workflow: the declared,
installable thing an application gains ("agent surface", "shared cache"),
implemented by one or more runtime packages or subpaths, with its wiring,
checks, and teaching skill declared once in the CLI's catalog.

- Repo-only tooling never enters `packages/`; `scripts/package-surface.mjs`
  enforces the split.
- A runtime capability is installable on its own: its manifest carries the full
  install closure ([Manifest dependency sections](#manifest-dependency-sections)).
- "Agent surface" is a concern, not a directory — `@ndigo/mcp` is a runtime
  capability, and `@ndigo/view-webcomponent`'s WebMCP adapter is part of one.
- Do not add a package to `TOOLING_PACKAGES` to silence a layer violation; the
  set is for packages outside the runtime graph by design.

### Type-only imports

Type-only imports (`import type`) are permitted for host-provided libraries when
the library is declared in `peerDependencies` (for example
`@ndigo/telemetry-node → ws`). The import is erased at build time and the
consumer opts into the host library explicitly. Runtime imports must go through
the integration layer; package-manager sections follow the
[Manifest dependency sections](#manifest-dependency-sections) policy.

### Adding a dependency

1. **Evaluate** whether it belongs in an existing integration layer or needs a new one.
2. **Add** the dependency to the appropriate integration layer package.
3. **Re-export** the necessary APIs through the integration layer's `src/index.ts`.
4. **Document** the integration layer in the table above.
5. **Update** this section and the matching section in `AGENTS.md`.

### Enforcement

- **Manual review** — check imports during code review.
- **oxlint plugin** — `internal/no-direct-integration-imports`, loaded from root
  `src/oxlint/` via oxlint JS plugins; consumer-facing rules ship in
  `@ndigo/oxlint-plugin`.
- **CI manifest checker** — `scripts/check-manifests.mjs` runs in CI
  (`pnpm manifest:check`) and enforces the
  [manifest dependency sections](#manifest-dependency-sections) contract plus
  the `@ndigo/*` `~0.0.1` protocol.

### Dependency hygiene

- Do not add vulnerable transitive deps. After changing any manifest, run
  `pnpm audit --prod` and `pnpm manifest:check`.
- Security overrides live in `pnpm-workspace.yaml` (`overrides`). Prefer a real
  upgrade in the owning package over an override; document overrides.
- Workspace ndigo dependencies use the `~0.0.1` protocol — do not introduce
  `workspace:` protocols (see `scripts/check-manifests.mjs`).

## Generated files

- `lib/`, `dist/`, `coverage/`, `.tscache/` are generated and gitignored. Do
  not commit them.
- **API reference is generated, not committed.** The per-package API references
  (`packages/<name>/api/`) and the root `API.md` index are generated by
  `pnpm doc:api`; CI runs the generator (zero warnings) but does not track
  the output (`pnpm doc:check`).
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
- Regenerate: `pnpm agents:sync` — renders agents per harness, skills once
  into the shared `.agents/skills/`, plus the `.agent-gen.json` sha256
  manifest.
- Validate: `pnpm agents:check` — manifest + structural invariants
  (CI-gated).
- Edit `development-agents/` or `agent-local/` and regenerate; never edit
  generated files under `.opencode/agents`, `.omp/agents`, `.agents/skills`.
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
