# BlueJS Guides

Conceptual and hands-on guides for building applications with BlueJS. These complement the API reference (generated from JSDoc via `pnpm doc`); they explain the _how_ with runnable patterns grounded in the demo apps.

## Available Guides

1. [01 — Building a Node API](01-building-a-node-api.md) — the primary workflow end-to-end: DI bootstrap, configuration + entries, controllers, request binding, validation, errors, and shutdown. Reference application: `apps/blue-api`.
2. [02 — Request Validation](02-request-validation.md) — how validation fits the request pipeline: `@parameters` extractor composition, the `validatedBy` / `validatedBody` / `validatedQuery` surface, and entity-derived schemas (`insertSchemaForEntity`).
3. [03 — Environment & Configuration](03-environment-configuration.md) — the configuration pipeline: property sources + precedence, profiles, `@configurationProperties` typed binding, placeholders, customizers, `@environment` validation, live rebind (`@refreshScope`), at-rest secrets (`{cipher:...}` + `BLUE_SECRET_KEY`), and the remote config source (`configServer`, poll → refresh → rebind).
4. [04 — Content, i18n, and Locale](04-i18n-and-content.md) — the message source contract, i18next resources, server negotiation (`Accept-Language`), EJS `t()`/formatter helpers, and island locale propagation.
5. [05 — Scheduling](05-scheduling.md) — the `@scheduled` decorator, zero-wiring discovery, single-flight/error-isolation semantics, per-run OTel spans, and the Node-only guardrails.
6. [06 — WebSockets](06-websockets.md) — the `@socketMapping` contract, the session registry (`SocketSessionRegistry` bean: rooms, broadcast, heartbeat), the isomorphic client, and STOMP destinations/subscriptions/receipts.
7. [07 — Caching](07-caching.md) — the `@blue/cache` store (TTL + LRU/FIFO eviction), the `@cached` decorator for server methods, and `memoize` for client functions — the same semantics on both sides.
8. [08 — Multipart & File Upload](08-multipart-and-file-upload.md) — server-side acceptance of `multipart/form-data`: the `MultipartFile` contract, `fileValue()` binding, threshold-to-disk streaming, limits → 413, and filename-safety.
9. [09 — Argument Binding](09-argument-binding.md) — the handler binding surface: per-source extractors, whole-source data binding (`dataBinderValue` — the form/model story), `requestPart` JSON parts, matrix parity, and missing-value → 400.
10. [10 — Telemetry](10-telemetry.md) — logging, the OTel span/trace surface, metric counters, and the Node/browser wiring.
11. [11 — Authentication & Sessions](11-authentication-and-sessions.md) — credentials + session storage, the auth decorators, and the admin-store workflow.
12. [12 — Package Documentation](12-package-documentation.md) — the documentation standard every package must meet: README template, metadata fields, generated API references (`pnpm doc:api`), and CI freshness enforcement.

## Reading Order

Start with guide 01; it introduces every concept the other guides and the package READMEs assume. Use the API reference when you need the full symbol surface.

## Conventions

- Code snippets are written against the current framework surface and mirror the demo applications — treat `apps/blue-api` as the canonical reference.
- API names link to nothing inline; the per-package TypeDoc references are
  generated (`pnpm doc:api` → `packages/<name>/doc/api/`; index
  `doc/README.md`) and the package READMEs link them.
