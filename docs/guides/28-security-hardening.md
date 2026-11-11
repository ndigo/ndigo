# Guide 28 — Security Hardening

Ndigo's security posture is defense in depth: the platform enables safe
defaults, and each layer is explicit about what it does and does not protect.
This guide is the task-oriented checklist — headers, CORS, CSRF, rate limiting,
trusted proxies, cookies, and the surfaces that need a deliberate decision.

The threat model and the rationale for each layer live in
[Security Architecture](../architecture/security.md); this guide is the
configuration and wiring.

**Audience:** Node application developers and operators · **Prerequisites:** Guides [01](01-building-a-node-api.md) and [26](26-authentication-and-sessions.md) · **Reference app:** [apps/09-ndigo-httpbin](https://github.com/ndigo/ndigo/tree/main/apps/09-ndigo-httpbin), [apps/18-ndigo-auth-playground](https://github.com/ndigo/ndigo/tree/main/apps/18-ndigo-auth-playground)

## What you'll learn

- Know which protections are on by default and which are opt-in.
- Configure CORS without accidentally allowing credentials from any origin.
- Wire CSRF for cookie-authenticated mutations.
- Apply rate limits and key them behind a trusted proxy.
- Set cookies and expose management/WebSocket/static surfaces safely.

## 1. The default posture

`NodeAutoConfiguration` builds the default mapping with:

- **Security headers** — `SecurityHeadersInterceptor` prepended (default-on).
- **Rate limiting** — `RateLimitInterceptor` appended, enforced only on routes
  with `@rateLimit` metadata.
- **CORS** — `CORSInterceptor` appended and **fail-closed**: no origin is
  allowed until `cors.allowedOrigins` is set.
- **CSRF** — **not** wired by default; opt in for cookie-authenticated
  mutations (§4).

Other layers are explicit: sessions/auth (guide 26), static containment
(guide 10), management exposure (guide 33), WebSocket origins (guide 15), and
at-rest secrets (guide 03).

## 2. Security headers and CSP

The interceptor applies Helmet's default set — CSP, HSTS, `X-Content-Type-Options`,
`X-Frame-Options`, referrer policy, and the rest — to every HTTP response,
including 404s and errors. Configure it through the interceptor options:

```ts
import { SecurityHeadersInterceptor } from '@ndigo/platform-node';

mapping.interceptors.unshift(
    new SecurityHeadersInterceptor({
        headers: {
            contentSecurityPolicy: {
                directives: {
                    'connect-src': ["'self'", 'wss://ws.example.com'],
                },
            },
        },
    })
);
```

CSP `connect-src` defaults to `'self'`, which covers same-origin WebSockets
under CSP3. A socket host on another origin must be named explicitly; never
widen to bare `ws:`/`wss:`. Disabling a header is a deliberate weakening — do
it per header, not with a blanket `enabled: false`.

## 3. CORS

CORS is a browser boundary, not authentication. It is fail-closed by default;
enable the exact origins you trust:

```json
{
    "cors": {
        "allowedOrigins": ["https://app.example.com"],
        "allowCredentials": true,
        "allowedHeaders": ["Content-Type", "Authorization", "X-CSRF-Token"],
        "maxAgeSeconds": 600
    }
}
```

Rules:

- `allowedOrigins: ['*']` is rejected with `allowCredentials: true` at
  construction — browsers forbid the combination.
- The allowed origin is echoed, not wildcarded, when credentials are allowed.
- Preflight (`OPTIONS` + `Access-Control-Request-Method`) short-circuits with
  204; actual responses receive the allow headers.
- A CORS denial is a denial, not a hint: do not add a permissive catch-all to
  make a failing client “work”.

## 4. CSRF

Cookie sessions make mutating routes CSRF targets. The double-submit interceptor
is opt-in; wire it on the handler mapping that serves cookie-authenticated
mutations:

```ts
import { CSRFInterceptor } from '@ndigo/platform-node';

mapping.interceptors.push(new CSRFInterceptor());
```

Every `POST`/`PUT`/`DELETE`/`PATCH`/`QUERY` then needs `X-CSRF-Token` (or the
`csrf_token` body field) matching the `__Host-ndigo-csrf` cookie, compared in
constant time. Safe requests mint the cookie when absent.

The `__Host-` prefix is the protection: browsers accept it only with `Secure`,
`Path=/`, and no `Domain`, so a sibling subdomain cannot overwrite it. Keep
those attributes; a non-prefixed cookie name or a `Domain` attribute gives up
the host pinning. Login is also JSON-only (415 for form posts), which closes the
login-CSRF vector even without the interceptor; logout and other
cookie-authenticated mutations still need it.

## 5. Rate limiting

Declare a budget on the route; the limiter owns the counters:

```ts
@postMapping('/login')
@rateLimit({ limit: 5, windowMs: 60_000 })
login() {
    // …
}
```

`RateLimitInterceptor` is already in the default mapping; a route without
metadata is untouched. A denial is **429** with `Retry-After` and the
`urn:ndigo:rate-limited` problem document.

The default `FixedWindowRateLimiter` is **per process**. Under clustering or
multiple nodes, register the Redis driver so every process shares one budget:

- the key is `(window, client address)`, so different windows never share a
  count;
- `RedisRateLimiter` is **fail-closed** — a store failure rejects rather than
  allowing unthrottled traffic; `onError: 'fail-open'` is the documented
  availability escape hatch;
- always load-test the budget with the real request path; a limiter that counts
  only successful logins does not stop credential stuffing.

## 6. Trusted proxies

`X-Forwarded-For` is attacker input unless the direct peer is a proxy you trust.
Configure the allowlist on the server:

```ts
new HTTPServer(dispatcher, {
    trustedProxies: ['10.0.0.0/8', '2001:db8::/32'],
});
```

or set `NDIGO_TRUSTED_PROXIES` (comma-separated). The resolver walks the header
from the rightmost hop, skipping trusted entries; the first valid non-trusted
address is the client. Without a configured proxy the socket peer is used.

The resolved address is what rate limiting, sessions, auth, and `remoteAddress`
read. If you terminate TLS at a proxy and forget the allowlist, every client
looks like the proxy and shares one budget — or worse, a spoofed header wins if
you trust too broadly. Trust only the exact proxy networks.

## 7. Cookies, sessions, and exposure

- **Session cookies** — `HttpOnly`, `SameSite=Lax`, `Secure`, `Path=/`; the
  `__Host-ndigo-session` prefix pins the origin. Never expose the session id to
  JavaScript. [Guide 26](26-authentication-and-sessions.md) covers rotation and revocation.
- **JWT** — short access TTLs, rotating refresh tokens, `tokenVersion`
  revocation; see [guide 26](26-authentication-and-sessions.md).
- **Management endpoints** — opt-in exposure; protect them with the same guard
  as any privileged route (guide 33).
- **WebSockets** — validate `Origin` on upgrade (guide 15); a socket inherits
  the same auth and rate-limit decisions as HTTP.
- **Static files** — containment and method safety are on by default; do not
  serve user-controlled roots (guide 10).
- **Secrets** — use `{cipher:...}` values and keep `NDIGO_SECRET_KEY` out of
  the repository and backups (guide 03).

## 8. Production checklist

- CORS allowlist contains only the real front-end origins.
- CSRF wired for every cookie-authenticated mutation.
- Login and other credential endpoints have explicit `@rateLimit` budgets.
- Trusted proxies match the actual edge network; `NDIGO_TRUSTED_PROXIES` is set
  in production.
- Security headers are not disabled; CSP `connect-src` names additional hosts
  explicitly.
- Management endpoints are guarded or not exposed; health probes are the only
  public surface.
- Session/JWT lifetimes and cookie flags match the deployment’s TLS posture.
- Secrets are encrypted at rest; the key is delivered by the environment, not
  the repo.

## 9. Pitfalls

- **CORS is not auth.** It stops browser reads, not server-to-server requests.
- **`allowedOrigins: ['*']` plus credentials fails at startup.** Use an explicit
  list and echo the origin.
- **CSRF is opt-in.** A cookie-session app that never wires it is exposed on
  logout and any non-JSON mutation.
- **A per-process limiter multiplies under clustering.** Use the Redis driver
  for multi-node budgets.
- **Trusting all proxies trusts all headers.** Configure exact networks.
- **Disabling headers to fix a CSP error hides the error.** Widen the specific
  directive instead.
- **Remote registries are a read surface, not a write surface.** The CLI
  validates paths against the selected local registry and only accepts JSON
  content that the registry source declared; remote content must not include
  arbitrary local files or unregistered host references.
- **Remote boot config never starts code silently.** `fromConfig` requires a
  `sourceCatalog` mapping of configuration factories, so an allowlist replaces
  direct module `import` of remote specifiers.
- **Do not render untrusted markup on A2UI surfaces.** `nd-a2ui-surface` only
  writes safe attributes/props; pass explicit facts as data, not as markup,
  and sanitize the source if the values are quotes from user input.
- **Use `trustedMarkup: true` only for MCP UI documents you own.** The MCP Apps
  `ui://` resource renderer escapes the body by default; only set
  `trustedMarkup` when the markup is author-owned, not user input.

## See also

- [Security Architecture](../architecture/security.md) — trust boundaries and the layer map
- [Guide 26 — Authentication & Sessions](26-authentication-and-sessions.md) — credentials, cookies, JWT
- [Guide 43 — Live Configuration, Secrets & Remote Config](43-live-configuration-and-secrets.md) — at-rest secrets
- [Guide 33 — Management Endpoints](33-management-endpoints.md) — exposure and guarding
- [Guide 10 — Static Files](10-static-files.md) — containment and method safety
- [Guide 15 — WebSockets](15-websockets.md) — origin and socket auth
- [`@ndigo/rate-limit`](../../packages/ndigo-rate-limit/README.md) and [`@ndigo/platform-node`](../../packages/ndigo-platform-node/README.md) — the enforcing surfaces
- , , and — headers, proxies, and shared limits
