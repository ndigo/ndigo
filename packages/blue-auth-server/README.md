# @blue/auth-server

Server-side authentication for the BlueJS framework.

## Overview

`@blue/auth-server` provides server-side authentication coordination and JSON Web Token (JWT) support. It is designed for Node.js environments and works with adapters registered in `@blue/auth-core`.

## Architecture

```
@blue/auth-server
├── AuthServer          ← Server-side token validation
├── AuthRouteGuard      ← Route guard for protected routes
└── JWTAdapter          ← JWT token validation adapter
```

## Exports

### Classes

- **`AuthServer`** — Server-side authentication coordinator
- **`AuthRouteGuard`** — Guard for protecting server-side routes
- **`JWTAdapter`** — JWT token validation adapter

## Usage

### Initializing AuthServer

```typescript
import { AuthServer } from '@blue/auth-server';

const authServer = new AuthServer();

// Validate a token with a registered adapter
const principal = await authServer.validate('oidc', 'eyJhbGc...');

if (principal) {
    console.log(`Validated: ${principal.name}`);
}
```

### Multi-Adapter Validation

```typescript
import { AuthServer } from '@blue/auth-server';

const authServer = new AuthServer();

// Try all registered adapters until one succeeds
const principal = await authServer.validateAny('token');

if (principal) {
    console.log(`Authenticated via: ${principal.id}`);
}
```

### Using the Route Guard

```typescript
import { AuthRouteGuard } from '@blue/auth-server';
import { AuthRegistry } from '@blue/auth-core';

const guard = new AuthRouteGuard('jwt');

// Protect a route
guard.canActivate('/api/admin').then((allowed) => {
    if (!allowed) {
        return { status: 401, body: 'Unauthorized' };
    }
    return { status: 200, body: 'Authorized' };
});
```

### JWT Adapter

```typescript
import { JWTAdapter } from '@blue/auth-server';
import { AuthRegistry } from '@blue/auth-core';

const adapter = new JWTAdapter({
    secretOrKey: 'your-secret-key',
    algorithms: ['HS256', 'RS256'],
    issuer: 'https://auth.example.com',
});

AuthRegistry.register(adapter);
```

## Design Principles

1. **Token validation** — `AuthServer` validates tokens against registered adapters
2. **Multi-adapter support** — Can validate tokens from multiple providers
3. **Immutable state** — No mutable state; all operations are read-only
4. **Adapter-based** — Works with any `AuthAdapter` registered in the core

## Dependencies

- `@blue/auth-core` — Core authentication contracts

## See Also

- [@blue/auth-core](../blue-auth-core/README.md) — Core authentication contracts
- [@blue/auth-client](../blue-auth-client/README.md) — Client-side authentication
