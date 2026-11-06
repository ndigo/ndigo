/**
 */
import { type Principal } from '@ndigo/auth-core';
import { type AuthenticationState, type AuthResult } from '@ndigo/auth-core';
import { AuthRegistry } from '@ndigo/auth-core';

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

    /** The most recent refresh token a refresh-capable adapter returned. */
    #refreshToken: string | null = null;

    /** In-flight refresh promise, so concurrent refresh() calls share one exchange. */
    #refreshPromise: Promise<AuthResult> | null = null;

    get state(): AuthenticationState {
        return { ...this.#state };
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
    async authenticate(adapterId: string, credentials: unknown): Promise<AuthResult> {
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
     * Refreshes the current session.
     *
     * Presents the most recent refresh token captured from a refresh-capable
     * adapter (`AuthResult.refreshToken`), falling back to the session token
     * when none was issued. A rotated refresh token from the result replaces
     * the stored one; results without one leave it current.
     *
     * @param adapterId - The ID of the adapter to use for refresh.
     * @returns The updated {@link AuthResult}.
     */
    async refresh(adapterId: string): Promise<AuthResult> {
        if (this.#refreshPromise !== null) {
            return this.#refreshPromise;
        }

        const token = this.#refreshToken ?? this.#state.token;
        if (!token) {
            throw new Error('No token to refresh');
        }

        const adapter = AuthRegistry.getAdapter(adapterId);
        if (!adapter) {
            throw new Error(`Authentication adapter '${adapterId}' not found`);
        }

        this.#refreshPromise = (async () => {
            try {
                const result = await adapter.refresh(token);
                this.#updateState(result);
                return result;
            } finally {
                this.#refreshPromise = null;
            }
        })();

        return this.#refreshPromise;
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
        // Capture rotated refresh tokens; a null/absent one leaves the
        // previously captured token current (the provider still accepts it).
        if (typeof result.refreshToken === 'string' && result.refreshToken.length > 0) {
            this.#refreshToken = result.refreshToken;
        }
    }

    #logout(): void {
        this.#refreshToken = null;
        this.#state = {
            isAuthenticated: false,
            principal: null,
            token: null,
            expiresAt: null,
        };
    }
}
