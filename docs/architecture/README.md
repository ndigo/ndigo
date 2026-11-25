# Architecture Documentation

Design rationale and subsystem maps for Ndigo — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [design-principles.md](./design-principles.md) — SOLID and DRY/AHA adapted for TypeScript, the design-pattern vocabulary, and the shared contract rules.
- [decorators.md](./decorators.md) — the decorator catalog, metadata, performance, and custom-decorator guidance.
- [environment-design-notes.md](./environment-design-notes.md) — internal design notes for the configuration model (repo-only; the public page is [environment.md](./environment.md)).
- [package-map.md](./package-map.md) — the hand-maintained package table with layer, platform, and runtime dependencies (repo-only; the public inventory is generated on the site).
- [security.md](./security.md) — the security posture: trust boundaries (browser → proxy → node → backends), the defense-in-depth layer map, and the standards behind them.
- [security-design-notes.md](./security-design-notes.md) — internal notes for the resolved security tensions and the pre-release problem-type caveat (repo-only; the public page is [security.md](./security.md)).
- [agent-first.md](./agent-first.md) — the agent-first architecture: authoring vs runtime agents, one declaration projected to every audience, deterministic operations instead of prose, capabilities as the installable unit, and verification as an executable contract.
- [annotation-and-transformer-model.md](./annotation-and-transformer-model.md) — the declaration and execution model: what a decorator declares about a member, what runs around a call, what replaces the member, and how each decorator picks one mechanism.
- [lifecycle-and-ownership.md](./lifecycle-and-ownership.md) — the resource discipline: owned vs borrowed resources, the lifecycle contracts, fail-loud initialization, and the stop/drain/destroy ordering.
- [lifecycle-and-ownership-design-notes.md](./lifecycle-and-ownership-design-notes.md) — internal design notes for resource teardown (repo-only; the public page is [lifecycle-and-ownership.md](./lifecycle-and-ownership.md)).
- [environment.md](./environment.md) — the environment and configuration architecture: design principles, the precedence chain, security posture, and scope and limits.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature applications and islands, the host lifecycle, shared dependencies, event isolation, and how the model compares with single-SPA.
- [micro-frontends-design-notes.md](./micro-frontends-design-notes.md) — internal notes for the deferred micro frontend gaps (repo-only; the public page is [micro-frontends.md](./micro-frontends.md)).
