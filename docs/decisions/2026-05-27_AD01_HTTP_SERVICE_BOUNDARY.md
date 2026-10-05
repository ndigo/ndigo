# AD-01: `@blue/http` vs `@blue/service` boundary — transport concerns live in HTTP, service stays a domain façade

**Date:** 2026-05-27
**Status:** Accepted — ratified with the Wave roadmap; boundary implemented
(interceptor re-architecture 2026-06-24) and finalized by the AD-08 service
rebase (2026-09-05).

## Context

Before 1.0, cross-cutting HTTP behavior lived in two places: `@blue/http`
had a mature interceptor + transform pipeline, while `@blue/service`
carried the legacy service interceptors (`header`, `error`, `cache`,
`retryOnError`, `offline`, `status`, `appReset`) — HTTP cross-cutting
concerns duplicated as service-layer business logic. The boundary between
the two packages was undocumented.

## Evidence

- `@blue/http` interceptor pipeline today: `transform`, `timeout`, `retry`,
  `cache`, `response-type`, `response-code`, `data-parameter`,
  `if-modified`, `trace-header`, `header`, `content-type`, `status`,
  `error-normalization`, `not-ok`, `response-class`, `app-reset`
  (`packages/blue-http/src/interceptors/`).
- `@blue/service` is a thin façade: `service-registry.ts`,
  `request-id-correlation.ts`, `telemetry-hooks.ts`, `service-client.ts`,
  `service-decorators.ts`, `server-sent-events.ts` — registry, telemetry,
  correlation, client generation; no transport logic
  (`packages/blue-service/src/`).
- AD-08 (2026-09-05) completed the boundary: service interceptor contracts
  rebased onto `@blue/http` (commit `ff86ed01`-era wave).
- Interceptor set reorganized in the 2026-06-24 re-architecture
  (`148c92e9`).

## Decision

- **`@blue/http` owns transport cross-cutting concerns** as interceptors:
  retry, error normalization, cache, status/not-ok handling, header
  injection, trace headers, app-reset coordination.
- **`@blue/service` is a thin domain-aware façade**: service registry,
  service-call telemetry, request-id correlation, app-reset coordination,
  client generation. No HTTP policy lives here.
- **Refinements recorded on the evidence of implementation:**
    - Offline _detection_ is a browser state concern, not a transport one —
      it lives in `@blue/platform-web`
      (`packages/blue-platform-web/src/online-reconnect-trigger.ts`), and the
      HTTP layer consumes the resulting status (AD-04 boundary).
    - CSRF is server-side request protection — `CsrfInterceptor` lives in
      `@blue/platform-node` (`packages/blue-platform-node/src/csrf-interceptor.ts`),
      not in the isomorphic transport.

## Consequences

- Client-side policy is opt-in per interceptor and packageable; service
  consumers get it without service API changes.
- No duplicated interceptors remain; AD-08 made `@blue/http` the single
  home for transport policy.
- Future transport concerns (rate limiting, resilience) compose as
  interceptors (`@rateLimit`, AD-33; `@blue/resilience` composes at the
  call boundary, AD-43) without touching `@blue/service`.

## References

- Roadmap: `docs/plans/2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md` (AD-01)
- Interceptor pipeline: `packages/blue-http/src/interceptors/`
- Service façade: `packages/blue-service/src/`
- Service rebase: [AD-08](2026-09-05_AD08_BLUE_SERVICE_REBASE.md)
- Offline trigger: `packages/blue-platform-web/src/online-reconnect-trigger.ts`

## Revisit Trigger

Revisit if a transport concern cannot be expressed as an interceptor
(streaming bodies, protocol-level state) — the seam would then move to
`@blue/http`'s core rather than `@blue/service`.
