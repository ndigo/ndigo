# Architecture Documentation

Design rationale and subsystem maps for Ndigo — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [security.md](./security.md) — the security posture: trust boundaries (browser → proxy → node → backends), the defense-in-depth layer map (headers, rate limiting, CSRF/CORS, sessions, auth, validation, error contract, secrets), and the resolved tensions (per-decision records cited).
- [lifecycle-and-ownership.md](./lifecycle-and-ownership.md) — the async/resource doctrine: async-by-default, owned-vs-borrowed clients, explicit fail-loud initialization, the stop/drain/close ordering, and `Closeable` bridging.
- [environment.md](./environment.md) — the Ndigo environment & configuration architecture: design pillars (ported semantics, JS-native structures, fail-loud, replace-not-mutate, no-eval), the precedence doctrine, key tensions and resolutions, security posture, and the P0–P6 roadmap status.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature contexts + islands, host stack (`HostManager`), lifecycle, shared dependencies, event isolation, and the single-SPA comparison.
