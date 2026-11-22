/**
 * Interface for a service registry that maps service tokens to endpoints.
 */
export interface ServiceRegistry {
    /**
     * Registers a service token with a specific endpoint.
     *
     * @param token - The unique token for the service.
     * @param endpoint - The endpoint URL for the service.
     *
     * @example
     * ```ts
     * registry.register('accounts', 'https://api.example.com');
     * ```
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
 *
 * @example
 * ```ts
 * const registry = new MapServiceRegistry();
 * registry.register('UserService', client);
 * ```
 */
export class MapServiceRegistry implements ServiceRegistry {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MapServiceRegistry".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MapServiceRegistry]"
     */
    get [Symbol.toStringTag](): string {
        return 'MapServiceRegistry';
    }

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
