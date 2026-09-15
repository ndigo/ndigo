/**
 * @module blue-auth-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Principal } from './principal';

/**
 * Represents an authenticated user session.
 *
 * Sessions are managed by the framework and provide access to the current
 * principal, authentication token, and session lifecycle methods.
 */
export interface AuthSession {
    readonly principal: Principal | null;
    readonly token: string | null;
    readonly isAuthenticated: boolean;

    /**
     * Sets the principal and token, marking the session as authenticated.
     *
     * @param principal - The authenticated principal.
     * @param token - The session or access token.
     */
    setPrincipal(principal: Principal, token: string): void;

    /**
     * Clears the session, resetting to an unauthenticated state.
     */
    clear(): void;
}

/**
 * Default implementation of {@link AuthSession}.
 *
 * Stores the principal and token in private fields. Starts in an
 * unauthenticated state with no principal or token.
 */
export class DefaultAuthSession implements AuthSession {
    #principal: Principal | null = null;
    #token: string | null = null;

    get principal(): Principal | null {
        return this.#principal;
    }

    get token(): string | null {
        return this.#token;
    }

    get isAuthenticated(): boolean {
        return this.#principal !== null && this.#token !== null;
    }

    setPrincipal(principal: Principal, token: string): void {
        this.#principal = principal;
        this.#token = token;
    }

    clear(): void {
        this.#principal = null;
        this.#token = null;
    }
}
