# @blue/auth-server

> Server-side authentication coordination and JWT support for BlueJS — Node.js environments, adapters registered in `@blue/auth-core`.

`@blue/auth-server` provides server-side authentication coordination and JSON Web Token (JWT) support. It is designed for Node.js environments and works with adapters registered in `@blue/auth-core`.

## Installation

```bash
pnpm add @blue/auth-server
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { AuthServer } from '@blue/auth-server';

const authServer = new AuthServer();

// Validate a token with a registered adapter
const principal = await authServer.validate('oidc', 'eyJhbGc...');

if (principal) {
    console.log(`Validated: ${principal.name}`);
}
```

## Usage

### Multi-Adapter Validation

```typescript
import { AuthServer } from '@blue/auth-server';

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

```typescript
import { AuthRouteGuard } from '@blue/auth-server';
import { AuthRegistry } from '@blue/auth-core';

const guard = new AuthRouteGuard('jwt');

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

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

- **Classes** — `AuthServer`, `AuthRouteGuard`, `JWTAdapter`

## Development

```bash
pnpm --filter @blue/auth-server build:lib
pnpm --filter @blue/auth-server test
```

## See Also

- [@blue/auth-core](../blue-auth-core/README.md) — Core authentication contracts
- [@blue/auth-client](../blue-auth-client/README.md) — Client-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
