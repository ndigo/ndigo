# BlueJS Guides

Conceptual and hands-on guides for building applications with BlueJS.
These complement the API reference (generated from JSDoc via `pnpm doc`) and
the decision records (`docs/decisions/`), which explain the _why_; guides
explain the _how_ with runnable patterns grounded in the demo apps.

## Available Guides

1. [01 — Building a Node API](01-building-a-node-api.md) — the primary
   workflow end-to-end: DI bootstrap, configuration + entries,
   controllers, request binding, validation, errors, and shutdown.
   Reference application: `apps/blue-api`.
2. [02 — Request Validation](02-request-validation.md) — how validation fits
   the request pipeline: `@parameters` extractor composition, the
   `validatedBy` / `validatedBody` / `validatedQuery` surface, and
   entity-derived schemas (`insertSchemaForEntity`).
3. [03 — Environment & Configuration](03-environment-configuration.md) — the
   configuration pipeline: property sources + precedence, profiles,
   `@configurationProperties` typed binding, placeholders, customizers,
   and `@environment` validation.
4. [04 — Content, i18n, and Locale](04-i18n-and-content.md) — the message
   source contract, i18next resources, server negotiation
   (`Accept-Language`), EJS `t()`/formatter helpers, island locale
   propagation, and reactive client-side switching (AD-19).
5. [05 — Scheduling](05-scheduling.md) — the `@scheduled` decorator,
   zero-wiring discovery, single-flight/error-isolation semantics,
   per-run OTel spans, and the Node-only guardrails (AD-20).
6. [06 — WebSockets](06-websockets.md) — the `@socketMapping` contract,
   the session registry (`SocketSessionRegistry` bean: rooms, broadcast,
   heartbeat), scheduler-driven room pushes (AD-21), the isomorphic
   client (AD-22), and STOMP destinations/subscriptions/receipts
   (AD-23).

## Reading Order

Start with guide 01; it introduces every concept the other guides and the
package READMEs assume. Use the API reference when you need the full symbol
surface; use the ADs (especially
[AD-7 — Zod validation](../decisions/2026-09-05_AD7_ZOD_VALIDATION.md),
[AD-10 — RFC 9457 error model](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md),
and [AD-19 — Content/i18n](../decisions/2026-09-13_AD19_CONTENT_I18N.md))
for the design rationale behind the patterns shown here.

## Conventions

- Code snippets are written against the current framework surface and mirror
  the demo applications — treat `apps/blue-api` as the canonical reference.
- API names link to nothing inline (the typedoc site is generated); the
  package READMEs list the primary exports per package.
