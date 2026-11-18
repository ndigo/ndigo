# AD-107: Skills authoring — the standalone `ndigo-skills` repository

**Date:** 2026-11-18
**Status:** Implemented (2026-11-18).

**Related:** AD-96 (agent and LLM integration, D-2/D-6/D-7), AD-98 (agent
content generation, archived into AD-96).

## Context

AD-96 D-2 made `tools/agent-content` the single authored source for consumer
agent content, with the CLI payload and `create-ndigo-app` templates generated
from it. That works for material that only ships inside the framework, but
skills have a second audience and a different cadence:

- They are useful outside a running Ndigo app — a maintainer, a reviewer, or an
  agent working in an adjacent repository can install them into any harness
  with `npx add-skill ndigo/ndigo-skills`.
- They change for editorial reasons (a clearer trap, a renamed command) far more
  often than the framework releases, and their validation (frontmatter, length)
  is independent of a TypeScript build.
- Hosting them only in a monorepo makes external contribution require the whole
  workspace.

The interim build also auto-detected a sibling `../ndigo-skills` checkout and
preferred it over the in-repo copy, so the same commit could emit different
assets on different machines. That is not reproducible.

## Decision

**One canonical repository; the monorepo vendors a pinned snapshot.**
`github.com/ndigo/ndigo-skills` owns the authored `ndigo-*` skills (one
directory per skill, frontmatter `name` matching the directory, at most 120
lines). The repository validates itself in CI (`scripts/check.mjs`) and
documents sync into the monorepo.

**The monorepo never fetches skills at build time.** `tools/agent-content/build.mjs`
reads only `tools/agent-content/skills/` and refuses to emit while the snapshot
disagrees with `skills.lock.json`. The lock records the source URL, package
version, source commit, and a sha256 per `SKILL.md`, so a published asset set
always traces to one upstream commit and works offline.

**Sync is explicit and requires a clean source.**
`pnpm agent-content:sync` copies from the sibling `../ndigo-skills` checkout
(override with `NDIGO_SKILLS_DIR`), refuses a dirty checkout, removes stale
skill directories, and rewrites the lock. A `--check` mode verifies the
snapshot without writing.

**Instructions and the docs index stay in the monorepo.** The managed
`AGENTS.md` block, the scaffold bootstrap pointer, and the generated docs index
track the framework version; only skills moved.

## Rationale

- A pinned snapshot keeps `ndigo ai init` deterministic and offline while the
  authored content lives where it can be installed and reviewed on its own.
- Recording the commit in the lock makes the vendored copy auditable: the diff
  in the monorepo is content plus provenance, not an opaque copy.
- Validating in both repositories catches a malformed skill before it reaches a
  release, and keeps the skills repo's CI independent of a TypeScript monorepo.
- Rejecting a dirty source checkout prevents a lock commit hash that does not
  describe the copied files.

## Consequences

- Changing a skill is a two-step flow: merge in `ndigo-skills`, then run
  `pnpm agent-content:sync && pnpm agent-content:build` in `ndigo` and commit
  the snapshot, lock, and regenerated satellites together.
- The monorepo diff for a skill edit is larger (vendored copy plus generated
  CLI assets), and `agent-content:check` fails until the sync is committed.
- Skills can be released and installed without waiting for a framework release;
  the framework still ships the version it was built against.
- `tools/agent-content/skills/` is read-only in the monorepo; hand edits fail
  the drift check.

## Revisit triggers

- The vendored copy becomes a maintenance burden large enough to justify a
  versioned dependency instead of a snapshot.
- Skills are published to npm as a package the CLI can depend on.
- A skill needs generated content (command inventories, catalog extracts) rather
  than prose; that belongs in the monorepo generator, not the skills repo.

## Evidence

- `ndigo-skills`: `scripts/check.mjs`, `.github/workflows/check.yml`, and the
  README sync instructions.
- `ndigo`: `tools/agent-content/sync-skills.mjs`, `_skills.mjs`,
  `skills.lock.json`, and the lock verification in `build.mjs`.
- `pnpm agent-content:sync|build|check` in `package.json`.

## See Also

- AD-96 — umbrella record; this supersedes D-2 for skills only (their authored
  source), and leaves D-6 (ship with the CLI) and D-7 (no harness matrix)
  intact.
- AD-98 — the original generation split.
