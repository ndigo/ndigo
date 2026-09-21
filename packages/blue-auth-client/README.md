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
import { AuthClient } from '@blue/auth-client';

const auth = new AuthClient();

// Authenticate with a registered adapter
const result = await auth.authenticate('oidc', {
    username: 'user@example.com',
    password: 'secret',
});

console.log(auth.isAuthenticated); // true
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

```typescript
import { ClientAuthGuard } from '@blue/auth-client';
import { AuthRegistry } from '@blue/auth-core';

const guard = new ClientAuthGuard('oidc');

guard.canActivate('/admin').then((allowed) => {
    if (!allowed) {
        window.location.href = '/login';
    }
});
```

### OIDC Adapter (fail-closed)

The `OIDCAdapter` requires a trusted token-verification source at construction — there is no claim-only mode. Choose one of:

- `jwksUrl` — fetch signing keys from the provider's JWKS endpoint.
- `discovery: true` — resolve endpoints from `{issuer}/.well-known/openid-configuration`; the document's `issuer` must match exactly.
- `tokenValidator` — a custom callback that performs signature verification.

It implements the authorization code flow with PKCE (S256), `state`, and `nonce`. A token that is forged, unsigned, or has the wrong issuer/audience/state/nonce throws `OIDCError` without mutating authentication state. Public clients (SPAs) use PKCE without a secret; confidential servers add `clientSecret`.

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

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

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
