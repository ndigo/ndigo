# AD-114: Agent capabilities — the CLI executes, skills coordinate

**Date:** 2026-11-23
**Status:** Accepted
**Related:** AD-96 (amended by this record), AD-70 (introspection first),
AD-75 (the CLI as a thin front), AD-93 (generators stay in `tools/`), AD-107
(standalone `ndigo-skills`), AD-113 (public surface policy)
**Refs:** #701 (this record), #10 (1.0 publish gate)

## Context

Agents now build Ndigo applications on behalf of their users. The substrate is
in place: the CLI exposes deterministic verbs (`new`, `add`, `inspect`,
`routes`, `openapi`, `doctor`, `mcp`, `ai init`), `ndigo-skills` coordinates
workflows over them, and `tools/agent-content` derives version-matched docs
from committed inputs. Three gaps remain.

**The vocabulary is overloaded.** AD-96 names the audiences _development
agents_ and _product agents_. Neither label survives contact with the repo:
the first collides with the maintainer-only `development-agents/` directory,
and "tools" means three different things — the repo-level `tools/` directory,
the `TOOLING_PACKAGES` set (`src/oxlint/_layers.ts:80`), and MCP tools.

**There is no declared unit between a package and a workflow.** Wiring
knowledge is split across Nx generators, guides, and skills. `ndigo add` is the
only install path, and in a consumer app it is not deterministic: it shells
`pnpm exec nx g @ndigo/generators:<pkg>-setup`
(`packages/ndigo-cli/src/commands/add.ts:23`), while `@ndigo/generators` is
private in `tools/` (AD-93) — so all five `*-setup` generators (cache, jobs,
mcp, redis, socket) are unreachable outside the monorepo. Exit 127 is treated
as acceptable (`add.ts:27`), so on a machine without `nx` the setup step fails
silently, not with the "wire manually" message.

**Extraction looked attractive and was rejected.** `@ndigo/ai`,
`@ndigo/ai-sdk`, and `@ndigo/mcp` sit in the runtime layer, but they are what an
_application_ installs, not what an authoring agent installs. Moving them to a
satellite repository would break the metadata invariant that makes the agent
surfaces trustworthy: one `@parameters` + `validatedBy` declaration projects to
the HTTP route, the OpenAPI operation, and `tools/list`
(`packages/ndigo-mcp/src/project.ts`, `packages/ndigo-mcp/test/parity.spec.ts`).
That projection requires `@ndigo/dispatcher`, `@ndigo/inspect`, and the
generators in the same tree, and a satellite catalog would have to be
hand-maintained where package metadata can derive it.

## Decision

**D-1 — A capability is the installable unit.** A capability is a declared,
installable unit of application behaviour: the user-goal-level thing an app
gains ("agent surface", "shared cache"), implemented by one or more
packages/subpaths/drivers, plus wiring operations, files, emitted surfaces
(route, OpenAPI operation, MCP tool, view), checks, and the skill that teaches
it. Each capability is declared once, in the CLI's shipped catalog.

**D-2 — The CLI is the deterministic executor.** `ndigo capabilities` and
`ndigo add <capability>` plan, dry-run by default, apply on request, and report
`--json` (AD-97). Planning and checking touch no network and need no monorepo
checkout; applying delegates dependency installation to the package manager
and never invokes an Nx generator. Nx generators remain monorepo-internal
(AD-93).

**D-3 — Skills coordinate; facts come from machine output.** A skill carries
commands, their sequence, traps, and verification. It does not copy facts
(flags, ids, packages, emitted surfaces) — those come from `ndigo capabilities
--json` and the per-package `llms.txt` index (AD-96 D-1, AD-107). Line budget,
frontmatter, and package resolution are mechanical checks; router shape is a
review check.

**D-4 — Facts derive; composition is authored.** Package facts derive from
manifests (a small `ndigo` block per package, shipped in the tarball). Wiring
and composition are authored once in the catalog. `agent-content:check`
drift-gates every emitted artifact from the same inputs: `docs-index.md`,
per-package `llms.txt`, CLI assets, and `.agent-content.json`. There is one
emitter and one manifest, never a second drift surface.

**D-5 — UI behaviours are vendored.** `@ndigo/ui` will be re-implemented on UI
SDK once it leaves beta, behind an integration adapter; UI registry items then
become a capability family re-pointed at that adapter. Ndigo ships no rival
behaviour model. The capability layer reserves the adapter slot and does not
import `@ui-sdk/*`.

