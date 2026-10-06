/**
 * Registry for prototypes that have been decorated with `counted`.
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
export class CountedRegistry {
    private static readonly prototypes = new Set<object>();

    /**
     * Registers a prototype for instrumentation.
     * @param prototype - The class prototype to register.
     */
    static register(prototype: object): void {
        if (prototype) {
            this.prototypes.add(prototype);
        }
    }

    /**
     * Returns all registered prototypes.
     * @returns A set of registered prototypes.
     */
    static getPrototypes(): Set<object> {
        return this.prototypes;
    }

    /**
     * Clears the registry.
     */
    static clear(): void {
        this.prototypes.clear();
    }
}
