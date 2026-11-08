# Guide 26 — Authentication & Sessions

How authentication works in Ndigo: password hashing, first-party
credential login, opaque cookie sessions, rate limiting and CSRF on
auth mutations, and JWT issuance/refresh/revocation. The machinery spans
`@ndigo/auth-core` (contracts), `@ndigo/auth-server` (credentials adapter,
session/user stores, JWT adapter) and `@ndigo/platform-node` (cookies,
session interceptor, rate limiting). Design decisions: [AD-33](../decisions/2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md);
landed via [the auth completion plan](../plans/2026-09-26_AUTH_COMPLETION.md).

## 1. Quickstart (server-rendered cookie flow)

```ts
import { AuthRegistry, DelegatingPasswordEncoder } from '@ndigo/auth-core';
import { ScryptPasswordEncoder } from '@ndigo/auth-core/scrypt'; // Node-only (node:crypto)
import { CredentialsAuthAdapter, InMemoryUserStore, InMemorySessionStore } from '@ndigo/auth-server';

const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder() }, 'scrypt');

function initAuth(): void {
    AuthRegistry.register(
        new CredentialsAuthAdapter({
            userStore, // your UserStore — typically ndigo-orm backed (see §3)
            passwordEncoder: encoder,
            sessionStore: new InMemorySessionStore(), // or your SessionStore
        })
    );
}
```

The adapter implements the existing `AuthAdapter` seam — `AuthServer`,
`AuthRouteGuard` and `validateAny` explicit-scheme selection consume it
unchanged. Login/logout/`/me` wiring (cookie in, cookie out):
`setSessionCookie(route, token)` / `clearSessionCookie(route)` from
`@ndigo/platform-node`; the `__Host-ndigo-session` cookie is HttpOnly +
SameSite=Lax + Path=/ + **Secure by default**. The `__Host-` prefix
_mandates_ `Secure` (alongside `Path=/` and no `Domain`), so
`{ secure: false }` with the default name fails loudly; for plain-HTTP dev
pass an explicit unprefixed `name` and read it back with the same name.
`NodeSessionInterceptor(sessionStore)` fills the
`request.session` bag (`principal`/`token`) before dispatch so
`requestSessionValue('principal')` binds for cookie-authenticated
requests.

## 2. Password hashing

`PasswordEncoder` (`encode`/`verify`/`needsRehash`) — the reference shape with
Ndigo names. Hashes are self-describing: `{scrypt}$ln=17,r=8,p=1$<salt>$<hash>`
(cost parameters embedded), so parameter bumps never invalidate stored
hashes. `DelegatingPasswordEncoder` dispatches on the `{scheme}` prefix;
an unknown scheme **throws** (fail closed — no plaintext fallthrough).
`needsRehash(encoded)` is the migration hook: rehash on login when the
stored scheme/params no longer match the configured default.

- **scrypt** (`node:crypto`) is the reference implementation — zero
  dependencies, platform-audited. Default `ln=17` (OWASP floor, ~128 MiB).
- **argon2id is deliberately deferred** (AD-33 D-3): adding it later is a
  new prefix + adapter + a config line; old hashes keep verifying and
  `needsRehash` migrates logins.
- `verify` derives with the **stored** parameters, never the encoder's
  current ones — older, cheaper hashes stay valid until rehashed.

## 3. The user store is app-owned

`UserStore` (`findByUsername`, `findById`, `incrementTokenVersion`) is a
contract, not a product: user storage is application data. Implement it
over a `ndigo-orm` entity:

```ts
class OrmUserStore implements UserStore {
    async findByUsername(username: string): Promise<UserRecord | null> {
        const user = await em.find(User, { username }); // your query
        return (
            user && {
                id: user.id,
                username: user.username,
                passwordHash: user.passwordHash, // PasswordEncoder output
                roles: user.roles,
                tokenVersion: user.tokenVersion,
                disabled: user.disabled,
            }
        );
    }
    // findById equivalent; incrementTokenVersion is a single atomic
    // `UPDATE users SET token_version = token_version + 1 WHERE id = ?`.
}
```

`InMemoryUserStore` (`@ndigo/auth-server`) ships for tests and demos — never
a production store. The credentials adapter equalizes timing for unknown
users (dummy-hash verify), so error responses should be one generic
message (`InvalidCredentialsError`); disabled accounts and accounts
without a hash never authenticate.

## 4. Server sessions (audit M4)

`SessionStore` (`kind`, `create`, `get`, `rotate`, `delete`,
`deleteForUser`) with TTL enforced on read. Opaque 32-byte tokens — not JWTs: trivially revocable,
no replay window. `InMemorySessionStore` is the reference; the durable
[`LibSQLSessionStore`](../../packages/ndigo-orm-drizzle/README.md) (`kind:
'libsql'`) implements the same contract: explicit `initialize()` to
provision the `ndigo_sessions` table, atomic rotation (exactly one contender;
absolute expiry preserved), strict record decoding, and `close()` for
container shutdown (owned clients close exactly once; injected clients are
borrowed unless `ownsClient: true`). Injected clients must use
`intMode: 'number'` — strict decoding rejects bigint/string modes. Redis can
use the same contract later (the `kind` identifier matches
`QueueMessageStore`). Session **rotation** on login (fixation protection): the
in-memory store deletes the old id before issuing the new one; the LibSQL
store replaces it atomically in one guarded update. Cookies:
HttpOnly + SameSite=Lax + Secure, `Max-Age=0` clear on logout. Naming:
`SESSION_COOKIE = '__Host-ndigo-session'` (the `__Host-` prefix mandates
`Secure`; see §1).

