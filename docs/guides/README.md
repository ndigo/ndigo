# BlueJS Guides

Conceptual and hands-on guides for building applications with BlueJS.
These complement the API reference (generated from JSDoc via `pnpm doc`) and
the decision records (`docs/decisions/`), which explain the *why*; guides
explain the *how* with runnable patterns grounded in the demo apps.

## Available Guides

1. [01 — Building a Node API](01-building-a-node-api.md) — the primary
   workflow end-to-end: DI bootstrap, configuration + entries,
   controllers, request binding, validation, errors, and shutdown.
   Reference application: `apps/blue-api`.
2. [02 — Request Validation](02-request-validation.md) — how validation fits
   the request pipeline: `@routeParams` extractor composition, the
   `validatedBy` / `validatedBody` / `validatedQuery` surface, and
   entity-derived schemas (`insertSchemaForEntity`).

## Reading Order

Start with guide 01; it introduces every concept the other guides and the
package READMEs assume. Use the API reference when you need the full symbol
surface; use the ADs (especially
[AD-7 — Zod validation](../decisions/2026-09-05_AD7_ZOD_VALIDATION.md) and
[AD-10 — RFC 9457 error model](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md))
for the design rationale behind the patterns shown here.

## Conventions

- Code snippets are written against the current framework surface and mirror
  the demo applications — treat `apps/blue-api` as the canonical reference.
- API names link to nothing inline (the typedoc site is generated); the
  package READMEs list the primary exports per package.