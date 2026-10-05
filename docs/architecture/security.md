# Security Architecture

The security posture of BlueJS as a framework: what the platform defends,
where the trust boundaries sit, and the defense-in-depth map tying the
per-decision records together. Per-decision rationale lives in the ADRs
cited throughout; this document is the cross-cutting map.

## Pillars

1. **Fail closed, fail loud.** Auth denies by default (`@authenticated`
   without a principal is a denial, not a pass), backend faults reject
   rather than degrade to memory or empty results, and misconfiguration
   (malformed trusted-proxy sets, bad cipher markers) fails at startup or
   first use — never silently.
2. **Minimal external trust.** The browser is untrusted; every proxy must
   be _listed_ to influence client identity; secrets never ship in
   defaults; backends connect only to explicit URLs.
3. **No encryption/auth in the app layer.** Cryptography is framework-owned
   (`jose`, `node:crypto`, scrypt) behind small contracts; the app
   assembles, never reinvents.
4. **Defense in depth, not single gates.** Headers + rate limiting + CSRF
    - auth + validation + the error contract each cover a different layer;
      no one mechanism is the boundary.

## Trust boundaries

```
Browser (untrusted) ──HTTPS──▶ TLS-terminating proxy ──▶ Node server
                                                          │  headers (AD-25)
                                                          │  rate limit (AD-33)
                                                          │  CSRF/CORS
                                                          │  trusted-proxy resolution (AD-37)
                                                          ├─▶ dispatcher ──▶ validation (AD-07, RFC 9457)
                                                          └─▶ auth (AD-33/56) ──▶ session store ──▶ LibSQL/Redis
```

- **Browser → proxy**: nothing is trusted from this side. `X-Forwarded-For`
  only becomes client identity after a peer-gated rightmost-first walk over
  the `TrustedProxySet` allowlist (`trusted-proxy.ts`, AD-37); the default
  allowlist is empty — trust nobody.
- **Proxy → Node**: plain-HTTP peers see no HSTS (browsers ignore it over
  insecure connections by spec); `X-Forwarded-Proto` awareness stays
  deferred — documented, not assumed.
- **Node server**: every response carries the security-header set by
  default (CSP with `connect-src 'self' ws: wss:`, HSTS, frame/referrer/
  sniffing controls — `security-headers-interceptor.ts`, AD-25). The CSP
  `ws:`/`wss:` admission is explicit: the framework ships its own
  WebSocket server against an unknown origin at build time (AD-25 D1).
- **Backends** (LibSQL files, Redis): trusted-network + ACL/TLS protected;
  Redis namespaces are isolation, never authorization.

## The defense layers

| Layer               | Mechanism                                                                                                       | Where                                                                    | Decision     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| Transport hardening | Security headers default-on; `X-Powered-By` removed                                                             | `security-headers-interceptor.ts`, `NodeAutoConfiguration`               | AD-25        |
| Client identity     | `TrustedProxySet` CIDR allowlist; rightmost-first XFF walk; `NodeRequest.remoteAddress`                         | `trusted-proxy.ts`, `node-request.ts`                                    | AD-37        |
| Abuse throttling    | Fixed-window `@rateLimit`, 429 + `Retry-After`, keyed on real client IP                                         | `rate-limit-interceptor.ts`                                              | AD-33        |
| Request forgery     | CSRF interceptor (state-changing requests); CORS interceptor                                                    | `csrf-interceptor.ts`, `cors-interceptor.ts`                             | AD-33 wave   |
| Session theft       | HttpOnly cookie sessions, fixation rotation (atomic, expiry-preserving), live-session cap, durable LibSQL store | `session-cookie.ts`, `session-store.ts`, `libsql-session-store.ts`       | AD-33, AD-40 |
| Authentication      | Credentials (scrypt, constant-ish time) + OIDC authorization-code + PKCE + nonce, fail-closed `validateAny`     | `credentials-auth-adapter.ts`, `oidc-adapter.ts`, `password-encoders.ts` | AD-56, AD-33 |
| Authorization       | `@authenticated`/`@authorized`, `AuthRouteGuard` 401/403, socket-auth 1008 close                                | `route-guard`, `node-http-server-adapter.ts`                             | AD-33        |
| Token service       | JWT with explicit scheme selection                                                                              | `jwt-adapter.ts`                                                         | AD-56        |
| Input validation    | Zod schemas (route params, bodies, entity-derived `insertSchemaForEntity`); malformed never persists            | `zod-validated-by.ts`, `entity-schema.ts`                                | AD-07        |
| Error disclosure    | RFC 9457 `application/problem+json`, `urn:blue:*` placeholders, no HTML/reflection on 404/405                   | `problem-details.ts`, `last-resort-error-resolver.ts`                    | AD-10        |
| Secrets             | At-rest `{cipher:...}` AES-256-GCM with key-path AAD, `BLUE_SECRET_KEY`, capability-gated wiring                | `aes-gcm-cipher.ts`                                                      | AD-29        |

## Key tensions (resolved)

- **Default-on vs. app surprise.** Headers and rate limiting are
  default-on because both are safe to enable (permissive-by-default CSP
  `connect-src` is the documented exception; per-header escapes exist,
  `unsafe-inline` is never the default).
- **Trusted proxies vs. spoofing.** Client-IP trust is all-or-nothing per
  peer: either the peer is allowlisted (its XFF can name a client) or it
  is not (its XFF is ignored). No middle ground, no heuristics.
- **CSP strictness vs. framework WebSockets.** `ws:`/`wss:` are explicit
  connect-src admissions until per-app origins are warranted — recorded in
  AD-25 D1 rather than left implicit.
- **Problem-type URIs.** `urn:blue:*` is a self-contained placeholder;
  real HTTPS URIs before first public release (AD-10).

## Where security lives (index)

- Decisions: AD-10 (error model), AD-25 (headers), AD-29 (secrets),
  AD-33 (auth credentials/sessions/rate limit), AD-37 (trusted proxy),
  AD-40 (durable sessions), AD-56 (auth design)
- How-to: guides 03 (secrets/config), 11 (auth & sessions),
  15 (interception/resilience)
- History: SEC-1..SEC-6 in `docs/audits/` (remediation records)
