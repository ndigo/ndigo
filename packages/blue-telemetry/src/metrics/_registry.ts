/**
 * Registry for prototypes that have been decorated with `@counted`.
 * This allows the `CountedInstrumentation` to discover and wrap these methods
 * without the decorator itself having to perform the wrapping.
 */
export class CountedRegistry {
    private static readonly prototypes = new Set<any>();

    /**
     * Registers a prototype for instrumentation.
     * @param prototype - The class prototype to register.
     */
    static register(prototype: any): void {
        if (prototype) {
            this.prototypes.add(prototype);
        }
    }

    /**
     * Returns all registered prototypes.
     * @returns A set of registered prototypes.
     */
    static getPrototypes(): Set<any> {
        return this.prototypes;
    }

    /**
     * Clears the registry.
     */
    static clear(): void {
        this.prototypes.clear();
    }
}
