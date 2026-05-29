/**
 * @author Jeff Rose
 */

import { type Principal } from './principal';

/**
 * Represents an active user session.
 */
export interface Session {
    /** The authenticated principal, or `null` when anonymous. */
    readonly principal: Principal | null;

    /** The bearer token for this session, or `null` when unauthenticated. */
    readonly token: string | null;

    /** `true` when a principal has been set on this session. */
    readonly isAuthenticated: boolean;

    /**
     * Establishes an authenticated identity on this session.
     *
     * @param principal - The authenticated principal.
     * @param token - The bearer token to propagate on outbound requests.
     */
    setPrincipal(principal: Principal, token: string): void;

    /** Clears the principal and token, returning the session to anonymous state. */
    clear(): void;
}

/**
 * In-memory implementation of {@link Session}.
 *
 * A single `DefaultSession` instance is typically registered as a singleton
 * in the application context so all components share the same auth state.
 */
export class DefaultSession implements Session {
    #principal: Principal | null = null;
    #token: string | null = null;

    get principal(): Principal | null {
        return this.#principal;
    }

    get token(): string | null {
        return this.#token;
    }

    get isAuthenticated(): boolean {
        return this.#principal !== null;
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

/**
 * Duck-type guard — returns `true` when `value` looks like a {@link Session}.
 *
 * @param value - The value to inspect.
 */
export function isSession(value: unknown): value is Session {
    return (
        typeof value === 'object' &&
        value !== null &&
        'principal' in value &&
        'token' in value &&
        'isAuthenticated' in value &&
        'setPrincipal' in value &&
        'clear' in value
    );
}
