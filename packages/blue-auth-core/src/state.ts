/**
 * @module blue-auth-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Principal } from './principal';

/**
 * The result of an authentication attempt.
 */
export interface AuthResult {
    /** The authenticated principal, or null if authentication failed. */
    principal: Principal | null;
    /** The session token issued by the provider. */
    token: string | null;
    /** Expiration timestamp in milliseconds. */
    expiresAt: number | null;
}

/**
 * Represents the current authentication state of a user.
 */
export interface AuthenticationState {
    /** Whether the user is currently authenticated. */
    isAuthenticated: boolean;
    /** The current principal, or null if unauthenticated. */
    principal: Principal | null;
    /** The active session token. */
    token: string | null;
    /** Expiration timestamp in milliseconds. */
    expiresAt: number | null;
}
