# AD-98: Agent content generation and the two-store split

> **Consolidated** — merged into the umbrella ADR. Retained for history.

**Date:** 2026-11-10
**Status:** Accepted.

## Context

Agent instructions and skills drift when they are copied into each consumer.
The repository already had `agent-local/skills/ndigo-ui`, synced into
`.opencode/` and `.omp/`, but that is development tooling for this repository,
not content an application should receive. Publishing the same material to
consumers would need a second lifecycle: version-matched to the installed
framework, installable into an application, and safe to regenerate.

There was also a temptation to install content per harness (`.claude/`,
`.cursor/`, `.github/`, …). That matrix changes with every client release and
would make the CLI the owner of other tools' discovery rules.

## Decision

**One authored source, generated satellites.** `tools/agent-content/` owns the
instructions, the skill sources, and the docs-index generator. The generator
writes:

- the CLI's `packages/ndigo-cli/assets/agent/` payload (instructions, skills,
  `docs-index.md`);
- the `create-ndigo-app` template payload;
- content hashes in `tools/agent-content/.agent-content.json`.

CI runs `agent-content:check`; a hand-edited satellite or a stale hash fails.

**Two stores, no cross-import.** `development-agents/` and `agent-local/`
remain the contributors' harness content. `tools/agent-content/` is the
consumer content. Neither imports the other; the consumer store is generated
from its own sources.

**Passive context first.** `ndigo ai:init` writes a managed block in
`AGENTS.md` between `<!-- BEGIN:ndigo-agent-rules -->` and
`<!-- END:ndigo-agent-rules -->`, preserving surrounding edits, plus a
retrievable docs index. Skills cover workflows (adoption, generation,
verification), not reference facts.

**Skills are workflows, version-matched.** Nine skills ship under
`.agents/skills/<id>/SKILL.md`. They name commands and traps and defer facts to
`ndigo commands --json`, `ndigo ui list --json`, and similar machine output.

**`.mcp.json` is opt-in and shared-shape only.** `--mcp` merges the `ndigo`
server into `.mcp.json`, preserving every other server. No per-harness config
file is written. Other clients are documented snippets, and a generated
`ndigo/skills` mirror is installed with `npx skills add`.

**`ai:init` is idempotent and inspectable.** `--dry-run` prints the plan,
`--skills` writes skills only, `--force` replaces drifted generated skill
files, `--instruction-file` targets another file. `ai:check` exits `1` on
drift; `ai:update` refreshes. `create-ndigo-app` includes the bootstrap by
default and exposes `--agents`/`--no-agents`.

## Rationale

- One source plus hashes is the only way to keep the CLI payload, CNA template,
  and docs index from drifting independently.
- A generated mirror removes the harness matrix from the framework while still
  giving harness-specific installers something to consume.
- Managed blocks make regeneration safe in a file users also edit.
- Version-matched content is the point: an application's agent should learn the
  API it actually installed, not the website's latest.

## Consequences

- Adding a skill or changing the instruction block requires editing
  `tools/agent-content/` and regenerating; satellites are never hand-edited.
- The CLI grows a build-time dependency on the generator, not on a network
  service.
- `.agents/skills/` is the only skill path the framework writes; harness
  discovery beyond that is out of scope.
- Docs index generation must include new guides/packages or CI fails, so the
  agent's map stays current.

## Revisit triggers

- The shared `AGENTS.md`/skills conventions split or a dominant harness adds a
  required metadata field.
- The generated mirror needs a release cadence independent of the framework.
- The docs index outgrows its compressed form or needs retrieval beyond a
  static file.

## Evidence

- `tools/agent-content/build.mjs`, `tools/agent-content/.agent-content.json`.
- `packages/ndigo-cli/assets/agent/`, `packages/create-ndigo-app` templates.
- Guide 37 — `ndigo ai` command surface.
- `pnpm agent-content:check` in the quality lane.
- PR #331.

## See Also

- AD-96 — umbrella
- AD-97 — CLI JSON contract
- AD-99 — MCP host extraction
