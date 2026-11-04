# @ndigo/auth-client

> Client-side authentication state management and OIDC for Ndigo — browser environments, works with `@ndigo/auth-core` adapters.

`@ndigo/auth-client` provides client-side authentication state management and OpenID Connect (OIDC) support. It is designed for browser environments and works with adapters registered in `@ndigo/auth-core`.

## Installation

```bash
pnpm add @ndigo/auth-client
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```typescript
import { AuthClient, AuthRegistry, OIDCAdapter } from '@ndigo/auth-client';

// OIDC is the built-in client-side adapter; it is fail-closed — one of
// `jwksUrl`, `discovery: true`, or `tokenValidator` is required.
const adapter = new OIDCAdapter({
    issuer: 'https://accounts.example.com',
    clientId: 'your-client-id',
    redirectUri: 'https://yourapp.example.com/callback',
    discovery: true,
});
AuthRegistry.register(adapter);

const auth = new AuthClient();

// Restore the session on app boot from the token saved after login
// (see "OIDC Adapter" below for the sign-in redirect flow).
const storedToken = sessionStorage.getItem('auth-token');
if (storedToken) {
    await auth.init('oidc', storedToken);
}

console.log(auth.isAuthenticated); // true once the token verifies
console.log(auth.principal?.name); // "John Doe"
```

## Usage

### Checking Authentication State

```typescript
import { AuthClient } from '@ndigo/auth-client';

const auth = new AuthClient();

if (auth.isAuthenticated) {
    console.log(`Logged in as: ${auth.principal?.name}`);
}

const principal = auth.principal;
if (principal?.hasRole('admin')) {
    // Show admin UI
}
```

### Using the Route Guard

`ClientAuthGuard` enforces the `@authenticated` / `@authorized` metadata that
`@ndigo/auth-core` writes onto a route's handler. Call it before navigating:

```typescript
import { AuthClient, ClientAuthGuard } from '@ndigo/auth-client';

const auth = new AuthClient();
const guard = new ClientAuthGuard(auth, '/login', '/forbidden');

// `handler` is the target route's handler object. Routes whose handler
// carries no auth metadata are allowed through.
const redirect = await guard.preNavigate(handler);
if (redirect) {
    // Denied — '/login' when unauthenticated, '/forbidden' when a required
    // role is missing.
    window.location.assign(redirect);
}
```

`preNavigate` returns `null` when navigation may proceed, otherwise the
redirect path. Constructor defaults are `/login` and `/forbidden`;
`setRedirects(loginRedirect, forbiddenRedirect)` updates them later.

### OIDC Adapter (fail-closed)

The `OIDCAdapter` requires a trusted token-verification source at construction — there is no claim-only mode. Choose one of:

- `jwksUrl` — fetch signing keys from the provider's JWKS endpoint.
- `discovery: true` — resolve endpoints from `{issuer}/.well-known/openid-configuration`; the document's `issuer` must match exactly.
- `tokenValidator` — a custom callback that performs signature verification.

It implements the authorization code flow with PKCE (S256), `state`, and `nonce`. `exchangeCodeForTokens(code, state)` consumes the pending `state` exactly once and verifies the ID token before returning an `AuthResult` — an unknown, expired, or replayed `state`, a malformed token response, or a signature/issuer/audience/nonce failure throws `OIDCError` without mutating authentication state. (`validate(token)` reports the same failures by returning `null`.) Public clients (SPAs) use PKCE without a secret; confidential servers add `clientSecret`.

The pending `state`, `nonce`, and PKCE verifier live in a `pendingStore`. The default store is in-memory and gives the adapter **instance affinity**: only the adapter instance that created the request can complete it. A provider redirect normally reloads the page (or lands on another server instance), so inject a store backed by storage shared with the callback — `sessionStorage` in a browser, Redis server-side — via the `pendingStore` option. Entries are single-use: the adapter deletes the entry on redemption, and unknown or expired states fail closed with `invalid_state`.

```typescript
import { OIDCAdapter, AuthRegistry, type PendingAuthorizationStore } from '@ndigo/auth-client';

// Pending flow state must outlive the page load the redirect triggers.
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

const adapter = new OIDCAdapter({
    issuer: 'https://accounts.google.com',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // confidential clients only
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['openid', 'profile', 'email'],
    discovery: true,
    pendingStore,
});
AuthRegistry.register(adapter);

// 1. Start the code flow and send the browser to the provider.
const request = await adapter.createAuthorizationRequest();
window.location.assign(request.url);

// 2. On the redirect URI — a fresh page load, and possibly a fresh adapter
//    instance sharing the same `pendingStore` — exchange the returned code.
//    The stored entry is single-use.
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');
if (code && state) {
    const result = await adapter.exchangeCodeForTokens(code, state);
    console.log(result.principal?.name); // "John Doe"
}
```

#### Refresh tokens

`exchangeCodeForTokens` captures the provider's `refresh_token` when one is issued and returns it as `result.refreshToken`, bound to the verified subject. `refresh(refreshToken)` exchanges it for a new token set: the response's ID token passes the full verification path (**no nonce** — the nonce binds the authorization flow only) and its subject must match the binding. Provider rejections (`400 invalid_grant` for expired, revoked, or already-rotated tokens) surface as `OIDCError` with code `invalid_token`, not as transport errors.

Whether a provider issues a refresh token is its policy, not the adapter's. Most follow the `offline_access` convention: request the scope in `scopes`, and where the provider gates it behind explicit consent (as `oidc-provider` does) also set `prompt: 'consent'` — without it the scope is silently dropped and no refresh token is issued. The embedded issuer in `apps/18-ndigo-auth-playground` (mode 6) shows both in a working flow.

Only tokens this adapter captured from its own exchanges (or a previous rotation) are redeemable — presenting an access or ID token is rejected before any network call (the SE-7 mirror: as refresh tokens never authenticate, access tokens never refresh). When the provider rotates (`refresh_token` in the response), the presented token is consumed **single-use**; when it does not, the presented token stays redeemable.

Bindings live in a `refreshStore` with the same instance-affinity contract as `pendingStore`: the default is in-memory and scoped to one adapter instance, so inject a shared store (`sessionStorage`, Redis) when a refresh may arrive on another instance — the isolated default rejects it with `invalid_token`.

`AuthClient` captures refresh tokens automatically and presents the most recent one on `client.refresh(adapterId)`, falling back to the session token for adapters that issue none:

```typescript
const result = await adapter.exchangeCodeForTokens(code, state);
console.log(result.refreshToken); // captured for the next refresh

// Later, when the access token is near expiry:
await client.refresh('oidc'); // exchanges, rotates, updates the client state
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Classes** — `AuthClient`, `ClientAuthGuard`, `OIDCAdapter`

## Development

```bash
pnpm --filter @ndigo/auth-client build:lib
pnpm --filter @ndigo/auth-client test
```

## See Also

- [@ndigo/auth-core](../ndigo-auth-core/README.md) — Core authentication contracts
- [@ndigo/auth-server](../ndigo-auth-server/README.md) — Server-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
