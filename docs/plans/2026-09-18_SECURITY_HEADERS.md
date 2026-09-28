# 2026-09-18 Security Headers

**Status:** Proposed — approved shape (wrap Helmet, default-on); design
decision record pending (AD-25); implementation sequenced below.
**Scope:** `SecurityHeadersInterceptor` in `blue-platform-node` (Helmet-wrap,
`RouteHandlerInterceptor`), default-on wiring in `NodeAutoConfiguration`,
demo assertions, docs + audit status refresh. Rate limiting stays a separate
wave (seq #3 half 2 — client-IP trust landed separately, AD-37 2026-09-28).
**Companion docs:** [Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§2.1 ("Security headers" row), [Repository Remediation](../plans/2026-09-04_REPOSITORY_REMEDIATION.md)
SEC-6 ("security-header policy" item), [AD-10](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md)
(error-model header precedent)

---

## 1. Problem

SEC-6/server hardening: the Node server sends no security headers — no CSP,
no HSTS, no frame/referrer/sniffing protections — on any default app. The
only header today is `X-Content-Type-Options: nosniff` on the static-file
controller (and CORS/CSRF machinery, which is a different surface). The gap
analysis names the fix shape: "interceptor-shaped, fit the
`blue-platform-node` interceptor + auto-configuration machinery (SEC-6)."

Owner decisions this wave: **wrap Helmet** (the industry standard, v8.3.0,
zero dependencies, TypeScript types built in — the wrap-don't-reimplement
doctrine used for croner/ws/jose) and **default-on** (headers are the one
hardening item safe to ship enabled; management-endpoints precedent).

## 2. Current state (verified 2026-09-18)

- `CORSInterceptor`/`CsrfInterceptor` (`blue-platform-node/src/`): the
  `RouteHandlerInterceptor` pattern — `preHandle(route, handler)` extracts
  the `ServerResponse` from `route.attributes[NODE_RESPONSE_ATTRIBUTE]`,
  writes headers, returns `PreHandleOutcome`; apps push onto
  `mapping.interceptors`; the fallback chain runs interceptors for unmatched
  routes too (adapter), so headers cover 404s/errors when written pre-finalize.
- `NodeAutoConfiguration.handlerMapping()`: `new RadixMetadataHandlerMapping()`
  — nothing default-registered today; the mapping bean is the assembly point.
- Demo pages use external scripts only (`/static/client.js`, `src/index.ts`)
  — no inline JS; `blue-api` serves the STOMP demo over `ws://` (CSP
  `connect-src` must allow it; `'self'`-matching-WebSocket is
  browser-divergent, so `ws:`/`wss:` are explicit).
- Helmet (npm) 8.3.0: zero deps, per-header middlewares exported
  (`helmet.contentSecurityPolicy` etc.), plain `(req, res, next)` — callable
  without Express; options validated at middleware construction.

## 3. Decisions

### D-1 — Wrap Helmet behind `SecurityHeadersInterceptor` (platform-node)

A `RouteHandlerInterceptor` whose constructor builds the per-header Helmet
middlewares (construction-time validation — unknown options throw, Helmet's
own behavior) and whose `preHandle` invokes each `(req, res, noop)` against
the route's `ServerResponse` (CORS-interceptor idiom), skipping when absent
or `headersSent` (e.g. socket upgrades). Returns `true` — this interceptor
never denies. `postHandle`/`completeHandle` are no-ops per the contract.

### D-2 — Default-on via `NodeAutoConfiguration`

`handlerMapping()` prepends a default `SecurityHeadersInterceptor` (security
headers run before CORS preflight short-circuit and CSRF denial, so every
finalized response carries them). Escape hatches, in order of granularity:
per-header `false` in the options; whole-interceptor disable; replace the
`handlerMapping` bean (documented) for full control. Apps additionally
reaching for `mapping.interceptors` (CORS/CSRF pattern) compose with the
default — header-writing is idempotent with app-level duplicate sets
(`setHeader` overwrites; Helmet's per-header config is the single source).

### D-3 — Default set: Helmet's defaults + WebSocket-aware CSP

On by default (Helmet parity, minus COEP):

| Header                              | Default                                                                                                                                                                                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`           | Helmet default directives (`default-src 'self'`, `object-src 'none'`, `script-src 'self'`, `frame-ancestors 'self'`, `upgrade-insecure-requests`, …) **with `connect-src 'self' ws: wss:`** — the framework ships a WebSocket server, so the default must not break it |
| `Strict-Transport-Security`         | `max-age=31536000; includeSubDomains` (ignored by browsers over plain HTTP; proxy-caveat documented — client-IP trust landed in AD-37, scheme awareness still deferred)                                                                                                                                 |
| `X-Frame-Options`                   | `SAMEORIGIN` (paired with `frame-ancestors` in CSP for non-CSP browsers)                                                                                                                                                                                               |
| `X-Content-Type-Options`            | `nosniff`                                                                                                                                                                                                                                                              |
| `Referrer-Policy`                   | `no-referrer`                                                                                                                                                                                                                                                          |
| `Cross-Origin-Resource-Policy`      | `same-origin`                                                                                                                                                                                                                                                          |
| `Cross-Origin-Opener-Policy`        | `same-origin`                                                                                                                                                                                                                                                          |
| `Origin-Agent-Cluster`              | `?1`                                                                                                                                                                                                                                                                   |
| `X-DNS-Prefetch-Control`            | `off`                                                                                                                                                                                                                                                                  |
| `X-Download-Options`                | `noopen`                                                                                                                                                                                                                                                               |
| `X-Permitted-Cross-Domain-Policies` | `none`                                                                                                                                                                                                                                                                 |
| `X-XSS-Protection`                  | `0` (disables the buggy legacy auditor)                                                                                                                                                                                                                                |
| `X-Powered-By`                      | removed if present (Node does not emit one; harmless parity)                                                                                                                                                                                                           |

Opt-in only (Helmet parity — both are the breaking ones): `Cross-Origin-Embedder-Policy`
(requires CORP on every cross-origin resource), `Permissions-Policy`.

### D-4 — Options mirror Helmet's surface

`SecurityHeadersInterceptorOptions` ≈ Helmet's middleware-option keys with a
top-level `enabled: false` switch; each header accepts `false` to disable and
the header's own option shape (e.g. CSP `{ useDefaults: true, directives: {…} }`,
HSTS `{ maxAge, includeSubDomains, preload }`). Constructor validates —
TypeError on malformed options, exactly Helmet's behavior, moved to bean
startup instead of first request.

### D-5 — Non-goals (v1)

No CSP nonce/report-only integration (escape hatches only; `unsafe-inline`
discouraged and documented), no HSTS preload-list submission, no
proxy-scheme awareness (`X-Forwarded-Proto` remains deferred; AD-37 closed the client-IP half only), no
rate limiting (next wave), no header helpers for SSE/WebSocket handshakes
(CSP does not govern them server-side).

## 4. Architecture

| Piece                                                              | Home                                                              | Notes                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| `SecurityHeadersInterceptor` + `SecurityHeadersInterceptorOptions` | `packages/blue-platform-node/src/security-headers-interceptor.ts` | Helmet middleware list built in ctor; `preHandle` per CORS idiom |
| Default instance                                                   | `NodeAutoConfiguration.handlerMapping()`                          | prepended to `mapping.interceptors`                              |
| Export                                                             | `blue-platform-node` index                                        | manual use + custom wiring                                       |
| Dependency                                                         | `helmet@^8.3.0` in `blue-platform-node` `dependencies`            | zero-dep lib (like `ws`)                                         |

### API sketch

```ts
import { SecurityHeadersInterceptor } from '@blue/platform-node';

// default-on: NodeAutoConfiguration provides this exact instance
new SecurityHeadersInterceptor(); // full default set

new SecurityHeadersInterceptor({
    contentSecurityPolicy: false, // per-header escape
    strictTransportSecurity: { preload: true },
    contentSecurityPolicy: { directives: { 'connect-src': ["'self'", 'ws:', 'wss:'] } }, // merged (useDefaults)
});
```

## 5. Risks

- **CSP breaks an app's inline/third-party content** → per-header `false`,
  directive overrides, documented `unsafe-inline` posture (never the
  default). Helmet defaults are the market-tested baseline.
- **Adapter-short-circuited 404/405s are exempt** — unmatched non-OPTIONS
  requests finalize in the adapter before the interceptor chain runs
  (verified 2026-09-18); those responses carry no security headers. They are
  fixed JSON problem documents (no HTML/reflection); revisit if HTML error
  pages ship.
- **HSTS behind a TLS-terminating proxy on plain HTTP** → browsers ignore
  HSTS over insecure connections by spec; the X-Forwarded-Proto trust story
  remains deferred (AD-37 closed client-IP trust only); documented.
- **Header duplication with a hand-rolled app set** → `setHeader` is
  last-write-wins; the interceptor runs first, app overrides land later in
  the chain — an ordering contract to document, not a bug.
- **MockHTTP header fidelity** (blue-test) → assertion specs must confirm
  headers surface through the in-memory response before trusting them.

## 6. Sequencing

**Wave 1 — interceptor + unit specs.** Add `helmet` dep; implement the
interceptor; spec: full default set on a stub `ServerResponse`, per-header
disable, option override (CSP connect-src merge), `headersSent`/absent
skip, construction-time TypeError. Gates: package vitest + `tsc -b`.

**Wave 2 — default-on + demo + docs.** Prepend in `NodeAutoConfiguration`;
blue-api bootstrap spec asserts the header set on a live dispatch (and the
STOMP demo still connects); AD-25; gap-analysis row → implemented (SEC-6
header item); guide-01 "Security headers" subsection; plan status; plans
README. Gates: `pnpm lint`, `pnpm format:check`, changed-package vitest +
`tsc -b`, `graft build`.

## 7. Verification

- Default set: every D-3 header present with its exact value on a dispatched
  response (matched routes; adapter-short-circuited 404/405s documented
  exempt).
- CSP contains `connect-src 'self' ws: wss:`; directive override merges
  (useDefaults).
- Disabled/escaped configs emit no CSP etc.
- Socket upgrade and SSE paths still function (headers absent → skip path).
- Repo gates: `pnpm lint` (`--deny-warnings`), `pnpm format:check`,
  package `tsc -b`, package `vitest run`.
