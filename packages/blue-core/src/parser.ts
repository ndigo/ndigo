/**
 * @author Jeff Rose
 */

/**
 * General type conversion from `S` to `T`.
 *
 * This is the base concept for string-specific variants:
 * - **{@link Parser}** — class-based form of `Converter<string, T>` (use `parse*` functions for standalone utilities)
 * - **{@link Stringifier}** — class-based form of `Converter<T, string>` (use `stringify*` / `to*` for standalone utilities)
 *
 * For standalone conversion functions, type them directly as `Converter<S, T>`:
 *
 * @example
 * ```typescript
 * import type { Converter } from '@blue/core';
 *
 * const parseWildcard: Converter<string, string> =
 *     (pattern) => `^${pattern.replace(/\* /g, '.*?')}$`;
 *
 * const parseKeypath: Converter<string, KeypathToken[] | null> =
 *     (input) => { ... };
 * ```
 *
 * @template S The source type.
 * @template T The target type.
 */
export type Converter<S, T> = (source: S) => T;

/**
 * Class-based interface for parsing a string into a structured value of type `T`.
 *
 * Represents the class-based form of `Converter<string, T>`. Implement this interface
 * when the parser needs to be registered, injected, or composed as an object.
 * For standalone utility functions, use the `parse*` naming convention and
 * type with `Converter<string, T>` directly.
 *
 * @example
 * ```typescript
 * // Class-based — implements Parser<T>
 * class MatrixString implements Parser<MatrixParams>, Stringifier<MatrixParams> {
 *     parse(value: string): MatrixParams { ... }
 *     stringify(value: MatrixParams): string { ... }
 * }
 *
 * // Standalone function — typed as Converter<string, T>
 * const parseWildcard: Converter<string, string> = (pattern) => ...;
 * ```
 *
 * @template T The type of the parsed value.
 */
export interface Parser<T = any> {
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
 * Represents the class-based form of `Converter<T, string>`. Implement this interface
 * when the stringifier needs to be registered, injected, or composed as an object.
 * For standalone utility functions, use the `stringify*` or `to*` naming convention
 * and type with `Converter<T, string>` directly.
 *
 * @template T The type of the value to stringify.
 */
export interface Stringifier<T = any> {
    /**
     * Stringifies a value of type T into its string representation.
     * @param value - The value of type T to stringify.
     * @returns The string representation of the value.
     */
    stringify(value: T): string;
}
