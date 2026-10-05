# AD-05: `@blue/platform-node` MVP scope — server binding, resolvers, cookie/session, file loading

**Date:** 2026-05-27
**Status:** Accepted — MVP shipped Wave 8 (2026-05-28); scope grew by later
waves (SSE, WebSocket, static files, security) while the exclusions held.

## Context

The framework had a browser platform (`@blue/platform-web`) but nothing for
hybrid (browser + Node) deployment: no server environment binding, no
Node-side request/response argument resolvers, no server-side cookie/session
adapters, no file-system resource loading. The MVP had to be the smallest
viable enabler without absorbing future work (Web Component SSR, database).

## Evidence

- Package born 2026-05-28 (`c812362c`, "Wave 8"): `NodeRequest`,
  `NodeEnvironment`, `FileSystemResourceLoader`, six argument resolvers
  (query, path, header, body, cookie, session), `configureArgumentResolvers`,
  `NodeAutoConfiguration`; demo gate `apps/blue-demo-node`.
- Today's package confirms the exclusions held: no database code
  (`@blue/orm`/`@blue/orm-drizzle` are separate packages), view rendering
  lives in view packages (`blue-view-ejs`, view targets
  `node-view-target.ts`), while the platform node surface grew:
  `node-http-server-adapter.ts`, session/cookie adapters
  (`session-cookie.ts`, `node-session-interceptor.ts`), static resources
  (`static-resource-handler.ts`, `file-system-resource-loader.ts`), SSE,
  multipart, security headers, rate limiting, trusted proxy, WebSocket
  session registry (`packages/blue-platform-node/src/`).

## Decision

- **MVP scope**: server environment binding, Node-side request/response
  argument resolvers, server-side cookie/session adapters, file-system
  resource loader.
- **Excluded from the node platform**: server-side rendering of Web
  Components (deferred to future view adapters) and database concerns
  (`@blue/orm` owns them).

## Consequences

- Hybrid deployment unblocked in one wave; the demo gate ran on a real
  Node server with per-source argument resolvers.
- The exclusion discipline held through 1.0: `blue-platform-node` stayed a
  server/transport package while ORM and view rendering developed in their
  own packages (ORM completion 2026-09-26 AD-30/AD-31; EJS/island views
  AD-19, AD-28).
- "Mirror of `@blue/platform-web`" symmetry: the two platform packages own
  platform-native concerns; isomorphic logic stays in core packages (AD-04).

## References

- Roadmap: `docs/plans/2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md` (AD-05)
- MVP commit: `c812362c` (2026-05-28)
- Package today: `packages/blue-platform-node/src/`
- Symmetry: [AD-04](2026-05-27_AD04_BROWSER_BOUNDARY_PLATFORM_WEB.md)

## Revisit Trigger

Revisit if Node-only behavior needs a home that is not transport/server
shaped (e.g. a Node-specific scheduler store) — precedent: scheduling
lives in `@blue/scheduler`, persistence in `@blue/orm*`, keeping the
platform surface lean.
