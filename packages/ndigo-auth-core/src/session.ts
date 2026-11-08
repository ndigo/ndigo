/**
 * The auth-session contract and default implementation.
 */
import { type Principal } from './principal';

/**
 * Represents an authenticated user session.
 *
 * Sessions are managed by the framework and provide access to the current
 * principal, authentication token, and session lifecycle methods.
 */
export interface AuthSession {
    /** The authenticated principal, or `null`. */
    readonly principal: Principal | null;
    /** The session/access token, or `null`. */
    readonly token: string | null;
    /** Whether both a principal and token are set. */
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

    /**
     * The authenticated principal, or `null`.
     */
    get principal(): Principal | null {
        return this.#principal;
    }

    /**
     * The session/access token, or `null`.
     */
    get token(): string | null {
        return this.#token;
    }

    /**
     * Whether both a principal and token are set.
     */
    get isAuthenticated(): boolean {
        return this.#principal !== null && this.#token !== null;
    }

    /**
     * Sets the principal and token, marking the session authenticated.
     *
     * @param principal - The authenticated principal.
     * @param token - The session or access token.
     */
    setPrincipal(principal: Principal, token: string): void {
        this.#principal = principal;
        this.#token = token;
    }

    /**
     * Clears the session.
     */
    clear(): void {
        this.#principal = null;
        this.#token = null;
    }
}
