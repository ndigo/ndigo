import { type Principal } from '@blue/auth-core';
import { type AuthenticationState, type AuthResult } from '@blue/auth-core';
import { AuthRegistry } from '@blue/auth-core';

/**
 * Client-side authentication manager.
 *
 * Responsible for managing the authentication state, handling token storage,
 * and coordinating with authentication adapters for client-side flows
 * (e.g., redirects, callbacks, token storage).
 */
export class AuthClient {
    #state: AuthenticationState = {
        isAuthenticated: false,
        principal: null,
        token: null,
        expiresAt: null,
    };

    get state(): AuthenticationState {
        return this.#state;
    }

    get principal(): Principal | null {
        return this.#state.principal;
    }

    get isAuthenticated(): boolean {
        return this.#state.isAuthenticated;
    }

    /**
     * Authenticates the user using the specified adapter.
     *
     * @param adapterId - The ID of the adapter to use.
     * @param credentials - The credentials to authenticate with.
     * @returns The {@link AuthResult} containing the principal and token.
     */
    async authenticate(adapterId: string, credentials: any): Promise<AuthResult> {
        const adapter = AuthRegistry.getAdapter(adapterId);
        if (!adapter) {
            throw new Error(`Authentication adapter '${adapterId}' not found`);
        }

        const result = await adapter.authenticate(credentials);
        this.#updateState(result);
        return result;
    }

    /**
     * Validates the current token and updates the authentication state.
     *
     * @param adapterId - The ID of the adapter to use for validation.
     * @returns The validated {@link Principal}, or null if validation fails.
     */
    async validate(adapterId: string): Promise<Principal | null> {
        if (!this.#state.token) {
            return null;
        }

        const adapter = AuthRegistry.getAdapter(adapterId);
        if (!adapter) {
            throw new Error(`Authentication adapter '${adapterId}' not found`);
        }

        const principal = await adapter.validate(this.#state.token);
        if (principal) {
            this.#state.principal = principal;
            this.#state.isAuthenticated = true;
        } else {
            this.#logout();
        }
        return principal;
    }

    /**
     * Refreshes the current token.
     *
     * @param adapterId - The ID of the adapter to use for refresh.
     * @returns The updated {@link AuthResult}.
     */
    async refresh(adapterId: string): Promise<AuthResult> {
        if (!this.#state.token) {
            throw new Error('No token to refresh');
        }

        const adapter = AuthRegistry.getAdapter(adapterId);
        if (!adapter) {
            throw new Error(`Authentication adapter '${adapterId}' not found`);
        }

        const result = await adapter.refresh(this.#state.token);
        this.#updateState(result);
        return result;
    }

    /**
     * Logs out the user and clears the authentication state.
     *
     * @param adapterId - The ID of the adapter to use for logout.
     */
    async logout(adapterId: string): Promise<void> {
        if (this.#state.token) {
            const adapter = AuthRegistry.getAdapter(adapterId);
            if (adapter) {
                await adapter.logout(this.#state.token);
            }
        }
        this.#logout();
    }

    /**
     * Initializes the authentication state from a stored token.
     *
     * @param adapterId - The ID of the adapter to use for initial validation.
     * @param token - The token to initialize with.
     */
    async init(adapterId: string, token: string): Promise<void> {
        this.#state.token = token;
        await this.validate(adapterId);
    }

    #updateState(result: AuthResult): void {
        this.#state.isAuthenticated = result.principal !== null;
        this.#state.principal = result.principal;
        this.#state.token = result.token;
        this.#state.expiresAt = result.expiresAt;
    }

    #logout(): void {
        this.#state = {
            isAuthenticated: false,
            principal: null,
            token: null,
            expiresAt: null,
        };
    }
}
