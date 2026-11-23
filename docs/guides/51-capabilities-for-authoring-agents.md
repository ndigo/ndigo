# Guide 51 — Capabilities for Authoring Agents

How an agent assembles a Ndigo application: the CLI plans and applies
capabilities, skills sequence the work, and one declared catalog keeps facts
from drifting.

**Audience:** Agent authors · tooling maintainers · **Prerequisites:** Guides [37](37-ndigo-cli.md), [47](47-ai-agents.md), [48](48-agent-facing-surfaces.md) · **Reference package:** `packages/ndigo-cli`

## What you'll learn

- Which agent writes an application and which one uses it.
- What a capability is — and what it is not.
- Which part of the work the CLI owns and which part a skill owns.
- Where facts come from, and why prose must not copy them.
- The boundary that keeps the runtime agent packages in this repository.

## 1. Two audiences

A Ndigo project meets two different agents, and they need different things.

| Audience            | What it does                              | What it consumes                                              |
| :------------------ | :---------------------------------------- | :------------------------------------------------------------ |
| **Authoring agent** | Writes the application on a user's behalf | `AGENTS.md`, skills, version-matched docs, the `ndigo` CLI    |
| **Runtime agent**   | Uses the finished application at runtime  | MCP tools, MCP Apps, A2UI, WebMCP, the `AgentBridge` contract |

These names replace AD-96's original "Development agents" / "Product agents"
([AD-114](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md)). Neither is the
maintainer-only `development-agents/` store or the gitignored `agent-local/`
tree.

