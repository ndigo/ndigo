# @blue/auth-core

Core authentication contracts and utilities for the BlueJS framework.

## Overview

`@blue/auth-core` provides the foundational types, interfaces, and utilities for authentication in BlueJS. It is environment-agnostic and contains no browser or Node.js-specific code.

## Architecture

The package follows a **contract-first** approach:

```
@blue/auth-core          ← Contracts (AuthAdapter, Principal, AuthRegistry)
├── @blue/auth-client    ← Client-side implementation (AuthClient, OIDCAdapter)
└── @blue/auth-server    ← Server-side implementation (AuthServer, JWTAdapter)
```

## Exports

### Types

- **`Principal`** — Immutable representation of an authenticated user/entity
- **`AuthResult`** — Result of an authentication attempt
- **`AuthenticationState`** — Current authentication state
- **`AuthAdapter`** — Standardized interface for authentication providers

### Classes

- **`AnonymousPrincipal`** — Sentinel principal for unauthenticated users
- **`AuthRegistry`** — Central registry for authentication adapters

### Decorators

- **`@authenticated`** — Marks methods requiring authentication
- **`@authorized(roles?)`** — Marks methods requiring specific roles

### Utility Functions

- **`isPrincipal(value)`** — Duck-type guard for Principal

## Usage

### Registering an Adapter

```typescript
import { AuthRegistry } from '@blue/auth-core';
import { OIDCAdapter } from '@blue/auth-client';

const adapter = new OIDCAdapter({
    issuer: 'https://accounts.google.com',
    clientId: 'your-client-id',
});

AuthRegistry.register(adapter);
```

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

const principal: Principal = { /* ... */ };

if (principal.hasRole('admin')) {
    // User is an admin
}

if (principal.hasAnyRole('admin', 'moderator')) {
    // User has at least one of these roles
}
```

## Design Principles

1. **Immutability** — `Principal` is immutable to ensure identity stability
2. **Environment-agnostic** — No browser or Node.js dependencies
3. **Adapter pattern** — Pluggable authentication providers
4. **Passive decorators** — Metadata-only decorators; enforcement happens elsewhere

## Dependencies

- None (zero runtime dependencies)

## See Also

- [@blue/auth-client](../blue-auth-client/README.md) — Client-side authentication
- [@blue/auth-server](../blue-auth-server/README.md) — Server-side authentication
