/**
 * Interface for a service registry that maps service tokens to endpoints.
 * @module ndigo-service
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface ServiceRegistry {
    /**
     * Registers a service token with a specific endpoint.
     *
     * @param token - The unique token for the service.
     * @param endpoint - The endpoint URL for the service.
     */
    register(token: string, endpoint: string): void;
    /**
     * Resolves a service token to its endpoint.
     *
     * @param token - The service token.
     * @returns The endpoint URL, or null if not found.
     */
    getEndpoint(token: string): string | null;
    /**
     * Returns all registered service endpoints.
     *
     * @returns A map of tokens to endpoints.
     */
    getAllEndpoints(): Map<string, string>;
}

/**
 * Implementation of the ServiceRegistry using an in-memory Map.
 */
export class MapServiceRegistry implements ServiceRegistry {
    #endpoints: Map<string, string> = new Map();

    /**
     * Registers a service token with a specific endpoint.
     *
     * @param token - The unique token for the service.
     * @param endpoint - The endpoint URL for the service.
     */
    register(token: string, endpoint: string): void {
        this.#endpoints.set(token, endpoint);
    }

    /**
     * Resolves a service token to its endpoint.
     *
     * @param token - The service token.
     * @returns The endpoint URL, or null if not found.
     */
    getEndpoint(token: string): string | null {
        return this.#endpoints.get(token) ?? null;
    }

    /**
     * Returns all registered service endpoints.
     *
     * @returns A map of tokens to endpoints.
     */
    getAllEndpoints(): Map<string, string> {
        return new Map(this.#endpoints);
    }
}
