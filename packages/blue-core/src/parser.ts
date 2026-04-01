/**
 * @author Jeff Rose
 */

/**
 * Represents a parser that converts a string into a value of type T.
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
 * Represents a stringifier that converts a value of type T into a string.
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
