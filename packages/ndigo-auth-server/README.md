# @ndigo/auth-server

> Server-side authentication coordination and JWT support for Ndigo — Node.js environments, adapters registered in `@ndigo/auth-core`.

`@ndigo/auth-server` provides server-side authentication coordination and JSON Web Token (JWT) support. It is designed for Node.js environments and works with adapters registered in `@ndigo/auth-core`.

## Installation

```bash
pnpm add @ndigo/auth-server
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```typescript
import { AuthServer } from '@ndigo/auth-server';

const authServer = new AuthServer();

// The adapter must already be registered via `AuthRegistry.register` —
// an unknown adapter id throws instead of allowing the token through.
const principal = await authServer.validate('oidc', 'eyJhbGc...');

if (principal) {
    console.log(`Validated: ${principal.name}`);
}
```

## Usage

### Multi-Adapter Validation

```typescript
import { AuthServer } from '@ndigo/auth-server';

const authServer = new AuthServer();

// Try an explicit list of adapters (in fallback order) until one succeeds.
// Unknown adapter IDs throw — a token can never be accepted by a scheme
// that was not deliberately selected.
const principal = await authServer.validateAny('token', ['oidc', 'jwt']);

if (principal) {
    console.log(`Authenticated via: ${principal.id}`);
}
```

### Using the Route Guard

`AuthRouteGuard` is a `RouteHandlerInterceptor`: register it on the handler
mapping and it enforces the `@authenticated` / `@authorized` metadata that
`@ndigo/auth-core` writes onto handlers, before dispatch. Handlers without
that metadata pass untouched.

```typescript
import { AuthRouteGuard, AuthServer } from '@ndigo/auth-server';
import { HTTPHeaders } from '@ndigo/http';
import { getNodeRequest } from '@ndigo/platform-node';
import { type Route } from '@ndigo/router';

const authServer = new AuthServer();

// Token extractor: return the credential for the route, or `null` to deny.
const bearerToken = (route: Route): string | null => {
    const authorization = HTTPHeaders.AUTHORIZATION.get(getNodeRequest(route)?.headers ?? {});
    return HTTPHeaders.AUTHORIZATION.bearerToken(authorization) ?? null;
};

// One guard validates against exactly one adapter id — never a fallback list.
const guard = new AuthRouteGuard(authServer, bearerToken, 'jwt');

// `mapping` is the application's handler mapping.
mapping.interceptors.push(guard);
```

Denials fail closed with an explicit `InterceptorDenial` — `401` for a
missing or invalid token, `403` for missing roles — overridable through the
fourth constructor argument (`{ unauthenticatedStatus, forbiddenStatus }`).

### Revoking every credential of a user

`CredentialsAuthAdapter.logoutAll(userId)` deletes all of the account's
opaque sessions and advances its `tokenVersion`, which also invalidates
every outstanding JWT issued for the account. Disabling or deleting the
account revokes without a call (validation consults the live account); the
explicit call is for password changes, lost devices, and admin actions.

```typescript
import { AuthRegistry } from '@ndigo/auth-core';
import { type CredentialsAuthAdapter } from '@ndigo/auth-server';

const credentials = AuthRegistry.getAdapter('credentials') as CredentialsAuthAdapter;
const { sessions, tokenVersion } = await credentials.logoutAll('user-42');
```

### JWT Adapter

`issuer`, `audience`, and `algorithm` are required. HMAC algorithms need a
`secret` of at least 32 bytes; asymmetric algorithms take a PEM `publicKey`
or a `jwksUrl`. With a `userStore` wired, the adapter also issues and rotates
first-party access/refresh tokens (`issueTokens`, `refresh`, `logout`).

```typescript
import { JWTAdapter } from '@ndigo/auth-server';
import { AuthRegistry } from '@ndigo/auth-core';

const adapter = new JWTAdapter({
    issuer: 'https://auth.example.com',
    audience: 'my-app',
    algorithm: 'HS256', // HMAC configs require a >= 32-byte secret
    secret: 'replace-me-with-a-32-byte-minimum-secret',
});

AuthRegistry.register(adapter);
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Classes** — `AuthServer`, `AuthRouteGuard`, `JWTAdapter`

## Development

```bash
pnpm --filter @ndigo/auth-server build:lib
pnpm --filter @ndigo/auth-server test
```

## See Also

- [@ndigo/auth-core](../ndigo-auth-core/README.md) — Core authentication contracts
- [@ndigo/auth-client](../ndigo-auth-client/README.md) — Client-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
