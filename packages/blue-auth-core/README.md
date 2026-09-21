# @blue/auth-core

> Core authentication contracts and utilities for BlueJS — environment-agnostic, zero runtime dependencies.

Core authentication contracts and utilities for the BlueJS framework. `@blue/auth-core` provides the foundational types, interfaces, and utilities for authentication in BlueJS. It is environment-agnostic and contains no browser or Node.js-specific code.

## Installation

```bash
pnpm add @blue/auth-core
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { AuthRegistry } from '@blue/auth-core';
import { OIDCAdapter } from '@blue/auth-client';

// Fail-closed: signature verification is mandatory (jwksUrl, discovery, or
// an explicit tokenValidator). There is no claim-only mode.
const adapter = new OIDCAdapter({
    issuer: 'https://accounts.google.com',
    clientId: 'your-client-id',
    redirectUri: 'https://yourapp.com/callback',
    discovery: true,
});
AuthRegistry.register(adapter);
```

## Usage

### Using the Registry

```typescript
import { AuthRegistry } from '@blue/auth-core';

const adapter = AuthRegistry.getAdapter('oidc');
if (adapter) {
    const result = await adapter.authenticate({ username, password });
    console.log(result.principal);
}
```

### Checking Roles

```typescript
import { Principal } from '@blue/auth-core';

const principal: Principal = {/* ... */};

if (principal.hasRole('admin')) {
    // User is an admin
}

if (principal.hasAnyRole('admin', 'moderator')) {
    // User has at least one of these roles
}
```

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

- **Types** — `Principal`, `AuthResult`, `AuthenticationState`, `AuthAdapter`
- **Classes** — `AnonymousPrincipal`, `AuthRegistry`
- **Decorators** — `@authenticated`, `@authorized(roles?)`
- **Utility functions** — `likePrincipal(value)`

## Development

```bash
pnpm --filter @blue/auth-core build:lib
pnpm --filter @blue/auth-core test
```

## See Also

- [@blue/auth-client](../blue-auth-client/README.md) — Client-side authentication
- [@blue/auth-server](../blue-auth-server/README.md) — Server-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
