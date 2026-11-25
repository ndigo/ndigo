# Security

Ndigo assumes the network is hostile and the browser is untrusted. Security is
therefore structural rather than additive: each layer enforces one part of the
boundary, the safe configuration is the default, and misconfiguration fails
loudly instead of degrading quietly. This page states the posture and the
reasoning; the guides show each mechanism in use.

## Design Principles

1. **Fail closed, fail loud.** Access is denied unless a principal is
   established. Backend faults reject rather than fall back to memory or empty
   results, and a malformed trust list or cipher marker fails at startup or
   first use — never silently.
2. **Minimal external trust.** The browser is untrusted; a proxy must be
   explicitly listed before it can influence client identity; secrets never
   ship in defaults; backends connect only to explicit addresses. The default
   proxy allowlist is empty — trust nobody.
3. **Cryptography is framework-owned.** Password hashing, token signing, and
   encryption live behind small contracts the framework maintains.
   Applications assemble and configure those contracts; they never reinvent
   them in application code.
4. **Defense in depth, not single gates.** Transport hardening, throttling,
   request-forgery protection, session safety, authentication, authorization,
   input validation, and the error contract each cover a different layer. No
   single mechanism is the boundary.

## Trust Boundaries

```
Browser (untrusted) ──HTTPS──▶ TLS-terminating proxy ──▶ Node server
                                                          │  headers
                                                          │  rate limiting
                                                          │  CSRF/CORS
                                                          │  client identity
                                                          ├─▶ routing ──▶ validation
                                                          └─▶ auth ──▶ session store ──▶ database / cache
```

- **Browser → proxy.** Nothing from this side is trusted. A forwarded client
  address only becomes identity after the peer is recognised as an allowlisted
  proxy, and the walk is right-to-left so a client cannot prepend a claim.
- **Proxy → server.** Security headers that browsers only honour over secure
  connections — HSTS above all — are not assumed on plain-HTTP peers. Edge
  protocol awareness is documented rather than guessed.
- **Server.** Every response carries the security-header set by default: a
  content security policy, HSTS, and frame, referrer, and sniffing controls.
  The policy admits the application's own origin; a socket server on another
  host widens it explicitly to that host, never to a wildcard.
- **Backends.** Databases and caches sit on trusted networks behind ACL and
  TLS. Namespaces isolate tenants; they are never treated as authorization.

## Defense Layers

| Layer            | What it protects                        | Default posture                                                                                          |
| :--------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Transport        | Session hijacking, downgrade attacks    | Security headers on every response; HSTS only where it is honoured; server-identifying headers removed   |
| Client identity  | Spoofed forwarding headers              | Allowlist-only proxy trust; empty by default; an unlisted peer cannot name a client                      |
| Abuse            | Brute force, scraping, runaway clients  | Fixed-window throttling keyed on the resolved client address, 429 with `Retry-After`; in-process default |
| Request forgery  | Cross-site mutations                    | Login accepts JSON only; double-submit CSRF protection is available and explicit; CORS is configured     |
| Sessions         | Theft, fixation, unbounded accumulation | Host-scoped HttpOnly cookie, rotation on authentication, a live-session cap, durable store               |
| Authentication   | Impersonation                           | Memory-hard credential hashing; OIDC authorization code with PKCE and nonce; fail-closed validation      |
| Authorization    | Privilege escalation                    | Route guards deny by default; rejected socket authentication closes the connection                       |
| Input            | Injection, malformed or partial data    | Schema validation at the boundary before anything persists; unknown input never reaches the domain       |
| Error disclosure | Information leaks through failure paths | RFC 9457 problem documents with controlled type URIs; no HTML or reflection on 404/405                   |
| Secrets          | Exposure at rest                        | Authenticated encryption bound to the secret's path; capability-gated wiring                             |

## Key Tensions and Resolutions

- **Safe defaults vs application surprise.** Headers and throttling are on by
  default because both are safe to enable. The content security policy was
  tightened to the application's own origin; a cross-host socket server widens
  it explicitly, and inline script is never the default.
- **CSRF protection is explicit vs login forgery.** Double-submit protection
  is not wired automatically, so a cookie-session application must either add
  it or keep every mutating route JSON-only. Login already accepts JSON alone,
  which a cross-site HTML form cannot send, so login is not cross-site
  postable even before the interceptor is added. Logout and other
  cookie-authenticated mutations still need the protection.
- **Trusted proxies vs spoofing.** Client-address trust is all-or-nothing per
  peer: either the peer is allowlisted and its forwarded address counts, or it
  is not and the header is ignored. There is no heuristic middle ground.
- **Strict policy vs framework sockets.** Same-origin sockets are covered by
  the default policy. A socket server on another host is an explicit addition
  to the allowlist; a bare scheme wildcard is never an admission.
- **Problem-type identity.** The framework uses a self-contained placeholder
  scheme for problem types today; real HTTPS identifiers replace it before the
  first public release.

## See Also

- How-to: [Guide 03 — Environment & Configuration](../guides/03-environment-configuration.md)
  (secrets and configuration), [Guide 26 — Authentication & Sessions](../guides/26-authentication-and-sessions.md),
  [Guide 35 — Resilience & Retries](../guides/35-method-interception-and-resilience.md)
- Package reference: [ndigo.dev/reference/packages](https://ndigo.dev/reference/packages/)
- Standards: [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) (problem
  details), [OIDC](https://openid.net/connect/),
  [PKCE](https://www.rfc-editor.org/rfc/rfc7636),
  [JWT](https://www.rfc-editor.org/rfc/rfc7519),
  [CSRF](https://owasp.org/www-community/attacks/csrf),
  [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS),
  [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP),
  [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
