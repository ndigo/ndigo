# Guide 51 — Capabilities for Authoring Agents

A coding agent can generate code, but it needs a repeatable way to add a feature, know what changed, and prove it works. Ndigo's capability catalog packages the packages, wiring, files, and checks for one user-facing outcome — the CLI plans and applies them, skills sequence the work, and `ndigo verify` proves the result.

**Use for:** agent-driven feature installation with plan/apply and verification.

**Not for:** manual wiring; the capability catalog exists so agents don't improvise.

This guide states the contract for the layer: what a capability is, what the CLI owns, and what a skill owns.

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

These names replace the earlier "Development agents" / "Product agents"
labels. Neither audience is the maintainer-only `development-agents/` store or
the gitignored `agent-local/` tree.

Three categories describe the code those audiences touch
([CONTRIBUTING.md](../../CONTRIBUTING.md#package-categories)):

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

`ndigo add <capability>` plans the composed unit by default and applies it with
`--apply`; a package name is accepted and resolved through the catalog.
`ndigo capabilities get <id>` shows which packages and operations that unit
declares.

## 3. What the CLI owns

The CLI is the deterministic executor. An authoring agent may call it
repeatedly, diff the output, and stop at any step; therefore a capability
command must meet one contract:

- **Plan, then apply.** The default is a dry run; applying takes an explicit
  opt-in flag.
- **`--json` on every verb** — one document on stdout, diagnostics on stderr.
- **Stable exit codes.** Non-zero means the plan could not be produced or the
  apply failed; it never means "probably fine".
- **No network while planning, no Nx generator, no monorepo checkout.** Applying
  delegates dependency installation to the package manager; Nx generators stay
  internal to `tools/`.
- **Idempotence.** Re-running a plan over an already-wired app reports "nothing
  to do" and exits zero.
- **Conflicts are data.** The plan reports them; applying stops before writing
  anything and exits `1`. A plan that reports a conflict still exits `0` — the
  plan was produced. `--force` resolves a differing file or JSON value, but
  never an unresolved template variable.

Verbs an authoring agent drives today:

```bash
ndigo commands --json      # the full command index
ndigo doctor --json        # environment, workspace, failed checks
ndigo capabilities --json  # capabilities plus UI items, one sorted index
ndigo capabilities check   # catalog reference integrity
ndigo add agent-surface    # the install plan (nothing is written)
ndigo verify --capability agent-surface  # declared checks + runtime probes
ndigo inspect              # the app manifest: routes, mappings, config keys
ndigo routes --json        # the route list alone
ndigo openapi              # the generated OpenAPI document
ndigo mcp --readOnly       # the manifest, routes, and catalog over MCP
```

`ndigo new` still reaches a workspace generator and is monorepo-internal. The
consumer-side install path is `ndigo add <capability>` (section 6).

## 4. What a skill owns

A skill is a router over verbs, not documentation:

| The skill carries                      | The skill never carries                        |
| :------------------------------------- | :--------------------------------------------- |
| Commands and their sequence            | Flags, package names, ids, or emitted surfaces |
| Traps ("this looks like X, it is Y")   | API descriptions copied from a package README  |
| Verification steps and expected output | Templates or generated files                   |
| A short example prompt                 | A per-harness variant of the same workflow     |

Facts come from machine output — `ndigo commands --json`, `ndigo inspect`, and
the installed package's `docs/llms.txt`. Hand-written skill content stays at or
below 120 lines and router-shaped; frontmatter, length, and package resolution
are checked mechanically, router shape is a review check.

## 5. Where facts live

The rule is one pipeline per fact, so a fact cannot exist twice. Every layer
below ships today and is drift-checked by the same gates.

- **Package facts** derive from each manifest. A small `ndigo` block (surfaces,
  capabilities, optional skill) ships in the tarball, so a package and its
  emitted index cannot disagree; `scripts/check-manifests.mjs` validates it
  against the catalog in both directions.
- **Composition facts** are authored once in the CLI's shipped catalog
  (`packages/ndigo-cli/assets/capabilities/`), as plain JSON plus template
  files. Templates carry `{{placeholder}}` holes filled from `--var key=value`
  and the built-in `appName`; an unresolved placeholder is a plan conflict, so
  no partially rendered file is ever written. The catalog itself never contains
  generated code.
- **Emitted artifacts** — `docs-index.md`, per-package `docs/llms.txt`, the
  generated `packages.json`/`items.json` indexes, and `.agent-content.json` —
  are generated by `tools/agent-content/build.mjs` from committed inputs, then
  drift-checked by `pnpm agent-content:check`. Never hand-edit them.

The generator reads files, not commands: it has no build step and never boots
the CLI, which is why the catalog is data rather than TypeScript.

## 6. Current state

The vocabulary and the contract are settled (issue #701); every phase of the
layer — the catalog, `ndigo add`, the coordination skills, and runtime
verification — has landed.

| Piece                                           | Status                                                                    |
| :---------------------------------------------- | :------------------------------------------------------------------------ |
| Audience and category vocabulary, this guide    | Landed                                                                    |
| Capability catalog + `ndigo capabilities`       | Landed — declared entries, `list`/`get`/`check`, manifest facts           |
| `ndigo add <capability>` (plan, dry run, apply) | Landed — plan default, `--apply`, `--var`, `--force`; no `nx g`           |
| Capability skills                               | Landed — `ndigo-agent`, `ndigo-model`; rows in `ndigo-app`/`ndigo-verify` |
| `ndigo verify [capability]`                     | Landed — declared checks, MCP probe, manifest ↔ OpenAPI parity            |

Until the 1.0 publish gate closes, only the plan/dry-run half of a consumer
install is exercisable; install fixtures resolve workspace packages with
`link:`/`file:`.

## 7. Boundaries

- **Runtime agent packages stay here.** `@ndigo/mcp`, `@ndigo/ai`, and
  `@ndigo/ai-sdk` are not extracted: one `@parameters` + `validatedBy`
  declaration projects to the route, the OpenAPI operation, and `tools/list`,
  and that projection needs the dispatcher, the inspector, and the generators
  in one tree.
- **UI behaviours are vendored.** When UI SDK leaves beta, `@ndigo/ui` moves
  behind an integration adapter and registry items re-point at it. The
  capability layer reserves the slot and imports no `@ui-sdk/*` package.
- **One operate contract.** `AgentBridge`, `@ndigo/mcp`'s registry policy, the
  WebMCP adapter, and A2UI's component allowlist converge on one authorization
  vocabulary. Today the bridge carries tool annotations and `exposedTo`, the
  registry adds `authorize`/`confirm`/`readOnly`, the WebMCP adapter maps the
  annotations, and A2UI gates by installed component. MCP surfaces expose
  `--readOnly` (or the equivalent registry option) to omit mutating tools, and
  an install-capable catalog tool is marked mutating so it is filtered.
  Attribution is one convention: `source: agent` on `gen_ai.tool.call.source`.
- **No harness matrix.** Emit the shared paths; delegate per-client discovery
  rules to the harness.

## 8. Verifying a change

Run the repository gates that cover this layer:

```bash
pnpm docs:links          # docs links and internal-reference gate
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

- [Guide 37 — The Ndigo CLI](37-ndigo-cli.md) — the command surface the
  authoring agent drives
- [Guide 47 — AI Agents & Streaming](47-ai-agents.md) — the runtime
  agent side
- [Guide 48 — Agent-Facing Surfaces](48-agent-facing-surfaces.md) — one handler,
  many surfaces
- [Guide 52 — The Agent Operate Contract](52-agent-operate-contract.md) — one
  vocabulary and policy for the bridge, MCP, WebMCP, and A2UI
