# Architecture Documentation

Design rationale and subsystem maps for Ndigo — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [design-principles.md](./design-principles.md) — SOLID and DRY/AHA adapted for TypeScript, the design-pattern vocabulary, and the shared contract rules.
- [conventions-and-idioms.md](./conventions-and-idioms.md) — the durable idioms: the five nouns, naming that carries meaning, module boundaries, errors, and documentation habits. The condensed entry point for conventions.
- [decorators.md](./decorators.md) — the decorator catalog, metadata, performance, and custom-decorator guidance.
- [environment-design-notes.md](./environment-design-notes.md) — internal design notes for the configuration model (repo-only; the public page is [environment.md](./environment.md)).
- [package-map.md](./package-map.md) — the hand-maintained package table with layer, platform, and runtime dependencies (repo-only; the public inventory is generated on the site).
- [security.md](./security.md) — the security posture: trust boundaries (browser → proxy → node → backends), the defense-in-depth layer map, and the standards behind them.
- [security-design-notes.md](./security-design-notes.md) — internal notes for the resolved security tensions and the pre-release problem-type caveat (repo-only; the public page is [security.md](./security.md)).
- [agent-first.md](./agent-first.md) — the agent-first architecture for application developers: one declaration projected into endpoints, API docs, and MCP tools; authoring vs runtime agents; capabilities as the installable unit; and executable verification.
- [agent-first-design-notes.md](./agent-first-design-notes.md) — internal notes for the resolved tensions, the separate-product rejection, and the pre-release limits (repo-only; the public page is [agent-first.md](./agent-first.md)).
- [annotation-and-transformer-model.md](./annotation-and-transformer-model.md) — the declaration and execution model for application developers: annotations that record a fact, advice that runs around a call, and member transformers that replace a member — and when to use each.
- [annotation-and-transformer-model-design-notes.md](./annotation-and-transformer-model-design-notes.md) — internal notes for the consumption seams, executor internals, naming rules, and open questions (repo-only; the public page is [annotation-and-transformer-model.md](./annotation-and-transformer-model.md)).
- [annotation-and-transformer-model-inventory.md](./annotation-and-transformer-model-inventory.md) — the full mechanism inventory for every decorator in the tree (repo-only; the public page keeps representative examples).
- [lifecycle-and-ownership.md](./lifecycle-and-ownership.md) — the resource discipline: owned vs borrowed resources, the lifecycle contracts, fail-loud initialization, and the stop/drain/destroy ordering.
- [lifecycle-and-ownership-design-notes.md](./lifecycle-and-ownership-design-notes.md) — internal design notes for resource teardown (repo-only; the public page is [lifecycle-and-ownership.md](./lifecycle-and-ownership.md)).
- [environment.md](./environment.md) — the environment and configuration architecture: design principles, the precedence chain, security posture, and scope and limits.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature applications and islands, the host lifecycle, shared dependencies, event isolation, and how the model compares with single-SPA.
- [micro-frontends-design-notes.md](./micro-frontends-design-notes.md) — internal notes for the deferred micro frontend gaps (repo-only; the public page is [micro-frontends.md](./micro-frontends.md)).
