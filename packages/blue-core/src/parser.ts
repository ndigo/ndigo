/**
 * Class-based interface for parsing a string into a structured value of type `T`.
 *
 * Represents the class-based form of `Converter<string, T>` from `@blue/core/converter`.
 * Implement this interface when the parser needs to be registered, injected, or composed as an object.
 * For standalone utility functions, use the `parse*` naming convention and type with
 * `Converter<string, T>` directly (imported from `'@blue/core'`).
 *
 * @example
 * ```typescript
 * // Class-based — implements Parser<T>
 * class MatrixString implements Parser<MatrixParams>, Stringifier<MatrixParams> {
 *     parse(value: string): MatrixParams { ... }
 *     stringify(value: MatrixParams): string { ... }
 * }
 *
 * // Standalone function — typed as Converter<string, T> (from @blue/core)
 * const parseWildcard: Converter<string, string> = (pattern) => ...;
 * ```
 *
 * @template T The type of the parsed value.
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
 * Represents the class-based form of `Converter<T, string>` from `@blue/core/converter`.
 * Implement this interface when the stringifier needs to be registered, injected, or composed as an object.
 * For standalone utility functions, use the `stringify*` or `to*` naming convention
 * and type with `Converter<T, string>` directly (imported from `'@blue/core'`).
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
