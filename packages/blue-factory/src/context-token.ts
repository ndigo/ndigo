/**
 * A type-safe key used for value registration and retrieval in a `Registry`.
 *
 * At runtime, `description` is used as the backing string key.
 * The generic parameter `T` provides compile-time type association.
 */
/**
 * A type-safe key used for value registration and retrieval in a `Registry`.
 *
 * At runtime, `description` is used as the backing string key.
 * The generic parameter `T` provides compile-time type association.
 * @template _T The type of the value associated with this token.
 */
export class ContextToken<_T> {
    /**
     * A descriptive string for the token, used as the backing key at runtime.
     */
    readonly description: string;

    /**
     * Optional semver range for the registered value, e.g. `'^1.0.0'`.
     * When set, the factory checks the resolved entry's version against this range
     * and warns on mismatch.
     */
    readonly requiredVersion?: string;

    /**
     * Creates a new ContextToken.
     * @param description A descriptive string for the token.
     * @param options - Optional configuration including `requiredVersion`.
     */
    constructor(description: string, options?: { requiredVersion?: string }) {
        this.description = description;
        this.requiredVersion = options?.requiredVersion;
    }

    /**
     * Returns a string representation of the ContextToken.
     * @returns A string in the format `ContextToken(description)`.
     */
    toString(): string {
        return `ContextToken(${this.description})`;
    }
}

/**
 * Determines whether or not the `value` is a {@link ContextToken}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link ContextToken}.
 */
export const isContextToken = (value: unknown): value is ContextToken<unknown> => value instanceof ContextToken;
