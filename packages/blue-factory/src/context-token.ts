/**
 * @author Jeff Rose
 */

/**
 * A type-safe key used for value registration and retrieval in a {@link Registry}.
 *
 * At runtime, {@link ContextToken.description|description} is used as the backing string key.
 * The generic parameter `T` provides compile-time type association.
 */
export class ContextToken<_T> {
    readonly description: string;

    constructor(description: string) {
        this.description = description;
    }

    toString(): string {
        return `ContextToken(${this.description})`;
    }
}

/**
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the `value` provided is a {@link ContextToken}.
 */
export const likeContextToken = (value: unknown): value is ContextToken<unknown> => value instanceof ContextToken;
