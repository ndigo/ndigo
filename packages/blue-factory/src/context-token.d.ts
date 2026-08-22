/**
 * @author Jeff Rose
 */
/**
 * A type-safe key used for value registration and retrieval in a {@link Registry}.
 *
 * At runtime, {@link ContextToken.description|description} is used as the backing string key.
 * The generic parameter `T` provides compile-time type association.
 */
/**
 * A type-safe key used for value registration and retrieval in a {@link Registry}.
 *
 * At runtime, {@link ContextToken.description|description} is used as the backing string key.
 * The generic parameter `T` provides compile-time type association.
 * @template _T The type of the value associated with this token.
 */
export declare class ContextToken<_T> {
    /**
     * A descriptive string for the token, used as the backing key at runtime.
     */
    readonly description: string;
    /**
     * Creates a new ContextToken.
     * @param description A descriptive string for the token.
     */
    constructor(description: string);
    /**
     * Returns a string representation of the ContextToken.
     * @returns A string in the format `ContextToken(description)`.
     */
    toString(): string;
}
/**
 * Determines whether or not the `value` is a {@link ContextToken}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link ContextToken}.
 */
export declare const isContextToken: (value: unknown) => value is ContextToken<unknown>;
