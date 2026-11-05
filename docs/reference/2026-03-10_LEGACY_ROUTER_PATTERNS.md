# Legacy Router Patterns (ndigo)

> **⚠️ ARCHIVED** — patterns recorded from the removed legacy AMD router
> (`old-router.legacy.js`), kept for history. The living routing surface is
> `@ndigo/router` ([AD-61](../decisions/2026-09-03_AD61_ROUTE_REGISTRY.md)).

This document captures notable patterns from the legacy AMD router implementation (`old-router.legacy.js`) before removal.

## Preserved / Active Patterns

- **Matrix + query parameter support**
    - Preserved in `PathRoute` via `MatrixString` and `QueryString` parsing.
- **Navigation interceptor chain**
    - Preserved via `RouterInterceptor` + `RouterExecutionChain`.
- **Route access tiers (public/private)**
    - Preserved via `RouteAccess` in `HashRouter`.
- **Route source tracking (internal/external)**
    - Preserved via `RouteSource` in `HashRouter`.
- **Route transaction concept (rollback/commit)**
    - Preserved and modernized via `transaction-manager.ts`.

## Deferred Patterns

- **Named history entries** (for example: `site`, `redirect`)
    - Deferred until `Site`/`SiteBuilder` lifecycle is implemented in `@ndigo/boot`.
- **Canonical-route analytics emission**
    - Deferred until explicit `@ndigo/telemetry` router integration.
- **Context-tree broadcast routing model**
    - Deferred. Current design uses dispatcher handler mappings as the primary matching mechanism.

## Why This Was Archived

The legacy file used AMD/CommonJS-era patterns and was not part of the ESM public API. Keeping this summary preserves architectural intent while removing dead runtime code.
