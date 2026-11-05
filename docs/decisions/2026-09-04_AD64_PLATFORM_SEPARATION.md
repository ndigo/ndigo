# AD-64: Platform separation — isomorphic packages stay platform-free

**Date:** 2026-09-04
**Status:** Accepted — implemented (the plan was "pending confirmation"; it
landed through implementation). Isomorphic packages are platform-free;
browser/node code lives in dedicated `web`/`node` packages, OTel-style.

## Context

The guiding principle — isomorphic packages must not import `node:` or DOM
globals, and all browser/node-conditional code belongs in
`@ndigo/platform-web`/`@ndigo/platform-node` — was being violated by shortcuts
that made classes import "platforms" they didn't need. The flagship offender:
`@ndigo/telemetry`'s index pulled in both `@ndigo/platform-node` and
`@ndigo/platform-web` (via instrumentations), so anything importing telemetry
transitively dragged both platforms. The plan also flagged `@ndigo/boot`
(re-exporting DOM-coupled `web-auto-configuration`), `BrowserDispatcher`
(a browser-named class in isomorphic `@ndigo/dispatcher`), and `@ndigo/telemetry`
as a single package serving all three tiers. This enforces the AD-04 boundary
doctrine structurally. The plan's stated status was "pending confirmation";
the split landed through implementation rather than a separate ratification.

## Evidence

- OTel-style telemetry split, born in one commit: `383904c7` (2026-09-05,
  "telemetry: split into @ndigo/telemetry (API core) + node/web platform
  packages"). Today: `packages/ndigo-telemetry` (isomorphic core),
  `packages/ndigo-telemetry-node` (NodeSDK config, OTLP, and the
  `http-server`/`http-response-view-target`/`websocket-server`
  instrumentations), `packages/ndigo-telemetry-web` (browser config/router
  instrumentation).
- Split auth family already present: `packages/ndigo-auth-core`,
  `ndigo-auth-server`, `ndigo-auth-client` (auth tri-split predates this ADR —
  born `148c92e9`, 2026-06-24 — and is consistent with the doctrine).
- Platform packages kept separate: `@ndigo/platform-web` and
  `@ndigo/platform-node`, each depending only on isomorphic packages.
- Isomorphic packages verified platform-free in the plan's catalog (no
  `node:` imports, no DOM globals); `ndigo-platform-web`/`ndigo-platform-node`
  have no direct cross-import violations.
- `@ndigo/boot` remained node-couplable historically (the AD-63 workaround
  documented boot's DOM re-export); the separation target makes boot
  node-safe and enables `NodeAutoConfiguration` auto-registration — which
  AD-60's plan §6.2 records landing after the package-separation refactor.

## Decision

- **D-1** A package is classified by what it imports, not its name; isomorphic
  packages may depend only on other isomorphic packages.
- **D-2** Telemetry adopts the OTel shape: `@ndigo/telemetry` keeps the
  isomorphic aggregator/`@counted`/logger/severity; `@ndigo/telemetry-node`
  and `@ndigo/telemetry-web` hold SDK-config + platform instrumentations.
- **D-3** Platform-specific code lives in dedicated `web`/`node` packages
  (platform packages, telemetry-node/web, auth-server/client), keeping
  browser and node bundles free of each other's globals.

## Rejected/Deferred

- **Subpath exports** inside one `@ndigo/telemetry` package (`@ndigo/telemetry/node`,
  `@ndigo/telemetry/web`) were the plan's leaner alternative; the realized
  direction chose sibling packages (OTel-style), as evidenced by
  `383904c7`. `BrowserDispatcher`'s extraction into an `AbstractDispatcher`
  base (Phase 1 item 2) is follow-on work, not yet ratified here.

## Consequences

- Importing isomorphic telemetry no longer drags Node or browser SDK code
  into the other platform; applications pull only the platform package they
  run on.
- The clean split is the enabling constraint for later platform-scoped work:
  AD-60's `NodeAutoConfiguration` auto-registration and AD-63's node-pure
  `@ndigo/test` both depend on it.
- AD-04's lint rule (`no-browser-globals-in-isomorphic`) enforces the same
  boundary at the file level; this ADR enforces it at the package-dependency
  level.

## References

- Plan: `docs/plans/2026-09-04_PACKAGE_SEPARATION.md`
- Implementation: `packages/ndigo-telemetry/`, `ndigo-telemetry-node/`,
  `ndigo-telemetry-web/`, `ndigo-auth-core|server|client/`,
  `ndigo-platform-web/`, `ndigo-platform-node/`, commit `383904c7` (2026-09-05)
- Related: [AD-04](2026-05-27_AD04_BROWSER_BOUNDARY_PLATFORM_WEB.md)

## Revisit Trigger

Revisit if a web/node-shared capability (e.g. `BrowserDispatcher`→
`AbstractDispatcher`, or a new engine that serves both platforms) requires a
new isomorphic seam, and when the plan's Phase 1 `AbstractDispatcher`
extraction is pursued. Until then, split packages are the enforcement
mechanism.
