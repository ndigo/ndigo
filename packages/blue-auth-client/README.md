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

### OIDC Adapter

```typescript
import { OIDCAdapter } from '@blue/auth-client';
import { AuthRegistry } from '@blue/auth-core';

const adapter = new OIDCAdapter({
    issuer: 'https://accounts.google.com',
    clientId: 'your-client-id',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['openid', 'profile', 'email'],
});

AuthRegistry.register(adapter);
```

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
