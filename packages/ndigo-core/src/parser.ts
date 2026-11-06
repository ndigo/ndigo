/**
 * Class-based interface for parsing a string into a structured value of type `T`.
 */
export interface Parser<T = unknown> {
    /**
     * Parses a string value into a value of type T.
     * @param value - The string value to parse.
     * @returns The parsed value of type T.
     */
    parse(value: string): T;
}

/**
 * Class-based interface for serializing a value of type `T` into a string.
 *
 * Represents the class-based form of `Converter<T, string>` from `@ndigo/core/converter`.
 * Implement this interface when the stringifier needs to be registered, injected, or composed as an object.
 * For standalone utility functions, use the `stringify*` or `to*` naming convention
 * and type with `Converter<T, string>` directly (imported from `'@ndigo/core'`).
 *
 * @template T The type of the value to stringify.
 */
export interface Stringifier<T = unknown> {
    /**
     * Stringifies a value of type T into its string representation.
     * @param value - The value of type T to stringify.
     * @returns The string representation of the value.
     */
    stringify(value: T): string;
}
