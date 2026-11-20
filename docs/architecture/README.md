# Architecture Documentation

Design rationale and subsystem maps for Ndigo — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [security.md](./security.md) — the security posture: trust boundaries (browser → proxy → node → backends), the defense-in-depth layer map (headers, rate limiting, CSRF/CORS, sessions, auth, validation, error contract, secrets), and the resolved tensions.
- [annotation-and-transformer-model.md](./annotation-and-transformer-model.md) — the declaration and execution model: annotations (metadata only), advice (context-composed wrappers), member transformers (definition-time replacement), the three executors, and the decorator inventory by mechanism.
- [lifecycle-and-ownership.md](./lifecycle-and-ownership.md) — the async/resource discipline: async-by-default, owned-vs-borrowed clients, explicit fail-loud initialization, the stop/drain/close ordering, and `Destroyable` bridging.
- [environment.md](./environment.md) — the environment and configuration architecture: design principles, the precedence chain, key tensions and resolutions, security posture, and implementation status.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature contexts + islands, host stack (`HostManager`), lifecycle, shared dependencies, event isolation, and the single-SPA comparison.