### Revoking a user everywhere (AD-68)

```ts
import { AuthRegistry, type CredentialsAuthAdapter } from '@ndigo/auth-core';
// (the concrete adapter is exported by @ndigo/auth-server)

const credentials = AuthRegistry.getAdapter('credentials') as CredentialsAuthAdapter;
const { sessions, tokenVersion } = await credentials.logoutAll(userId);
```

`logoutAll(userId)` deletes every live session of the account
(`SessionStore.deleteForUser`) and advances its `tokenVersion`, which also
invalidates every outstanding JWT the `JWTAdapter` issued for the account.
Disabling or deleting the account has the same effect without an explicit
call: `validate`/`refresh` consult the live user record, so a disabled
account's sessions and JWTs stop validating immediately (SE-7). Opaque
sessions deliberately do **not** compare `tokenVersion` — JWT refresh
rotation advances that counter and must never log server sessions out;
sessions revoke by deletion.

## 5. Rate limiting login (SEC-6)

Credential endpoints are the brute-force surface — throttle them:

```ts
@postMapping('/login')
@rateLimit({ limit: 5, windowMs: 60_000 })
@parameters({ credentials: bodyValue(), route: routeValue(), contentType: headerValue('content-type') })
async login(credentials: unknown, route: Route, contentType: string | undefined) {
    if (contentTypeBase(contentType) !== String(MediaTypes.APPLICATION_JSON)) {
        return ResponseEntity.unsupportedMediaType({ error: 'Only application/json request bodies are accepted' });
    }
    // …authenticate…
}
```

Login is **JSON-body only**: the handler requires
`Content-Type: application/json` and returns **415** problem+json
(`ResponseEntity.unsupportedMediaType`) otherwise — a cross-site HTML form
cannot send that media type, so this is the CSRF defense when the
interceptor is unwired (see §6).

`@rateLimit` is passive metadata; `RateLimitInterceptor` (default-on in
`NodeAutoConfiguration.handlerMapping`, like security headers) enforces it
— routes without metadata are untouched. Denial: **429** +
`Retry-After` (seconds) problem document (`urn:ndigo:rate-limited`). The
key is `NodeRequest.remoteAddress` — the socket peer unless the direct
connection comes from a `trustedProxies` allowlist entry
(`NDIGO_TRUSTED_PROXIES` env): then `X-Forwarded-For` is walked
rightmost-first and the first non-trusted valid IP wins, so spoofed
headers never win; with no trusted proxies configured the socket peer is
used (see §9).

The budgets live in a `RateLimiter` bean (`RATE_LIMITER` token), the
in-process `FixedWindowRateLimiter` by default — one process, one budget.
Under multiple processes the in-memory default multiplies the effective
limit per node; override the bean with `@ndigo/redis/rate-limit`'s
`RedisRateLimiter` so every node counts against the **same** budgets
(shared store, **fail-closed** by default — AD-79; see
[guide 21 §3](21-persistence-and-shared-stores.md)).

## 6. CSRF on auth mutations

Cookie sessions make mutating routes CSRF targets. Add the
double-submit-cookie interceptor to your handler mapping (one owner per
`handlerMappings` collection — the demo's mapping is owned by the platform
auto-config, so it wires CSRF in a dedicated boot; see the plan's Wave-2
notes):

```ts
mapping.interceptors.push(new CSRFInterceptor());
```

Every POST/PUT/DELETE/PATCH then requires a matching `X-CSRF-Token` header
(or `csrf_token` body field) against the `__Host-ndigo-csrf` cookie
(SameSite=Lax + Secure + Path=/ by default); safe GETs mint the cookie. The
`__Host-` prefix stops a sibling subdomain from overwriting the cookie
(cookie tossing) — keep `Secure`/`Path=/` and no `Domain` when overriding the
cookie attributes. Without a matching token, login/logout never run — the
interceptor denies before the handler.

**Posture note (2026-10-06 review, SEC-AUD2-SEC-3):** the interceptor is
opt-in and **unwired by default**, so a cookie-session app **must** wire
`CSRFInterceptor` (or keep every mutating route JSON-only). A cross-site
HTML form always sends `application/x-www-form-urlencoded` (or
`multipart/form-data` / `text/plain`) — it can never send
`application/json` — so `POST /auth/login`'s mandatory
`Content-Type: application/json` gate makes login itself **not
cross-site-postable**: a form post is rejected **415** before
authentication (see §5). `POST /auth/logout` is not JSON-gated, however:
without the interceptor a cross-site form POST still carries the
SameSite=Lax session cookie and forces a logout (nuisance only — no state
to mutate). Wire the interceptor for logout and any additional
cookie-authenticated mutating route.

