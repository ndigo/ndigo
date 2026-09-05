import { AuthRegistry, Principal } from '@blue/auth-core';
import { JWTAdapter } from '@blue/auth-server';

// Demo credentials
const DEMO_USERS = [
    { username: 'admin', password: 'demo', roles: ['admin', 'user'] },
    { username: 'alice', password: 'demo', roles: ['user'] },
];

// In-memory token → Principal store
const tokenStore = new Map<string, Principal>();

/**
 * Initializes the authentication system with demo configuration.
 */
export function initAuth(): void {
    // Register a JWT adapter for token validation (simplified for demo)
    const jwtAdapter = new JWTAdapter({
        issuer: 'blue-api',
        audience: 'blue-api-api',
        secret: 'demo-secret-key',
        algorithm: 'HS256',
    });
    AuthRegistry.register(jwtAdapter);
}

/**
 * Authenticates a user with username/password and returns a demo token.
 *
 * @param username - The username.
 * @param password - The password.
 * @returns The demo token, or null if authentication fails.
 */
export async function authenticate(username: string, password: string): Promise<string | null> {
    const user = DEMO_USERS.find((u) => u.username === username && u.password === password);
    if (!user) return null;

    const principal: Principal = {
        id: user.username,
        name: user.username,
        roles: user.roles,
        hasRole(role: string) {
            return this.roles.includes(role);
        },
        hasAnyRole(...roles: string[]) {
            return roles.some((r) => this.roles.includes(r));
        },
    };

    const token = `demo-token-${principal.id}-${Date.now()}`;
    tokenStore.set(token, principal);
    return token;
}

/**
 * Looks up a principal by token.
 *
 * @param token - The token to look up.
 * @returns The principal, or null if not found.
 */
export function lookupPrincipal(token: string): Principal | null {
    return tokenStore.get(token) ?? null;
}

/**
 * Invalidates a token (logs out the user).
 *
 * @param token - The token to invalidate.
 */
export function invalidateToken(token: string): void {
    tokenStore.delete(token);
}
