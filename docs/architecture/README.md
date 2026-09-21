# Architecture Documentation

Design rationale and subsystem maps for BlueJS — the "why" behind the code. Guides explain the _how_; these documents are the cross-cutting maps.

## Available Architecture Docs

- [environment.md](./environment.md) — the BlueJS environment & configuration architecture: design pillars (Spring semantics, JS-native structures, fail-loud, replace-not-mutate, no-eval), the precedence doctrine, key tensions and resolutions, security posture, and the P0–P6 roadmap status.
- [micro-frontends.md](./micro-frontends.md) — the micro frontend map: hosted feature contexts + islands, host stack (`HostManager`), lifecycle, shared dependencies, event isolation, and the single-SPA comparison.
