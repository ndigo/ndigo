# AD-25: Security headers — wrap Helmet, default-on in `@ndigo/platform-node`

**Date:** 2026-09-18
**Status:** Superseded in part — D-3's CSP `connect-src` default superseded by SEC-4 (2026-09-29)
2026-09-18 code review; still current, except D-3's CSP `connect-src`
default, superseded by SEC-4 (2026-09-29) — see the Update note).

## Context

SEC-6/server hardening: the Node server sent no security headers — no CSP,
no HSTS, no frame/referrer/sniffing protections — on any default app. The
only header was `X-Content-Type-Options: nosniff` on the static-file
controller. The Framework Gap Analysis named the fix shape:
interceptor-shaped, fitting the `ndigo-platform-node` interceptor +
auto-configuration machinery.

## Evidence

- `CORSInterceptor`/`CsrfInterceptor` establish the
  `RouteHandlerInterceptor` idiom: `preHandle(route, handler)` extracts the
  `ServerResponse` from `route.attributes[NODE_RESPONSE_ATTRIBUTE]`,
  writes headers, returns `PreHandleOutcome`; the fallback chain runs
  interceptors for unmatched routes too, so headers cover 404/error paths
  when written pre-finalize.
- Helmet 8.3.0: zero runtime dependencies, per-header middleware exports,
  TypeScript types built in, options validated at middleware construction —
  the wrap-don't-reimplement doctrine (croner/ws/jose precedent).
- Demo pages use external scripts only; `ndigo-api` serves the STOMP demo
  over `ws://` — the CSP default must not break it.
- Implementation live: `packages/ndigo-platform-node/src/security-headers-interceptor.ts`,
  default prepended in `NodeAutoConfiguration.handlerMapping()`, spec
  coverage in `packages/ndigo-platform-node/test/security-headers.spec.ts`;
  commits `4798166b`, `1333a8cb`, `68b2c3a4` reviewed 2026-09-18.

## Decision

- **D-1 — Wrap Helmet behind `SecurityHeadersInterceptor`**
  (`RouteHandlerInterceptor` in `ndigo-platform-node`). Constructor builds
  the per-header Helmet middlewares (construction-time validation — unknown
  options throw at bean startup, not first request); `preHandle` invokes
  each against the route's `ServerResponse`, skipping when absent or
  `headersSent` (e.g. socket upgrades). Never denies — returns `true`.
- **D-2 — Default-on via `NodeAutoConfiguration`**: `handlerMapping()`
  prepends a default `SecurityHeadersInterceptor` (runs before CORS
  preflight short-circuit and CSRF denial, so every finalized response
  carries headers). Escape hatches in granularity order: per-header
  `false`, whole-interceptor disable, replace the `handlerMapping` bean
  (documented). App-level `mapping.interceptors` sets compose; `setHeader`
  is last-write-wins, Helmet config is the single source.
- **D-3 — Default set = Helmet defaults minus COEP, plus WebSocket-aware
  CSP**: CSP default directives with `connect-src 'self' ws: wss:` (the
  framework ships a WebSocket server), HSTS, `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options: nosniff`, Referrer-Policy `no-referrer`, CORP,
  COOP, Origin-Agent-Cluster, DNS-prefetch/download/xss legacy controls,
  `X-Powered-By` removed. Opt-in only (the breaking ones): COEP,
  Permissions-Policy.
- **D-4 — Options mirror Helmet's surface**:
  `SecurityHeadersInterceptorOptions` ≈ Helmet middleware-option keys with
  `enabled: false`; each header accepts `false` or its option shape (CSP
  `useDefaults` + directive overrides).
- **D-5 — Non-goals (v1)**: no CSP nonce/report-only integration, no HSTS
  preload submission, no proxy-scheme awareness (`X-Forwarded-Proto`
  deferred; AD-37 closed the client-IP half), no rate limiting (next wave),
  no header helpers for SSE/WebSocket handshakes (CSP does not govern them
  server-side).

## Consequences

- Every default app response carries the header set; unmatched
  adapter-short-circuited 404/405s are documented exempt (fixed JSON
  problem documents, no HTML/reflection; revisit if HTML error pages ship).
- CSP breaks inline/third-party content by default → per-header escape
  hatches and a documented `unsafe-inline` posture (never the default).
- Header duplication with hand-rolled app sets is an ordering contract:
  the interceptor runs first, app overrides land later (last-write-wins).
- HSTS behind a TLS-terminating proxy on plain HTTP is ignored by browsers
  per spec — documented, proxy-scheme awareness deferred.

## References

- Plan: `docs/plans/2026-09-18_SECURITY_HEADERS.md`
- Implementation: `packages/ndigo-platform-node/src/security-headers-interceptor.ts`,
  `packages/ndigo-platform-node/test/security-headers.spec.ts`
- Review: `docs/plans/2026-09-18_CODE_REVIEW_AND_MITIGATION.md` (§2.3,
  D1 `connect-src` note)
- Gap analysis row: `docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` (SEC-6)
- Trusted proxy (related deferral): [AD-37](2026-09-28_AD37_TRUSTED_PROXY.md)

## Update (2026-09-29, SEC-4)

- D-3's CSP default was hardened from `connect-src 'self' ws: wss:` to
  `connect-src 'self'` (SEC-4, [2026-09-29 review](../plans/2026-09-29_CODE_REVIEW_AND_MITIGATION.md);
  `security-headers-interceptor.ts` `DEFAULT_CONNECT_SRC`). Under CSP3
  `'self'` covers WebSocket (`ws:`/`wss:`) streams to the same host-origin,
  so the framework's co-located socket server keeps working; a socket server
  on a different host widens `connect-src` explicitly (`wss://<host>`) —
  bare `ws:`/`wss:` are never admissions. The D-3 text above is the
  historical 2026-09-18 default, kept as the record of that decision.
