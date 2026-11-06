/**
 */
import { type AuthAdapter } from './adapter';

/**
 * Central registry for authentication adapters.
 *
 * Allows the framework to support multiple authentication providers
 * (e.g., OIDC, SAML, JWT) by registering them at startup.
 */
export class AuthRegistry {
    private static readonly adapters = new Map<string, AuthAdapter>();

    /**
     * Registers an authentication adapter.
     * @param adapter - The adapter to register.
     */
    static register(adapter: AuthAdapter): void {
        this.adapters.set(adapter.id, adapter);
    }

    /**
     * Retrieves an adapter by its unique identifier.
     * @param id - The adapter ID.
     * @returns The adapter, or `undefined` if not found.
     */
    static getAdapter(id: string): AuthAdapter | undefined {
        return this.adapters.get(id);
    }

    /**
     * Returns all registered adapters.
     */
    static getAllAdapters(): AuthAdapter[] {
        return Array.from(this.adapters.values());
    }

    /**
     * Clears all registered adapters.
     */
    static clear(): void {
        this.adapters.clear();
    }
}
