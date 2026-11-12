# AD-88: Project rename to ndigo

**Date:** 2026-11-03
**Status:** Accepted
**Deciders:** Framework owner (2026-11-03 naming review; issue #78)

---

## Context

The project cannot publish under its previous name:

- The `blue` name carries historical ties to a company — not worth the risk.
- The npm `@blue` scope and the GitHub `blue` namespace are both unavailable.
- Nothing is published yet (every package is unreleased), so a rename has zero
  migration cost. This is the cheapest possible window — before 1.0.0.

A naming search screened ~1,100 candidates (native and foreign words for
blue/spring, adjectives, coined forms, leet spellings, botanical vocabulary)
against GitHub accounts, npm package names, other registries, and a web
collision scan per finalist. Findings: short and dictionary names are namespace-
squatted (including nonsense forms); **ndigo** cleared every checked registry —
GitHub, npm package, PyPI, crates.io, RubyGems, NuGet, Maven, Hex — with only
peripheral commercial usage (notably cronologic's `ndigo` digitizer product
family and the `IndiGo`/`Indigo` adjacency: different classes and industries,
accepted as low risk).

Reserved 2026-11-03: npm org `ndigo`, GitHub org `ndigo`, domain `ndigo.dev`.

## Decision

Adopt **ndigo** as the project name and rename every owned surface:

| Surface           | Before                                                                  | After                                                                       |
| ----------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| npm scope         | `@blue/*`                                                               | `@ndigo/*`                                                                  |
| CLI               | `blue <command>`                                                        | `ndigo <command>`                                                           |
| Problem type URIs | `urn:blue:*`                                                            | `urn:ndigo:*`                                                               |
| Env vars          | `BLUE_*`                                                                | `NDIGO_*`                                                                   |
| Redis keys        | `blue:*`                                                                | `ndigo:*`                                                                   |
| Session cookies   | `__Host-blue-session` / `blue-session`                                  | `__Host-ndigo-session` / `ndigo-session`                                    |
| Durable tables    | `blue_sessions`, `blue_jobs`, `blue_queue_messages`, `_blue_migrations` | `ndigo_sessions`, `ndigo_jobs`, `ndigo_queue_messages`, `_ndigo_migrations` |
| Directories       | `packages/blue-*`, `apps/NN-blue-*`                                     | `packages/ndigo-*`, `apps/NN-ndigo-*`                                       |
| Repository        | `github.com/jeffrose/blue`                                              | `github.com/ndigo/ndigo` (transfer; URLs redirect)                          |

Name-bearing identifiers follow (`BlueTestApp` → `NdigoTestApp`,
`AsBlueElement` → `AsNdigoElement`, `blueAliases` → `ndigoAliases`, and the
like). The repository stays a **single monorepo** — the consumer-facing
core/node/web split already exists at the package level; a repo split would
multiply release and CI coordination without changing what consumers install
(revisit only on independent cadence/ownership needs).

**Dated historical records stay as written** — `docs/decisions`, `docs/plans`,
`docs/audits`, `docs/migrations`, dated `docs/reference` snapshots — with the
sole exception of link targets inside archives that pointed at renamed paths
(mechanically repaired so the docs link gate stays green). The CHANGELOG is not
historical yet (nothing is released), so its accumulated `[Unreleased]` notes
are part of this rename. A tracked follow-up pass will scrub the historic name
from the archives, including ADR filenames containing `blue`.

## Consequences

- 1.0.0 publishes as `@ndigo/*`; the release gate (#10) unblocks after this.
- Old GitHub URLs redirect; nothing published is orphaned (pre-publish window).
- Local paths (`~/Workspace/blue`, worktree-name examples) update in the
  follow-up pass or locally — not part of the code change.
- Archived ADR filenames containing `blue` (e.g. `..._BLUE_TEST_HARNESS.md`)
  keep resolving via the untouched archive files until the scrub pass.

**Revisit trigger:** none — this is identity, not design. A reversal would be
another rename, and the low-risk pre-publish window exists once.
