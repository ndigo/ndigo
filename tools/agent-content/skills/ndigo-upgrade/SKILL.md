---
name: ndigo-upgrade
description: Upgrades Ndigo packages and adapts an application to framework changes. Use when bumping @ndigo/* versions or migrating after a breaking change.
---

# Upgrading Ndigo

## Decision table

| Goal                       | Command                                       |
| :------------------------- | :-------------------------------------------- |
| Compare installed versions | `ndigo update [dir] --check`                  |
| Apply the pinned versions  | `ndigo update [dir]`                          |
| Refresh agent context      | `ndigo ai:update [dir]`                       |
| See what changed           | `CHANGELOG.md`, `docs/migrations/`            |
| Re-verify                  | `ndigo lint && ndigo typecheck && ndigo test` |

## Sequence

1. `ndigo update --check` — reads the version manifest and lists the drift.
2. Read the changelog and any matching migration guide before applying.
3. `ndigo update` — applies exact pins, then `pnpm install`.
4. Fix breaking changes in the application (decorators, config, scripts).
5. `ndigo ai:update` — regenerates `AGENTS.md` rules and `.agents/skills/`.
6. Run the full verification lanes; regenerate registry files if `ndigo ui`
   items changed.

## Traps

- **Pins are exact.** The version manifest is the source of truth; do not mix
  versions across `@ndigo/*` packages.
- **The agent context is versioned.** After a framework update, the old
  `AGENTS.md` block describes the old surface; regenerate it.
- **Generated content is replaced.** Registry files, `.agents/skills/`, and
  `ui.lock.json` are outputs; edit the source or the registry, then regenerate.

## Verify

`ndigo update --check` reports no drift; `ndigo test`, `ndigo lint`, and
`ndigo typecheck` are green; `ndigo ai:check` reports no stale agent content.