Three categories describe the code those audiences touch
([ARCHITECTURE.md](../../ARCHITECTURE.md#package-categories)):

- **Tooling** — dev-time only; never runs inside an application.
  `TOOLING_PACKAGES`, `tools/`, `scripts/`, and the agent-content store.
- **Runtime capabilities** — opt-in packages an application installs and runs.
  `packages/` is the published surface.
- **Agent surfaces** — the agent-facing subset of runtime capabilities: MCP
  tools, MCP Apps, A2UI, WebMCP, and `AgentBridge`. A concern, not a directory.

## 2. A capability is the installable unit

A **capability** is the declared, installable unit of application behaviour: the
user-goal-level thing an application gains, implemented by one or more packages
or subpaths, plus its wiring, files, emitted surfaces, checks, and the skill
that teaches it.

| Example capability | Implemented by                                   | What installing it does                                  |
| :----------------- | :----------------------------------------------- | :------------------------------------------------------- |
| `agent-surface`    | `@ndigo/mcp` + a controller                      | Serves the app's handlers over stdio and Streamable HTTP |
| `agent-model`      | `@ndigo/ai`, `@ndigo/ai-sdk`, a provider package | Adds a bounded tool-calling loop with streaming          |
| `shared-cache`     | `@ndigo/cache`, `@ndigo/redis`                   | Swaps the in-process cache for a shared store            |

Three separations keep the word useful:

- **Capability vs package.** A package is an implementation; a capability is a
  goal. One capability may name several packages, and a package may serve
  several capabilities.
- **Capability vs scaffold.** A capability is a plan over declared operations
  (add a dependency, write a file, edit a key). It is not a canned application.
- **Capability vs skill.** The capability declares what installing means; the
  skill declares in what order to do it and what to check.

`ndigo add` already uses this sense — "install and wire an `@ndigo/*`
capability" — and this guide makes that usage exact.

## 3. What the CLI owns

The CLI is the deterministic executor. An authoring agent may call it
repeatedly, diff the output, and stop at any step; therefore a capability
command must meet one contract:

- **Plan, then apply.** The default is a dry run; `--apply` (or the explicit
  apply form) writes.
- **`--json` on every verb** — one document on stdout, diagnostics on stderr
  ([AD-97](../decisions/archive/2026-11-10_AD97_CLI_JSON_CONTRACT.md)).
- **Stable exit codes.** Non-zero means the plan could not be produced or the
  apply failed; it never means "probably fine".
- **No network while planning, no Nx generator, no monorepo checkout.** Applying
  delegates dependency installation to the package manager; Nx generators stay
  internal to `tools/` ([AD-93](../decisions/2026-11-05_AD93_INTERNALIZE_GENERATORS.md)).
- **Idempotence.** Re-running a plan over an already-wired app reports "nothing
  to do" and exits zero.

The verbs available today that an authoring agent drives:

```bash
ndigo commands --json      # the full command index
ndigo doctor --json        # environment, workspace, failed checks
ndigo inspect              # the app manifest: routes, mappings, config keys
ndigo routes --json        # the route list alone
ndigo openapi              # the generated OpenAPI document
ndigo mcp --readOnly       # the same manifest and routes over MCP
```

`ndigo new` and `ndigo add @ndigo/<pkg>` currently reach workspace generators
and are monorepo-internal; a consumer-side install path is the capability
catalog's job (section 6).

## 4. What a skill owns

A skill is a router over verbs, not documentation
([AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md) D-1):

| The skill carries                      | The skill never carries                        |
| :------------------------------------- | :--------------------------------------------- |
| Commands and their sequence            | Flags, package names, ids, or emitted surfaces |
| Traps ("this looks like X, it is Y")   | API descriptions copied from a package README  |
| Verification steps and expected output | Templates or generated files                   |
| A short example prompt                 | A per-harness variant of the same workflow     |

Facts come from machine output — `ndigo commands --json`, `ndigo inspect`, and
the installed package's `docs/llms.txt`. Hand-written skill content stays at or
below 120 lines and router-shaped; frontmatter, length, and package resolution
are checked mechanically, router shape is a review check
([AD-107](../decisions/2026-11-18_AD107_SKILLS_AUTHORING.md)).

## 5. Where facts live

One pipeline produces every agent-facing fact, so a fact cannot exist twice:

- **Package facts** derive from each manifest, including a small `ndigo` block
  (surfaces, capabilities, optional skill) that ships in the tarball.
- **Composition facts** are authored once in the CLI's shipped catalog
  (`packages/ndigo-cli/assets/capabilities/`), as plain JSON plus template
  files.
- **Emitted artifacts** — `docs-index.md`, per-package `docs/llms.txt`, CLI
  assets, and `.agent-content.json` — are generated by
  `tools/agent-content/build.mjs` from committed inputs, then drift-checked by
  `pnpm agent-content:check`. Never hand-edit them.

The generator reads files, not commands: it has no build step and never boots
the CLI, which is why the catalog is data rather than TypeScript.

## 6. Current state

The vocabulary and the contract are settled; the catalog and its commands land
in later phases (the vocabulary step is recorded in issue #701).

| Piece                                                | Status                                                          |
| :--------------------------------------------------- | :-------------------------------------------------------------- |
| Audience and category vocabulary, AD-114, this guide | Landed                                                          |
| Capability catalog + `ndigo capabilities`            | Planned — the catalog must be readable by the content generator |
| `ndigo add <capability>` (plan, dry run, apply)      | Planned — replaces the `nx g` shell-out in the consumer path    |
| Capability skills (`ndigo-agent`, `ndigo-model`)     | Planned — after the catalog so references can be checked        |
| `ndigo verify [capability]`                          | Planned — declared checks plus runtime probes                   |

Until the 1.0 publish gate closes, only the plan/dry-run half of a consumer
install is exercisable; install fixtures resolve workspace packages with
`link:`/`file:`.

## 7. Boundaries

- **Runtime agent packages stay here.** `@ndigo/mcp`, `@ndigo/ai`, and
  `@ndigo/ai-sdk` are not extracted: one `@parameters` + `validatedBy`
  declaration projects to the route, the OpenAPI operation, and `tools/list`,
  and that projection needs the dispatcher, the inspector, and the generators
  in one tree ([AD-114](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md) D-7).
- **UI behaviours are vendored.** When UI SDK leaves beta, `@ndigo/ui` moves
  behind an integration adapter and registry items re-point at it. The
  capability layer reserves the slot and imports no `@ui-sdk/*` package.
- **One operate contract.** The `AgentBridge` contract, `@ndigo/mcp`'s policy,
  the WebMCP adapter, and A2UI share `authorize`/`confirm`, `readOnly`,
  `exposedTo`, and the `source: agent` attribution. Every mutating surface,
  including an install-capable catalog tool, is filtered by `--readOnly`.
- **No harness matrix.** Emit the shared paths; delegate per-client discovery
  rules to the harness.

## 8. Verifying a change

Run the repository gates that cover this layer:

```bash
pnpm docs:links          # ADR, guide, and cross-links resolve
pnpm guides:check        # guide contract: H1, audience block, fences, index
pnpm agent-content:check # emitted facts match their inputs
pnpm manifest:check      # manifests and README/files gates
pnpm test:tooling        # agent-content and package-surface assertions
pnpm lint
```

For an application, `ndigo inspect` must still boot it, and the app's own
`@ndigo/mcp` server must list the same tools its OpenAPI document describes —
`packages/ndigo-mcp/test/parity.spec.ts` proves the projection, and a capability
that changes one surface without the other is not finished.

## See also

- [Guide 37 — The `ndigo` CLI](37-ndigo-cli.md) — the command surface the
  authoring agent drives
- [Guide 47 — AI Agents, Model Loops & Streaming](47-ai-agents.md) — the runtime
  agent side
- [Guide 48 — Agent-Facing Surfaces](48-agent-facing-surfaces.md) — one handler,
  many surfaces
- [AD-114 — Agent capabilities](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md)
- [AD-96 — Agent and LLM integration](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md)
- [AD-107 — Skills authoring](../decisions/2026-11-18_AD107_SKILLS_AUTHORING.md)
