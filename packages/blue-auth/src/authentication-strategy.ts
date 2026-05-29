/**
 * @author Jeff Rose
 */

import { type Principal } from './principal';

/**
 * Pluggable strategy for authenticating a specific type of credentials.
 *
 * Implement this interface and register it with {@link AuthenticationManager}
 * to support a new credential form (username/password, JWT, OAuth token, etc.).
 *
 * @typeParam C - The concrete credentials type this strategy handles.
 */
export interface AuthenticationStrategy<C = unknown> {
    /**
     * Returns `true` if this strategy is capable of handling the given credentials.
     *
     * @param credentials - The credentials object to inspect.
     */
    supports(credentials: unknown): credentials is C;

    /**
     * Verifies the credentials and returns the authenticated principal.
     *
     * @param credentials - The credentials to verify (already confirmed by `supports`).
     * @returns The authenticated {@link Principal}, or `null` if authentication fails.
     */
    authenticate(credentials: C): Promise<Principal | null>;
}
