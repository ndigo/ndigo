# Guide 27 — Browser Authentication & OIDC

Browser apps need three things a server session already has: a current
principal, a guard that redirects unauthenticated navigation, and a safe way to
obtain tokens from an identity provider. `@ndigo/auth-client` supplies all
three, with a fail-closed OIDC adapter and no claim-only shortcut.

This guide is the browser counterpart to [guide 26](26-authentication-and-sessions.md) (server credentials, sessions,
and JWT). It shows the client state, the route guard, the authorization-code +
PKCE flow, refresh handling, and the server callback bridge used by the
playground app.

**Audience:** Browser application developers · **Prerequisites:** [Guide 02](02-building-a-browser-app.md) and [guide 26](26-authentication-and-sessions.md) · **Reference app:** `[apps/18-ndigo-auth-playground](https://github.com/ndigo/ndigo/tree/main/apps/18-ndigo-auth-playground)`

## What you'll learn

- Hold authentication state in `AuthClient` and restore it on boot.
- Guard navigation with the `@authenticated`/`@authorized` metadata.
- Configure the OIDC adapter without weakening token verification.
- Run the code + PKCE flow with a shared pending store.
- Refresh tokens and bridge the callback to a server session.

## 1. Client state

`AuthClient` is a small state holder over the adapters registered in
`AuthRegistry`:

```ts
import { AuthClient } from '@ndigo/auth-client';

const auth = new AuthClient();

auth.isAuthenticated; // boolean
auth.principal; // Principal | null
auth.principal?.hasRole('admin');
auth.state; // snapshot: principal, token, expiresAt
```

Adapters do the verification. `authenticate(adapterId, credentials)` runs an
adapter's credentials flow, `validate(adapterId)` re-checks the current token,
`init(adapterId, token)` restores a session after a reload, and
`logout(adapterId)` clears the state.

```ts
const stored = sessionStorage.getItem('auth-token');
if (stored) {
    await auth.init('oidc', stored);
}
```

Where you store the token is a security decision: `sessionStorage` limits
lifetime but is still readable by injected script. A server-owned `HttpOnly`
session cookie is the stronger option when the backend can hold the token; the
browser then keeps only the auth state, not the credential.

## 2. The route guard

`ClientAuthGuard` reads the same auth metadata the server guard uses
(`@authenticated` / `@authorized`) and returns a redirect path or `null`:

```ts
import { ClientAuthGuard } from '@ndigo/auth-client';

const guard = new ClientAuthGuard(auth, '/login', '/forbidden');
const redirect = await guard.preNavigate(handler);
if (redirect) {
    window.location.assign(redirect);
}
```

A route with no auth metadata is allowed. A missing principal redirects to
login; a missing role redirects to forbidden. Call the guard before the router
commits the navigation, so the protected view never renders for an
unauthenticated user.

## 3. OIDC without a weaker mode

`OIDCAdapter` requires one trusted verification source at construction:

- `jwksUrl` — verify signatures against the provider's JWKS.
- `discovery: true` — fetch `{issuer}/.well-known/openid-configuration`; the
 document's `issuer` must match exactly.
- `tokenValidator` — a custom signature-verification callback.

There is no claim-only mode. Construction throws if none is provided.

```ts
import { AuthRegistry, OIDCAdapter } from '@ndigo/auth-client';

const adapter = new OIDCAdapter({
    issuer: 'https://accounts.example.com',
    clientId: 'your-client-id',
    redirectUri: 'https://app.example.com/callback',
    scopes: ['openid', 'profile', 'email'],
    discovery: true,
});

AuthRegistry.register(adapter);
```

Public SPAs use PKCE without a client secret; confidential clients add
`clientSecret`. The adapter implements the authorization-code flow with PKCE
(S256), `state`, and `nonce`; `exchangeCodeForTokens` consumes the pending state
exactly once and verifies the ID token before returning an `AuthResult`.

## 4. The pending store