**D-6 — One operate contract.** `AgentBridge` (`packages/ndigo-core/src/agent-bridge.ts`),
`@ndigo/mcp`'s tool policy, the WebMCP adapter, and A2UI surfaces converge on one
authorization vocabulary — `authorize`/`confirm`, `readOnly`, feature gates,
`exposedTo` — and one attribution: `source: agent`, carried on
`gen_ai.tool.call.source`. MCP surfaces expose `--readOnly` (or the equivalent
registry option) to omit mutating tools, install-capable catalog tools are
marked mutating so it filters them, and installs are dry-run unless
`dryRun: false` (AD-96 D-5).

**D-7 — The runtime agent packages stay in this repository.** `@ndigo/mcp`,
`@ndigo/ai`, and `@ndigo/ai-sdk` are runtime capabilities an application
installs; they are not extracted, and the capability catalog is not split into
a satellite repository. The derive-from-code property and the route ↔ OpenAPI ↔
`tools/list` invariant require them beside the dispatcher, the inspector, and
the generators.

## Consequences

- The CLI grows a capability interpreter and a shipped catalog at
  `packages/ndigo-cli/assets/capabilities/`; `assets` is already in the
  package's `files`, so no manifest change is needed for shipping.
- `ndigo capabilities`, `ndigo capabilities get <id>`, and `ndigo
  capabilities check` join the CLI. The catalog is plain JSON plus template
  files so `tools/agent-content/build.mjs` can read it without a build or a CLI
  boot.
- `ndigo mcp` gains two read-only tools (`list_capabilities`,
  `get_capability`) — no new surface: the CLI host already serves `ndigo mcp`
  and `ndigo ui mcp`. Install-capable tools are mutating and must be marked so.
- Skills grow by at most two; whether that is two focused skills or one combined
  is settled when they are authored. Existing skills gain capability rows rather
  than new prose.
- `manifest:check` learns to accept and validate the `ndigo` block.
- Until the 1.0 publish gate (#10) closes, only the plan/dry-run half of
  `ndigo add <capability>` is exercisable by a real consumer; install fixtures
  resolve workspace packages with `link:`/`file:`.

## Revisit triggers

- UI SDK leaves beta and the `@ndigo/ui` adapter lands; registry items are
  re-pointed and D-5 is re-read.
- The capability document outgrows a single `--json` payload, or a consumer
  needs to filter it server-side.
- A capability requires runtime state the CLI cannot provision; that is
  evidence for a runtime primitive, not for a larger catalog.
- An MCP transport arrives that the CLI host does not abstract, or
  install-capable tools need authorization beyond `readOnly`/`confirm` (AD-99
  trigger 3).
- A capability's wiring cannot be expressed as declared operations without
  becoming a scaffold generator; prefer a runtime primitive over templating.

## Evidence

- `packages/ndigo-cli/src/commands/add.ts` — the `nx g` shell-out and the
  accepted exit 127.
- `tools/generators/package.json` — `private: true`; `tools/generators/src/generators/{cache,jobs,mcp,redis,socket}-setup`.
- `packages/ndigo-cli/src/helpers/mcp-host.ts` and
  `packages/ndigo-mcp/src/server.ts` — the two MCP hosts AD-99 sanctioned.
- `packages/ndigo-mcp/src/project.ts`, `packages/ndigo-mcp/test/parity.spec.ts`
  — the one-schema projection.
- `packages/ndigo-core/src/agent-bridge.ts`, `packages/ndigo-mcp/src/registry.ts`,
  `packages/ndigo-view-webcomponent/src/webmcp.ts` — the operate contract and
  its first (tool-declaration) adapter.
- `tools/agent-content/build.mjs` — `outputPlan()`, `manifestFor()`, and the
  drift check the catalog must join.
- `src/oxlint/_layers.ts:80` — `TOOLING_PACKAGES`.
- Plan: agent-friendly items A–H shipped as #557–#560.

## See Also

- [AD-96](2026-11-10_AD96_LLM_AGENT_INTEGRATION.md) — agent and LLM
  integration; amended here for the audience vocabulary.
- [AD-93](2026-11-05_AD93_INTERNALIZE_GENERATORS.md) — generators stay in
  `tools/`; the premise of D-2.
- [AD-107](2026-11-18_AD107_SKILLS_AUTHORING.md) — skills are authored in the
  standalone repository and vendored as a pinned snapshot.
- [AD-99](archive/2026-11-10_AD99_MCP_HOST_EXTRACTION.md) — host ownership and
  its revisit trigger 3.
- [AD-100](archive/2026-11-10_AD100_MCP_TOOL_PROJECTION.md) — the projection
  invariant behind D-7.
- [AD-70](2026-10-06_AD70_EDITOR_TOOLING_INTROSPECTION_FIRST.md) and
  [AD-75](2026-10-07_AD75_FRAMEWORK_CLI.md) — introspection first, CLI as a
  thin front.
- [Guide 51](../guides/capabilities-for-authoring-agents.md) — the
  vocabulary and the authoring workflow.
