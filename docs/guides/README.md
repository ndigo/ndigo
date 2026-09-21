# BlueJS Guides

Conceptual and hands-on guides for building applications with BlueJS. These complement the API reference (generated from JSDoc via `pnpm doc`); they explain the _how_ with runnable patterns grounded in the demo apps.

## Available Guides

1. [01 — Building a Node API](01-building-a-node-api.md) — the primary workflow end-to-end: DI bootstrap, configuration + entries, controllers, request binding, validation, errors, and shutdown. Reference application: `apps/blue-api`.
2. [02 — Request Validation](02-request-validation.md) — how validation fits the request pipeline: `@parameters` extractor composition, the `validatedBy` / `validatedBody` / `validatedQuery` surface, and entity-derived schemas (`insertSchemaForEntity`).
3. [03 — Environment & Configuration](03-environment-configuration.md) — the configuration pipeline: property sources + precedence, profiles, `@configurationProperties` typed binding, placeholders, customizers, and `@environment` validation.
4. [04 — Content, i18n, and Locale](04-i18n-and-content.md) — the message source contract, i18next resources, server negotiation (`Accept-Language`), EJS `t()`/formatter helpers, and island locale propagation.
5. [05 — Scheduling](05-scheduling.md) — the `@scheduled` decorator, zero-wiring discovery, single-flight/error-isolation semantics, per-run OTel spans, and the Node-only guardrails.
6. [06 — WebSockets](06-websockets.md) — the `@socketMapping` contract, the session registry (`SocketSessionRegistry` bean: rooms, broadcast, heartbeat), the isomorphic client, and STOMP destinations/subscriptions/receipts.
7. [07 — Caching](07-caching.md) — the `@blue/cache` store (TTL + LRU/FIFO eviction), the `@cached` decorator for server methods, and `memoize` for client functions — the same semantics on both sides.

## Reading Order

Start with guide 01; it introduces every concept the other guides and the package READMEs assume. Use the API reference when you need the full symbol surface.

## Conventions

- Code snippets are written against the current framework surface and mirror the demo applications — treat `apps/blue-api` as the canonical reference.
- API names link to nothing inline (the typedoc site is generated); the package READMEs list the primary exports per package.
