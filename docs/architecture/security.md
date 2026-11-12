# Security

What Ndigo defends, where the trust boundaries sit, and the defense layers that
protect an application. The mechanisms are summarized inline; the linked guides
show each one in use.

## Design Principles

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

## Trust Boundaries

```
Browser (untrusted) ──HTTPS──▶ TLS-terminating proxy ──▶ Node server
                                                          │  headers
                                                          │  rate limit
                                                          │  CSRF/CORS
                                                          │  trusted-proxy resolution
                                                          ├─▶ dispatcher ──▶ validation (RFC 9457)
                                                          └─▶ auth ──▶ session store ──▶ LibSQL/Redis
```

- **Browser → proxy**: nothing is trusted from this side. `X-Forwarded-For`
  only becomes client identity after a peer-gated rightmost-first walk over
  the `TrustedProxySet` allowlist (`trusted-proxy.ts`); the default
  allowlist is empty — trust nobody.
- **Proxy → Node**: plain-HTTP peers see no HSTS (browsers ignore it over
  insecure connections by spec); `X-Forwarded-Proto` awareness stays
  deferred — documented, not assumed.
- **Node server**: every response carries the security-header set by
  default (CSP with `connect-src 'self'`, HSTS, frame/referrer/sniffing
  controls — `security-headers-interceptor.ts`). The `'self'` default covers
  same-origin WebSocket streams under CSP3; a socket server on a different
  host widens `connect-src` to `wss://<host>` explicitly — never bare
  `ws:`/`wss:`, which admit connections to any origin.
- **Backends** ([LibSQL](https://turso.tech/libsql) files,
  [Redis](https://redis.io/)): trusted-network + ACL/TLS protected; Redis
  namespaces are isolation, never authorization.

## Defense Layers

| Layer               | Mechanism                                                                                                                                                              | Where                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Transport hardening | Security headers default-on; `X-Powered-By` removed                                                                                                                    | `security-headers-interceptor.ts`, `NodeAutoConfiguration`                     |
| Client identity     | `TrustedProxySet` CIDR allowlist; rightmost-first XFF walk; `NodeRequest.remoteAddress`                                                                                | `trusted-proxy.ts`, `node-request.ts`                                          |
| Abuse throttling    | Fixed-window `@rateLimit`, 429 + `Retry-After`, keyed on real client IP; in-process default, Redis shared-store driver opt-in (`@ndigo/redis/rate-limit`)              | `rate-limit-interceptor.ts`                                                    |
| Request forgery     | Opt-in CSRF double-submit interceptor (**unwired by default**); JSON-only `POST /auth/login` (415 on any non-JSON body) closes the login-CSRF vector; CORS interceptor | `csrf-interceptor.ts`, `auth-controller.ts`, `cors-interceptor.ts`             |
| Session theft       | HttpOnly `__Host-ndigo-session` cookie (`__Host-` prefix mandates `Secure`), fixation rotation (atomic, expiry-preserving), live-session cap, durable LibSQL store     | `session-cookie.ts`, `session-store.ts`, `libsql-session-store.ts`             |
| Authentication      | Credentials (scrypt, constant-ish time) + OIDC authorization-code + PKCE + nonce, fail-closed `validateAny`                                                            | `credentials-auth-adapter.ts`, `oidc-adapter.ts`, `scrypt-password-encoder.ts` |
| Authorization       | `@authenticated`/`@authorized`, `AuthRouteGuard` 401/403, socket-auth 1008 close                                                                                       | `route-guard`, `node-http-server-adapter.ts`                                   |
| Token service       | JWT with explicit scheme selection                                                                                                                                     | `jwt-adapter.ts`                                                               |
| Input validation    | Zod schemas (route params, bodies, entity-derived `insertSchemaForEntity`); malformed never persists                                                                   | `zod-validated-by.ts`, `entity-schema.ts`                                      |
| Error disclosure    | RFC 9457 `application/problem+json`, `urn:ndigo:*` placeholders, no HTML/reflection on 404/405                                                                         | `problem-details.ts`, `last-resort-error-resolver.ts`                          |
| Secrets             | At-rest `{cipher:...}` AES-256-GCM with key-path AAD, `NDIGO_SECRET_KEY`, capability-gated wiring                                                                      | `aes-gcm-cipher.ts`                                                            |

## Key Tensions and Resolutions

- **Default-on vs. app surprise.** Headers and rate limiting are
  default-on because both are safe to enable (the original permissive CSP
  `connect-src` default was hardened to `'self'`; a cross-host socket server
  widens it explicitly to `wss://<host>`, and `unsafe-inline` is never the
  default).
- **CSRF interceptor is opt-in vs. login forgery.** The double-submit
  interceptor is not wired by default, so a cookie-session app must wire
  it — or keep every mutating route JSON-only. `POST /auth/login` enforces
  `Content-Type: application/json` (415 problem+json otherwise); a
  cross-site HTML form cannot send that media type, so login is **not**
  cross-site-postable even with the interceptor unwired. Logout and any
  other cookie-authenticated mutation still need the interceptor.
- **Trusted proxies vs. spoofing.** Client-IP trust is all-or-nothing per
  peer: either the peer is allowlisted (its XFF can name a client) or it
  is not (its XFF is ignored). No middle ground, no heuristics.
- **CSP strictness vs. framework WebSockets.** `connect-src` defaults to
  `'self'`: same-origin socket upgrades are covered; a cross-host socket
  server widens explicitly to `wss://<host>` — bare `ws:`/`wss:` are never
  admissions.
- **Problem-type URIs.** `urn:ndigo:*` is a self-contained placeholder;
  real HTTPS URIs land before the first public release.

## See Also

- How-to: [Guide 03 — Environment & Configuration](../guides/03-environment-configuration.md)
  (secrets and config), [Guide 26 — Authentication & Sessions](../guides/26-authentication-and-sessions.md),
  [Guide 35 — Method Interception & Resilience](../guides/35-method-interception-and-resilience.md)
- Packages: `@ndigo/auth-core`, `@ndigo/auth-server`, `@ndigo/auth-client`,
  `@ndigo/platform-node`, `@ndigo/rate-limit` — see the
  [package index](https://ndigo.dev/reference/packages/).
- Standards: [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) (problem
  details), [OIDC](https://openid.net/connect/),
  [PKCE](https://www.rfc-editor.org/rfc/rfc7636),
  [JWT](https://www.rfc-editor.org/rfc/rfc7519),
  [CSRF](https://owasp.org/www-community/attacks/csrf),
  [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS),
  [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP),
  [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
