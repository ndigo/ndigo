# @ndigo/auth-core

> Core authentication contracts and utilities for Ndigo — environment-agnostic, zero runtime dependencies.

Core authentication contracts and utilities for the Ndigo framework. `@ndigo/auth-core` provides the foundational types, interfaces, and utilities for authentication in Ndigo. It is environment-agnostic and contains no browser or Node.js-specific code.

## Installation

```bash
pnpm add @ndigo/auth-core
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```typescript
import { AuthRegistry } from '@ndigo/auth-core';
import { OIDCAdapter } from '@ndigo/auth-client';

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
import { AuthRegistry } from '@ndigo/auth-core';

const adapter = AuthRegistry.getAdapter('oidc');
if (adapter) {
    const result = await adapter.authenticate({ username, password });
    console.log(result.principal);
}
```

### Checking Roles

```typescript
import { Principal } from '@ndigo/auth-core';

const principal: Principal = {/* ... */};

if (principal.hasRole('admin')) {
    // User is an admin
}

if (principal.hasAnyRole('admin', 'moderator')) {
    // User has at least one of these roles
}
```

### Password encoders

The scheme-agnostic `PasswordEncoder`/`DelegatingPasswordEncoder` contracts are
on the root export and safe to import anywhere. The **scrypt implementation is
Node-only** (it derives through `node:crypto`) and lives on a subpath, so a
browser bundle that imports the root never pulls a Node built-in:

```typescript
import { DelegatingPasswordEncoder } from '@ndigo/auth-core';
import { ScryptPasswordEncoder } from '@ndigo/auth-core/scrypt';

const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder() }, 'scrypt');
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Types** — `Principal`, `AuthResult`, `AuthenticationState`, `AuthAdapter`
- **Classes** — `AnonymousPrincipal`, `AuthRegistry`
- **Decorators** — `@authenticated`, `@authorized(roles?)`
- **Utility functions** — `likePrincipal(value)`

## Development

```bash
pnpm --filter @ndigo/auth-core build:lib
pnpm --filter @ndigo/auth-core test
```

## See Also

- [@ndigo/auth-client](../ndigo-auth-client/README.md) — Client-side authentication
- [@ndigo/auth-server](../ndigo-auth-server/README.md) — Server-side authentication

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
