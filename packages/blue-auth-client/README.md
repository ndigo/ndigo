# @blue/auth-client

Client-side authentication for the BlueJS framework.

## Overview

`@blue/auth-client` provides client-side authentication state management and OpenID Connect (OIDC) support. It is designed for browser environments and works with adapters registered in `@blue/auth-core`.

## Architecture

```
@blue/auth-client
├── AuthClient          ← Client-side state management
├── ClientAuthGuard     ← Route guard for protected routes
└── OIDCAdapter         ← OIDC protocol implementation
```

## Exports

### Classes

- **`AuthClient`** — Client-side authentication manager
- **`ClientAuthGuard`** — Guard for protecting client-side routes
- **`OIDCAdapter`** — OIDC authentication adapter

## Usage

### Initializing AuthClient

```typescript
import { AuthClient } from '@blue/auth-client';

const auth = new AuthClient();

// Authenticate with a registered adapter
const result = await auth.authenticate('oidc', {
    username: 'user@example.com',
    password: 'secret',
});

console.log(auth.isAuthenticated); // true
console.log(auth.principal?.name);  // "John Doe"
```

### Checking Authentication State

```typescript
import { AuthClient } from '@blue/auth-client';

const auth = new AuthClient();

// Check if user is authenticated
if (auth.isAuthenticated) {
    console.log(`Logged in as: ${auth.principal?.name}`);
}

// Get current principal
const principal = auth.principal;
if (principal?.hasRole('admin')) {
    // Show admin UI
}
```

### Using the Route Guard

```typescript
import { ClientAuthGuard } from '@blue/auth-client';
import { AuthRegistry } from '@blue/auth-core';

const guard = new ClientAuthGuard('oidc');

// Protect a route
guard.canActivate('/admin').then((allowed) => {
    if (!allowed) {
        window.location.href = '/login';
    }
});
```

### OIDC Adapter (fail-closed)

The `OIDCAdapter` requires a trusted token-verification source at
construction — there is no claim-only mode. Choose one of:

- `jwksUrl` — fetch signing keys from the provider's JWKS endpoint.
- `discovery: true` — resolve endpoints (authorization, token, JWKS,
  end-session) from `{issuer}/.well-known/openid-configuration`. The
  discovery document's `issuer` must match exactly.
- `tokenValidator` — a custom callback that performs signature verification.

The adapter implements the authorization code flow with PKCE (S256), `state`,
and `nonce`:

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
```

```typescript
// 1. Start the flow (persist request.state; keep codeVerifier server-side)
const request = await adapter.createAuthorizationRequest();
window.location.href = request.url;

// 2. On your redirect URI, exchange the code (state is verified and single-use)
const result = await adapter.exchangeCodeForTokens(code, request.state);
console.log(result.principal?.name);
```

Failure modes (forged, unsigned, wrong issuer/audience, stale state, missing
PKCE, wrong nonce, malformed responses) throw `OIDCError` with a `code` such
as `invalid_state`, `invalid_nonce`, or `malformed_response` — without
mutating authentication state.

**Public vs. confidential clients:** public clients (SPAs, native apps)
should use PKCE without a secret; confidential servers add `clientSecret`.
Remote discovery/JWKS fetches are HTTPS-enforced (loopback exempt), bounded
by `fetchTimeoutMs` (default 10s) and `maxResponseBytes` (default 1 MiB).

## Design Principles

1. **State management** — `AuthClient` manages authentication state locally
2. **Adapter-based** — Works with any `AuthAdapter` registered in the core
3. **Immutable state** — Authentication state is read-only via getters
4. **Token lifecycle** — Handles token refresh and expiration automatically

## Dependencies

- `@blue/auth-core` — Core authentication contracts

## See Also

- [@blue/auth-core](../blue-auth-core/README.md) — Core authentication contracts
- [@blue/auth-server](../blue-auth-server/README.md) — Server-side authentication
