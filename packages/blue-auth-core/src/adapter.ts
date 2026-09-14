/**
 * @module blue-auth-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Principal } from './principal';
import { type AuthResult } from './state';

/**
 * A standardized adapter for authentication providers.
 *
 * Implementations of this interface handle the protocol-specific logic
 * (e.g., OAuth2, OIDC, SAML) to verify identities and manage sessions.
 */
export interface AuthAdapter {
    /**
     * The unique identifier for this adapter (e.g., 'oidc', 'saml').
     */
    readonly id: string;

    /**
     * Validates a session token and returns the associated principal.
     *
     * @param token - The session or access token to validate.
     * @returns The authenticated {@link Principal}, or `null` if the token is invalid or expired.
     */
    validate(token: string): Promise<Principal | null>;

    /**
     * Performs the primary authentication flow.
     *
     * @param credentials - The credentials provided by the user. Adapters
     * narrow this opaque value to their protocol-specific credential shape.
     * @returns An {@link AuthResult} containing the principal and session token.
     */
    authenticate(credentials: unknown): Promise<AuthResult>;

    /**
     * Refreshes an existing session token.
     *
     * @param token - The token to refresh.
     * @returns A new {@link AuthResult} with the updated token.
     */
    refresh(token: string): Promise<AuthResult>;

    /**
     * Terminates the session associated with the given token.
     *
     * @param token - The token to invalidate.
     */
    logout(token: string): Promise<void>;
}
