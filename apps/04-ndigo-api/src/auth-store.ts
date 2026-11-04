/**
 * Demo authentication wiring (AD-33 Wave 2): replaces the hand-rolled
 * `demo-token-*` map with the framework machinery — scrypt-hashed demo
 * users, a {@link CredentialsAuthAdapter} over an in-memory session store,
 * registered on the existing {@link AuthRegistry} seam.
 *
 * The public functions keep their historical signatures so the socket
 * authenticator, note controllers and integration tests needed no changes:
 * `authenticate`/`lookupPrincipal`/`invalidateToken` now back onto the
 * 'credentials' adapter (session store) instead of a token map.
 *
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AuthRegistry, type Principal, DelegatingPasswordEncoder } from '@ndigo/auth-core';
import { ScryptPasswordEncoder } from '@ndigo/auth-core/scrypt';
import { CredentialsAuthAdapter, InMemoryUserStore, InMemorySessionStore } from '@ndigo/auth-server';

const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder() }, 'scrypt');

/**
 * Initializes the demo authentication system: two demo accounts
 * (`admin`/`alice`, password `demo`, scrypt-hashed at boot) and the
 * 'credentials' adapter registered for the framework seam.
 */
export function initAuth(): void {
    const userStore = new InMemoryUserStore([
        { id: 'admin', username: 'admin', passwordHash: encoder.encode('demo'), roles: ['admin', 'user'] },
        { id: 'alice', username: 'alice', passwordHash: encoder.encode('demo'), roles: ['user'] },
    ]);
    AuthRegistry.register(
        new CredentialsAuthAdapter({
            userStore,
            passwordEncoder: encoder,
            sessionStore: new InMemorySessionStore(),
        })
    );
}

function credentialsAdapter(): CredentialsAuthAdapter {
    const adapter = AuthRegistry.getAdapter('credentials');
    if (!adapter) {
        throw new Error('initAuth() must run before any auth flow');
    }
    return adapter as CredentialsAuthAdapter;
}

/**
 * Authenticates a user and returns the opaque session token, or `null`
 * on any failure (one generic denial — no user enumeration).
 */
export async function authenticate(username: string, password: string): Promise<string | null> {
    try {
        const result = await credentialsAdapter().authenticate({ username, password });
        return result.token;
    } catch {
        return null;
    }
}

/**
 * Resolves a session token to its principal, or `null` when unknown,
 * expired or revoked.
 */
export function lookupPrincipal(token: string): Promise<Principal | null> {
    return credentialsAdapter().validate(token);
}

/**
 * Terminates the session behind `token`.
 */
export async function invalidateToken(token: string): Promise<void> {
    await credentialsAdapter().logout(token);
}
