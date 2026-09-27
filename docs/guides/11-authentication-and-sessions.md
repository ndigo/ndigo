# Guide 11 — Authentication and Sessions

How authentication works in BlueJS: password hashing, first-party
credential login, opaque cookie sessions, rate limiting and CSRF on
auth mutations, and JWT issuance/refresh/revocation. The machinery spans
`@blue/auth-core` (contracts), `@blue/auth-server` (credentials adapter,
session/user stores, JWT adapter) and `@blue/platform-node` (cookies,
session interceptor, rate limiting). Design decisions: [AD-33](../decisions/2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md);
landed via [the auth completion plan](../plans/2026-09-26_AUTH_COMPLETION.md).

## 1. Quickstart (server-rendered cookie flow)

```ts
import { AuthRegistry, DelegatingPasswordEncoder, ScryptPasswordEncoder } from '@blue/auth-core';
import { CredentialsAuthAdapter, InMemoryUserStore, InMemorySessionStore } from '@blue/auth-server';

const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder() }, 'scrypt');

function initAuth(): void {
    AuthRegistry.register(
        new CredentialsAuthAdapter({
            userStore, // your UserStore — typically blue-orm backed (see §3)
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
`@blue/platform-node`; the `blue-session` cookie is HttpOnly +
SameSite=Lax + Path=/ + **Secure by default** (pass `{ secure: false }`
for localhost only). `NodeSessionInterceptor(sessionStore)` fills the
`request.session` bag (`principal`/`token`) before dispatch so
`requestSessionValue('principal')` binds for cookie-authenticated
requests.

## 2. Password hashing

`PasswordEncoder` (`encode`/`verify`/`needsRehash`) — Spring-shaped with
BlueJS names. Hashes are self-describing: `{scrypt}$ln=17,r=8,p=1$<salt>$<hash>`
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
over a `blue-orm` entity:

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

`InMemoryUserStore` (`@blue/auth-server`) ships for tests and demos — never
a production store. The credentials adapter equalizes timing for unknown
users (dummy-hash verify), so error responses should be one generic
message (`InvalidCredentialsError`); disabled accounts and accounts
without a hash never authenticate.

## 4. Server sessions (audit M4)

`SessionStore` (`kind`, `create`, `get`, `rotate`, `delete`) with TTL
enforced on read. Opaque 32-byte tokens — not JWTs: trivially revocable,
no replay window. `InMemorySessionStore` is the reference; Redis/LibSQL
implement the same contract later (the `kind` identifier matches
`QueueMessageStore`). Session **rotation** on login (fixation protection):
`rotate` deletes the old id before issuing the new one. Cookies:
HttpOnly + SameSite=Lax (+ Secure in production), `Max-Age=0` clear on
logout. Naming: `SESSION_COOKIE = 'blue-session'`.

## 5. Rate limiting login (SEC-6)

Credential endpoints are the brute-force surface — throttle them:

```ts
@postMapping('/login')
@rateLimit({ limit: 5, windowMs: 60_000 })
async login(credentials: unknown, route: Route) { … }
```

`@rateLimit` is passive metadata; `RateLimitInterceptor` (default-on in
`NodeAutoConfiguration.handlerMapping`, like security headers) enforces it
— routes without metadata are untouched. Denial: **429** +
`Retry-After` (seconds) problem document (`urn:blue:rate-limited`). The
key is the socket remote address (`NodeRequest.remoteAddress`);
`X-Forwarded-For` is deliberately NOT trusted (Tier-2 deferral) — behind a
proxy all clients share the proxy's address until trusted-proxy support
lands.

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
(or `csrf_token` body field) against the `blue-csrf` cookie
(SameSite=Lax + Secure by default); safe GETs mint the cookie. Without it,
login/logout never run — the interceptor denies before the handler.

**Posture note (2026-09-27 review, SEC-7):** where the interceptor is not
wired, a cross-site form POST can still carry the SameSite=Lax session
cookie to `POST /auth/logout` — forcing a logout (nuisance only: there is
no state to mutate and login is JSON-body + token). Use the interceptor
for any additional cookie-authenticated mutating route.

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
  (default 0 = always read, invalidated on refresh/logout).
- `refresh(token)` — **version-advancing rotation**: every refresh bumps
  `tokenVersion` and issues a new pair; all older tokens die. Reuse of a
  rotated-out refresh is rejected by construction — no ledger. This means
  concurrent access tokens also die on refresh: correct for short-lived
  access tokens (refresh happens on expiry); long-lived access tokens
  would need a `jti` ledger (follow-up).
- `logout(token)` — verifies, then bumps the version: the whole family
  dies at once.

## 8. Securing management endpoints (SEC-5)

`/health` and `/metrics` are **open by default** (documented posture).
Production recommendation: wire `ManagementAutoConfigurationOptions.
accessGuard` — `AuthRouteGuard` over the `'credentials'` adapter is the
intended fit. Bind-address separation and response redaction remain open
deferrals; keep the endpoints off public interfaces until then.

## 9. Deferrals (deliberate)

WebAuthn/passkeys, MFA, SAML, provider federation (OIDC client exists for
authorization-code + PKCE), RBAC beyond `@authorized`'s role list,
trusted-proxy client-IP resolution, persistent session-store backends,
argon2id (additive when needed), persistent JWT rotation ledger (needed
only for long-lived access tokens). None blocks the 1.0 credential +
session story.
