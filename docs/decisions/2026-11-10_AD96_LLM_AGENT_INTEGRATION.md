# AD-96: Agent and LLM integration — two audiences, one derived surface (consolidated)

**Date:** 2026-11-10
**Status:** Accepted — umbrella record for AD-97..AD-101.

## Context

Two different agents now consume a Ndigo project, and they need different
things:

- **Development agents** write the application. They need `AGENTS.md`, workflow
  skills, version-matched docs, and a CLI that can be driven without parsing
  human prose.
- **Product agents** run on top of the application. They need the application's
  own tools, UI representation, and a model loop that respects the framework's
  telemetry, limits, and configuration.

Treating both as "AI documentation" produces two failure modes: a harness
matrix that rots per client, and a second tool description that drifts from the
HTTP route. The framework already has the substrate to avoid both — `@ndigo/openapi` projects schemas from dispatch metadata, `@ndigo/inspect` reads the
application manifest, `@ndigo/ui` has a per-application component allowlist,
and agent content already syncs from one source.

## Decision

**D-1 — Skills are routers over verbs, not documentation.** A skill names the
commands and traps for a workflow; facts (flags, item lists, routes) come from
machine output because they change faster than prose.

**D-2 — One authored source per artifact; satellites are generated.**
`tools/agent-content` is the source; the CLI assets, `create-ndigo-app`
templates, docs index, and any published skills mirror are generated and
drift-checked.

**D-3 — The agent surface derives from serving metadata.** `@toolMapping`
tools reuse the same `@parameters` + `validatedBy` schemas that bind HTTP.
There is no second tool description.

**D-4 — Passive context first, skills second.** Ship an `AGENTS.md` block and a
retrievable docs index; reserve skills for workflows.

**D-5 — Read-only posture, explicit mutation.** Every server exposes
`--readOnly` to omit mutating tools, and installs are dry-run unless
`dryRun: false`; a write never happens by default.

**D-6 — Consumer content ships with the CLI.** Skills, docs index, and
instruction blocks are version-matched to the installed framework.

**D-7 — No harness matrix.** Emit `AGENTS.md` and
`.agents/skills/<id>/SKILL.md`; write `.mcp.json` only under `--mcp` and only in
the shared shape. Per-harness installation is delegated to `npx skills add`
against a generated mirror, never implemented in the CLI.

**D-8 — Representations are negotiated, not special-cased.** A2UI, MCP App
resources, WebMCP declarations, and TOON are view representations selected like
any other.

The phases that carry these decisions are recorded separately: AD-97 (CLI JSON),
AD-98 (agent content), AD-99 (MCP host), AD-100 (`@ndigo/mcp`), and AD-101
(A2UI/MCP Apps/WebMCP).

## Rationale

- Agent content drifts fastest where it duplicates facts. Routing to commands
  keeps the skill stable while the framework grows.
- Schema projection is already proven by OpenAPI. Reusing it gives tool/HTTP
  parity mechanically instead of by review.
- A generated mirror plus the shared `AGENTS.md`/skills paths covers the
  harnesses that matter without owning each client's discovery rules.
- Product agents need framework-grade instrumentation, not a second AI
  framework: `@ndigo/ai` owns the loop and `@ndigo/ai-sdk` is the only package
  importing the AI SDK.

## Consequences

- `@ndigo/mcp`, `@ndigo/ai`, and `@ndigo/ai-sdk` are public packages with the
  usual README/API/guide gates; `@ndigo/ai-sdk` is registered as an integration
  layer.
- The CLI grows `ai:*`, `mcp`, `commands`, and a uniform `--json` contract.
- `@ndigo/ui` catalog projection and the A2UI/WebMCP items become part of the
  agent story, not separate features.
- Generated agent content is a CI gate; hand-editing a mirror fails the build.
- Read-only remains the default for every new MCP surface.

## Revisit triggers

- The `AGENTS.md`/skills discovery conventions diverge enough that the shared
  paths stop being shared.
- A harness requires a materially different content shape; prefer changing the
  generated mirror over adding a matrix.
- MCP Apps, A2UI, or WebMCP change their transport/extension contracts.
- The AI SDK makes a breaking major release; `@ndigo/ai-sdk` absorbs it, but
  the adapter contract (`AIModel`) is the compatibility boundary.
- A second product-agent consumer exposes a missing framework primitive, or the
  existing `@ndigo/ai` surface proves too thin to be Ndigo-shaped.

## Evidence

- Plan: [Agent and LLM integration plan](../plans/2026-11-09_LLM_AGENT_INTEGRATION.md).
- Shipped: `@ndigo/mcp`, `@ndigo/ai`, `@ndigo/ai-sdk`,
  `apps/21-ndigo-agent-lab`, `tools/agent-content`, `ndigo ai:*`, `ndigo mcp`,
  `ndigo ui catalog`, `nd-a2ui-surface`, MCP Apps `ui://` resources, WebMCP.
- Guides: 37 (`ndigo` CLI), 47 (AI agents, MCP tools, streaming), and 48
  (agent-facing surfaces).
- Issues/PRs: #327, #329, #331, #333, #335, #337, #339, #342, #344, #346.

## See Also

- AD-97, AD-98, AD-99, AD-100, AD-101
- AD-70 — introspection first
- AD-75 — the CLI as a thin front
- AD-95 — ndigo-ui registry and the per-application allowlist

## Consolidated decisions

This ADR consolidates AD-96 through AD-101 (agent/LLM integration). Archived records: [AD-97](archive/2026-11-10_AD97_CLI_JSON_CONTRACT.md), [AD-98](archive/2026-11-10_AD98_AGENT_CONTENT_GENERATION.md), [AD-99](archive/2026-11-10_AD99_MCP_HOST_EXTRACTION.md), [AD-100](archive/2026-11-10_AD100_MCP_TOOL_PROJECTION.md), [AD-101](archive/2026-11-10_AD101_A2UI_ADOPTION.md).