## 7. JWT issuance, refresh and revocation (AD-33 D-7)

`JWTAdapter` validates external tokens (HMAC secret, PEM/JWKS asymmetric,
issuer/audience/expiration) — and with a `userStore` wired it also owns
first-party tokens:

- `issueTokens(subject)` — access + refresh pairs (HS\* configs only;
  asymmetric configs hold no signing key). The `ver` claim snapshots the
  store's **current** `tokenVersion`.
- `validate` — `ver` must equal the account's version. Tokens **without**
  `ver` (external IdP) skip the check, so revocation never rejects tokens
  the adapter didn't version. Cost: one user-record read per validation —
  `revocationCacheTtlMs` trades revocation latency for throughput
  (default 0 = always read, invalidated on refresh/logout). Only access
  tokens authenticate: a framework refresh token (`token_use: 'refresh'`)
  is rejected, as is any present claim that is not `'access'` (AD-68).
- `refresh(token)` — **version-advancing rotation**: every refresh bumps
  `tokenVersion` and issues a new pair; all older tokens die. Reuse of a
  rotated-out refresh is rejected by construction — no ledger. This means
  concurrent access tokens also die on refresh: correct for short-lived
  access tokens (refresh happens on expiry); long-lived access tokens
  would need a `jti` ledger (follow-up).
- `logout(token)` — verifies, then bumps the version: the whole family
  dies at once. For an explicit user-wide revoke that also deletes every
  live session, use `CredentialsAuthAdapter.logoutAll` (§4, AD-68).

## 8. Securing management endpoints (SEC-5, AD-36)

`/health` and `/metrics` are **open by default** (documented posture), with
two hardening layers on by default since AD-36:

- **Error redaction** — a throwing health indicator reports `DOWN` with the
  stable marker `"error": "unavailable"`; the exception text never reaches
  the wire. Opt into raw messages with
  `ManagementAutoConfiguration({ redactHealthErrors: false })` — only
  sensible behind a guard.
- **Guarded endpoints** — wire an _unconditional_ guard into
  `ManagementAutoConfiguration({ accessGuard })`. The handlers carry no
  `@authenticated`/`@authorized` metadata, so a metadata-driven guard such as
  `AuthRouteGuard` would always permit them — use a guard that checks the
  request itself (a token-presence or token-adapter guard) to actually require
  authentication.

**Bind-address separation (AD-36 D-2).** Management routes share the
application listener and follow its bind address — the platform server
binds `HTTPServerOptions.host` (default `127.0.0.1`, loopback). Documented
posture:

1. Bind the whole server to a private interface (`host` option) or firewall
   the management paths at the network boundary (reverse proxy routing
   `/health|/metrics` to an internal listener).
2. Never expose `/health`/`/metrics` on a public interface without the
   `accessGuard`.

A dedicated management listener (the `management.server.port`
equivalent) is recorded as the post-1.0 follow-up; it needs a second
dispatch stack on the platform, and guard + redaction cover the exposure
in the meantime.

## 9. Real client IP behind trusted proxies (AD-37)

`NodeRequest.remoteAddress` — the rate limiter's key and the address
handlers read — is the **socket address** unless you name your proxies.
Trusting `X-Forwarded-For` from anyone is a spoofing hole; the server
only believes the header when the **direct connection** comes from a
trusted proxy.

```ts
// Wire in a controller/configuration class:
new NodeHTTPServerAdapter(dispatcher, {
    trustedProxies: ['127.0.0.1', '10.0.0.0/8', '::1'],
});
```

Or deploy-time, no code change:

```
NDIGO_TRUSTED_PROXIES=10.0.0.0/8,2001:db8::/32 node server.js
```

Rules (AD-37, following the MDN/Rails/Fastify industry approach):

- **Default is trust nobody**; list proxy addresses/CIDRs explicitly where
  they sit in front of the server.
- The header is walked from the **rightmost** entry (the proxy closest to
  the server appends last); trusted hops are skipped and the first
  non-trusted valid IP wins — so a client's spoofed leftmost values can
  never win.
- Malformed config (hostnames, ports, bad prefixes) **fails at startup**,
  not silently; RFC 7239 `Forwarded` and `X-Forwarded-Proto`/`-Host`
  rewriting remain deferrals (AD-37 D-3).
- Everything reading `remoteAddress` benefits automatically: rate limiting
  keys per resolved client instead of collapsing into one proxy bucket.

## 10. Deferrals (deliberate)

WebAuthn/passkeys, MFA, SAML, provider federation (OIDC client exists for
authorization-code + PKCE), RBAC beyond `@authorized`'s role list,
persistent session-store backends, argon2id (additive when needed),
persistent JWT rotation ledger (needed only for long-lived access
tokens). None blocks the 1.0 credential + session story.
