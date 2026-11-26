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

- **Browser → proxy.** Nothing from this side is trusted. Only an allowlisted
  proxy can set the forwarded client identity; an unlisted peer's header is
  ignored.
- **Proxy → server.** Security headers that browsers honour only over secure
  connections — [HSTS][hsts] above all — are sent regardless; browsers apply
  them only on HTTPS.
- **Server.** Every response carries the security-header set by default: a
  [content security policy][csp], HSTS, and frame, referrer, and sniffing
  controls. The policy admits the application's own origin; a socket server on
  another host widens it explicitly to that host, never to a wildcard.
- **Backends.** Databases and caches sit on trusted networks behind ACL and
  TLS. Namespaces isolate tenants; they are never treated as authorization.

## Defense Layers

| Layer            | What it protects                        | Default posture                                                                                                                                                       |
| :--------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transport        | Session hijacking, downgrade attacks    | Security headers on every response; HSTS only where it is honoured; server-identifying headers removed                                                                |
| Client identity  | Spoofed forwarding headers              | Allowlist-only proxy trust; empty by default; an unlisted peer cannot name a client                                                                                   |
| Abuse            | Brute force, scraping, runaway clients  | Fixed-window throttling keyed on the resolved client address, 429 with `Retry-After`; in-process default                                                              |
| Request forgery  | Cross-site mutations                    | Login accepts JSON only; double-submit [CSRF][csrf] protection is available and explicit; [CORS][cors] is configured                                                  |
| Sessions         | Theft, fixation, unbounded accumulation | Host-scoped [HttpOnly cookie][cookies], rotation on authentication, a live-session cap, durable store                                                                 |
| Authentication   | Impersonation                           | Memory-hard credential hashing; [OIDC authorization code][oidc] with [PKCE][pkce] and nonce; fail-closed validation                                                   |
| Authorization    | Privilege escalation                    | Route guards deny by default; rejected socket authentication closes the connection                                                                                    |
| Input            | Injection, malformed or partial data    | Schema validation at the boundary before anything persists; unknown input never reaches the domain                                                                    |
| Error disclosure | Information leaks through failure paths | [RFC 9457][rfc9457] problem documents with controlled type URIs; no HTML or reflection on 404/405                                                                     |
| Secrets          | Exposure at rest                        | Authenticated encryption bound to the secret's path; explicit `app.secrets(...)` wiring ([Live Configuration & Secrets](../guides/live-configuration-and-secrets.md)) |

## Security in Practice

Security is declared at the boundary, not re-checked in every handler. The
decorators carry the requirement; the guard is the enforcement point — without
a wired guard that reads it, `@authenticated` is inert metadata.

```ts
import { authenticated, authorized } from '@ndigo/auth-core';
import { AuthRouteGuard } from '@ndigo/auth-server';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { SESSION_COOKIE, getNodeRequest } from '@ndigo/platform-node';

@authenticated
@requestMapping('/reports')
class ReportController {
    @getMapping('/:id')
    @authorized('analyst')
    report(): void {}
}

mapping.interceptors.push(
    new AuthRouteGuard(authServer, (route) => getNodeRequest(route)?.cookies[SESSION_COOKIE] ?? null, 'credentials')
);
```

The token extractor is the credential-specific seam: this example reads the
session cookie; a JWT API reads the `Authorization` header instead. Security
headers are on by default, and `trustedProxies` on the server is the only way a
forwarded client address becomes identity.

## See Also

- How-to: [Authentication & Sessions](../guides/authentication-and-sessions.md),
  [Browser Authentication & OIDC](../guides/browser-authentication-and-oidc.md),
  [Security Hardening](../guides/security-hardening.md)
- Configuration: [Environment & Configuration](../guides/environment-configuration.md)
  (secrets and configuration), [Live Configuration & Secrets](../guides/live-configuration-and-secrets.md)
  (encrypted secrets)
- Operations: [Resilience & Retries](../guides/method-interception-and-resilience.md)
- Package reference: [ndigo.dev/reference/packages](https://ndigo.dev/reference/packages/)
- Standards: [RFC 9457][rfc9457] (problem details), [OpenID Connect Core][oidc],
  [PKCE][pkce], [JWT](https://www.rfc-editor.org/rfc/rfc7519),
  [CSRF][csrf], [CORS][cors], [CSP][csp], [HSTS][hsts], [HTTP cookies][cookies]

[cookies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
[cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[csrf]: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[hsts]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
[oidc]: https://openid.net/specs/openid-connect-core-1_0.html
[pkce]: https://www.rfc-editor.org/rfc/rfc7636
[rfc9457]: https://www.rfc-editor.org/rfc/rfc9457.html
