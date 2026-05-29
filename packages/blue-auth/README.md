# Blue Auth

Blue Auth provides authentication and authorization infrastructure for BlueJS applications.

## Installation

```bash
pnpm add @blue/auth
```

## Core Concepts

### Principal
Represents an authenticated user or entity in the system. The `Principal` interface defines:
- `id`: Unique identifier for this principal
- `name`: Human-readable display name  
- `roles`: Roles assigned to this principal
- `hasRole(role)`: Checks if principal has a specific role
- `hasAnyRole(...roles)`: Checks if principal has at least one of the given roles

### Session
Represents an active user session. The `Session` interface manages:
- `principal`: The authenticated principal, or `null` when anonymous
- `token`: The bearer token for this session, or `null` when unauthenticated
- `isAuthenticated`: Boolean indicating if a principal has been set
- `setPrincipal(principal, token)`: Establishes an authenticated identity
- `clear()`: Clears the principal and token

### AuthenticationStrategy
Pluggable strategy for authenticating specific types of credentials. Implement this interface to support:
- `supports(credentials)`: Returns `true` if this strategy can handle the given credentials
- `authenticate(credentials)`: Verifies credentials and returns the authenticated principal

### AuthenticationManager
Registry and delegation hub for `AuthenticationStrategy` instances. Register strategies at startup and use `authenticate()` to verify credentials.

## Decorators

### `@authenticated`
Marks a class or method as requiring authentication:
- Applied to a **class**: every method on the controller requires auth
- Applied to a **method**: only that method requires auth

### `@authorized(role)`
Marks a class or method as requiring a specific role:
- Multiple decorators may be stacked — all declared roles must be present
- Example: `@authorized('admin')` and `@authorized('user')`

## Route Guard

### `AuthRouteGuard`
A `RouteHandlerInterceptor` that enforces authentication and authorization requirements. Register this guard with your handler mapping to block unauthenticated or insufficiently-privileged requests.

## HTTP Interceptor

### `AuthHeaderInterceptor`
An HTTP interceptor that injects an `Authorization: Bearer <token>` header into outgoing requests when the session is authenticated.

## Example Usage

```typescript
import { 
  AuthenticationManager, 
  AuthenticationStrategy, 
  Principal, 
  Session,
  DefaultSession,
  authenticated,
  authorized
} from '@blue/auth';

// Custom authentication strategy
class UsernamePasswordStrategy implements AuthenticationStrategy<{ username: string; password: string }> {
  supports(credentials: unknown): credentials is { username: string; password: string } {
    return (
      typeof credentials === 'object' &&
      credentials !== null &&
      'username' in credentials &&
      'password' in credentials
    );
  }

  async authenticate(credentials: { username: string; password: string }): Promise<Principal | null> {
    // Validate credentials and return principal or null
    if (credentials.username === 'admin' && credentials.password === 'secret') {
      return {
        id: '1',
        name: 'Admin User',
        roles: ['admin', 'user'],
        hasRole(role) { return this.roles.includes(role); },
        hasAnyRole(...roles) { return roles.some(r => this.roles.includes(r)); }
      };
    }
    return null;
  }
}

// Setup authentication
const session = new DefaultSession();
const authManager = new AuthenticationManager();
authManager.register(new UsernamePasswordStrategy());

// Login example
async function login(username: string, password: string) {
  const credentials = { username, password };
  const principal = await authManager.authenticate(credentials);
  
  if (principal) {
    // Set session with token
    session.setPrincipal(principal, 'jwt-token-here');
  }
}

// Protected controller example
@authenticated
class UserController {
  @authorized('admin')
  @authorized('user')
  async getUserInfo() {
    return { name: session.principal?.name };
  }
}
```