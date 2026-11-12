# AD-61: RouteRegistry — type-safe routes from decorator metadata

**Date:** 2026-09-03
**Status:** Accepted — implemented in `@ndigo/router`.

## Context

Handler parameters were type-safe (`Route<{id: string}>`) but URL generation
was stringly-typed: `router.navigate('#/users/' + userId)`,
`new ModelAndView(new RerouteView(path))`, template concatenation. Typos,
wrong param names, and missing slashes surfaced only at runtime or never. The
`@routeMapping` decorator already stored everything needed in
`Symbol.metadata` (the same record `LinearMetadataHandlerMapping` reads) — the
decision is to materialize a developer-facing, purely additive typed API from
that existing metadata rather than change the decorator.

## Evidence

- `packages/ndigo-router/src/route-registry.ts` — `RouteRegistry` (scans entry
  constructor metadata, builds a nested `RouteDefinition` tree, registers
  itself as an entry).
- `packages/ndigo-router/src/route-definition.ts` — `RouteDefinition<TPattern>`
  with `url()`, `href()`, `redirect()`, `navigate()`, `parse()`, `matches()`
  overloads keyed off `RouteParams<TPattern>`; `RouteParams`/`IsEmptyObject`
  type-level helpers derive `{ id: string }` from `'/users/{id}'`.
- Both born `e164bccb` (2026-09-03).
- The registry reads the same `Symbol.metadata` source as
  `LinearMetadataHandlerMapping`; `RouteDefinition` delegates URL parsing to
  `PathRoute`, redirects to `RerouteView`, navigation to the injected `Router`
  — none of those classes changed.

## Decision

- **D-1** `@routeMapping` remains the single source of truth; `RouteRegistry`
  reads its metadata and is purely additive — no decorator or mapping-stack
  change, no behavior change to existing routes.
- **D-2** Convention-derived keys: `'/'` → `index`, `'/users'` → `users`,
  `'/{id}'` → `byId` (camelCase of the param hint), class+method composition
  via `URLGlobPathMatcher.merge()`, overridable with a `name` option in the
  decorator config.
- **D-3** `RouteDefinition` is a read-only, consumer-facing convenience that
  delegates to `PathRoute`/`RerouteView`/`Router`; multi-segment-per-decorator
  standalone paths (e.g. `@routeMapping('/api/v2/users')` without a class)
  are **not** supported — class+method composition is the intended pattern.

## Consequences

- Type-safe URL generation, redirects, and navigation available across
  controllers and services (`routes.users.byId.url({ id })`,
  `routes.users.byId.redirect({ id })`); typos become compile errors.
- `RouteRegistry` composes with the browser router and the AD-60 Node
  dispatcher pipeline, both consuming the same `@routeMapping` metadata.

## References

- Plan: `docs/plans/2026-09-03_ROUTE_REGISTRY.md`
- Implementation: `packages/ndigo-router/src/route-registry.ts`,
  `packages/ndigo-router/src/route-definition.ts`, commit `e164bccb` (2026-09-03)

## Revisit Trigger

Revisit if a consumer needs standalone multi-segment method paths without a
class-level namespace, or a top-down name-supplied tree (the `name` option
today composes bottom-up from segments). Until then the convention-based
registry stands.
