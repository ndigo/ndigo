# @blue/auth-client

> Client-side authentication state management and OIDC for BlueJS — browser environments, works with `@blue/auth-core` adapters.

`@blue/auth-client` provides client-side authentication state management and OpenID Connect (OIDC) support. It is designed for browser environments and works with adapters registered in `@blue/auth-core`.

## Installation

```bash
pnpm add @blue/auth-client
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { AuthClient, AuthRegistry, OIDCAdapter } from '@blue/auth-client';

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
import { AuthClient } from '@blue/auth-client';

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
`@blue/auth-core` writes onto a route's handler. Call it before navigating:

```typescript
import { AuthClient, ClientAuthGuard } from '@blue/auth-client';

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

```typescript
import { OIDCAdapter, AuthRegistry } from '@blue/auth-client';

const adapter = new OIDCAdapter({
    issuer: 'https://accounts.google.com',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // confidential clients only
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['openid', 'profile', 'email'],
    discovery: true,
});
AuthRegistry.register(adapter);

// 1. Start the code flow and send the browser to the provider.
const request = await adapter.createAuthorizationRequest();
sessionStorage.setItem('oidc-state', request.state);
window.location.assign(request.url);

// 2. On the redirect URI, exchange the returned code. The `state` stored
//    in step 1 is single-use.
const code = new URLSearchParams(window.location.search).get('code');
const state = sessionStorage.getItem('oidc-state');
if (code && state) {
    const result = await adapter.exchangeCodeForTokens(code, state);
    console.log(result.principal?.name); // "John Doe"
}
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **Classes** — `AuthClient`, `ClientAuthGuard`, `OIDCAdapter`

## Development

```bash
pnpm --filter @blue/auth-client build:lib
pnpm --filter @blue/auth-client test
```

## See Also

- [@blue/auth-core](../blue-auth-core/README.md) — Core authentication contracts
- [@blue/auth-server](../blue-auth-server/README.md) — Server-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
