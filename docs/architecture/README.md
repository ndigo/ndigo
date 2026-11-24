# Architecture Documentation

Design rationale and subsystem maps for Ndigo — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [security.md](./security.md) — the security posture: trust boundaries (browser → proxy → node → backends), the defense-in-depth layer map, the resolved tensions, and the standards behind them.
- [agent-first.md](./agent-first.md) — the agent-first architecture: authoring vs runtime agents, one declaration projected to every audience, deterministic operations instead of prose, capabilities as the installable unit, and verification as an executable contract.
- [annotation-and-transformer-model.md](./annotation-and-transformer-model.md) — the declaration and execution model: what a decorator declares about a member, what runs around a call, what replaces the member, and how each decorator picks one mechanism.
- [lifecycle-and-ownership.md](./lifecycle-and-ownership.md) — the async and resource discipline: async-by-default, owned vs borrowed resources, explicit fail-loud initialization, and the stop/drain/close ordering.
- [environment.md](./environment.md) — the environment and configuration architecture: design principles, the precedence chain, key tensions and resolutions, security posture, and scope and limits.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature applications and islands, the host lifecycle, shared dependencies, event isolation, and how the model compares with single-SPA.