The pending `state`, `nonce`, and PKCE verifier normally live in memory, which
ties the flow to one adapter instance. A provider redirect reloads the page (or
lands on another instance), so inject a store backed by storage the callback can
read:

```ts
import { OIDCAdapter, type PendingAuthorizationStore } from '@ndigo/auth-client';

const pendingStore: PendingAuthorizationStore = {
    kind: 'session-storage',
    get: async (state) => {
        const raw = sessionStorage.getItem(`oidc-pending:${state}`);
        return raw ? JSON.parse(raw) : null;
    },
    set: async (state, pending) => {
        sessionStorage.setItem(`oidc-pending:${state}`, JSON.stringify(pending));
    },
    delete: async (state) => {
        sessionStorage.removeItem(`oidc-pending:${state}`);
    },
};
```

Use the same idea for `refreshStore` when a refresh may arrive on another
instance (or a server-side Redis store for confidential clients). Entries are
single-use; an unknown, expired, or replayed state fails closed with
`invalid_state`.

## 5. The flow

```ts
// 1. Start the flow.
const request = await adapter.createAuthorizationRequest();
window.location.assign(request.url);

// 2. On the redirect URI (a fresh page load):
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');
if (code && state) {
    const result = await adapter.exchangeCodeForTokens(code, state);
    if (result.token) await auth.init('oidc', result.token);
}
```

`exchangeCodeForTokens` returns the principal, token, expiry, and — when the
provider issues one — a `refreshToken` bound to the verified subject.
`client.refresh('oidc')` presents the most recent refresh token, rotates it
when the provider rotates, and updates the client state. A provider rejection
(`400 invalid_grant` for expired/revoked/rotated tokens) surfaces as an
`OIDCError` with code `invalid_token`, not a transport error.

Many providers gate refresh tokens behind `offline_access` and explicit
consent: request the scope, and set `prompt: 'consent'` where required. Without
it, the scope is silently dropped and no refresh token is issued.

## 6. The server callback bridge

A browser-only flow leaves the refresh token in the browser. The playground's
mode 6 demonstrates the stronger shape: the server owns the OIDC client, the
callback captures the provider refresh token server-side, and the browser gets
an opaque `HttpOnly` session cookie instead. The client then only calls
`/auth/me`-style endpoints; it never sees the refresh token.

Use the browser-only flow when the backend cannot hold the token; use the
server bridge when it can. The server side is [guide 26](26-authentication-and-sessions.md); the playground's
`oidc-controller.ts` is the reference implementation.

## 7. Pitfalls

- **No claim-only verification.** The adapter refuses to construct without
 JWKS, discovery, or a custom validator.
- **The default pending store is instance-affine.** A page reload without a
 shared store fails the state check.
- **State and nonce are single-use.** Do not retry an exchange with the same
 state; restart the flow.
- **A refresh token is not an access token.** Presenting an access/ID token to
 `refresh` is rejected before any network call.
- **Client state is not authorization.** The server must still enforce roles;
 the browser guard is UX, not a security boundary.
- **`sessionStorage` is not a vault.** Prefer an `HttpOnly` server session when
 the backend can own the credential.

## See also

- [Guide 26 — Authentication & Sessions](26-authentication-and-sessions.md) — server credentials, sessions, JWT, and the callback bridge
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser preset and router
- [Guide 28 — Security Hardening](28-security-hardening.md) — cookies, CORS, and CSRF
- [`@ndigo/auth-client`](../../packages/ndigo-auth-client/README.md) — `AuthClient`, guard, OIDC adapter
- [[apps/18-ndigo-auth-playground](https://github.com/ndigo/ndigo/tree/main/apps/18-ndigo-auth-playground)](../../[apps/18-ndigo-auth-playground](https://github.com/ndigo/ndigo/tree/main/apps/18-ndigo-auth-playground)/README.md) — six auth modes, including OIDC + PKCE
- and — auth and revocation decisions
