/**
 * @author Jeff Rose
 */

import { type AuthenticationStrategy } from './authentication-strategy';
import { type Principal } from './principal';

/**
 * Registry and delegation hub for {@link AuthenticationStrategy} instances.
 *
 * Register one or more strategies at startup; at runtime, call
 * {@link authenticate} with any credentials object and the manager will
 * forward to the first strategy that declares `supports(credentials) === true`.
 */
export class AuthenticationManager {
    #strategies: AuthenticationStrategy<any>[] = [];

    /**
     * Adds a strategy to the registry.
     *
     * @param strategy - The strategy to register.
     */
    register(strategy: AuthenticationStrategy<any>): void {
        this.#strategies.push(strategy);
    }

    /**
     * Authenticates the caller using the first matching strategy.
     *
     * @param credentials - Arbitrary credentials object (username/password, token, etc.)
     * @returns The authenticated {@link Principal}, or `null` if the strategy
     *   considers the credentials invalid.
     * @throws `Error` when no registered strategy supports the credentials shape.
     */
    async authenticate(credentials: unknown): Promise<Principal | null> {
        const strategy = this.#strategies.find((s) => s.supports(credentials));

        if (!strategy) {
            throw new Error('No AuthenticationStrategy supports the provided credentials');
        }

        return strategy.authenticate(credentials);
    }

    /** Number of registered strategies. */
    get strategyCount(): number {
        return this.#strategies.length;
    }
}
