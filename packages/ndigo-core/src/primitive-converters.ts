/**
 * Built-in converters for primitive and standard runtime types.
 */
import type { Converter } from './converter.js';

// ---------------------------------------------------------------------------
// Built-in Converter Implementations
// ---------------------------------------------------------------------------

/** UUID v4 format: xxxxxxxx-xxxx-Vxxx-Yxxx-xxxxxxxxxxxx where V is version (0-f), Y is variant (8/b) */
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Converts string values to lowercase UUID strings (validation + normalization).
 *
 * @example
 * ```ts
 * const converter = new UUIDConverter();
 * converter.convert('123E4567-E89B-12D3-A456-426614174000'); // '123e4567-e89b-12d3-a456-426614174000'
 * ```
 */
export class UUIDConverter implements Converter<string, string> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "UUIDConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object UUIDConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'UUIDConverter';
    }

    /** Converts a string to a normalized lowercase UUID. @param value - The UUID string to normalize. @returns The normalized UUID. */
    convert(value: string): string {
        const normalized = value.trim().toLowerCase();

        if (!uuidPattern.test(normalized)) {
            throw new TypeError(`Invalid UUID format: ${value}`);
        }

        return normalized;
    }
}

/**
 * Converts strings to `Date` instances.
 *
 * Accepts any input that `new Date()` accepts (ISO 8601, timestamps, relative dates).
 * Validates the date is actually valid (not a normalized invalid date like Feb 29 in non-leap years).
 *
 * @example
 * ```ts
 * const converter = new DateConverter();
 * const date = converter.convert('2024-01-15T00:00:00Z'); // Date
 * ```
 */
export class DateConverter implements Converter<string, Date> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DateConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DateConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'DateConverter';
    }

    /** Parses a string into a `Date`. @param value - The date string. @returns The parsed date. */
    convert(value: string): Date {
        const date = new Date(value);

        // JavaScript silently normalizes invalid dates (e.g., "2023-02-29" becomes March 1)
        if (isNaN(date.getTime())) {
            throw new TypeError(`Invalid date value: ${value}`);
        }

        return date;
    }
}

/**
 * Converts strings to parsed JSON values via `JSON.parse`.
 *
 * @example
 * ```ts
 * const converter = new JSONConverter();
 * const parsed = converter.convert('{"name":"ndigo"}'); // { name: 'ndigo' }
 * ```
 */
export class JSONConverter implements Converter<string, unknown> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "JSONConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object JSONConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'JSONConverter';
    }

    /** Parses a string as JSON. @param value - The JSON string. @returns The parsed value. */
    convert(value: string): unknown {
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new TypeError(`Invalid JSON value: ${value}`, { cause: error });
        }
    }
}

/**
 * Converts strings to numbers via `parseFloat`.
 *
 * Returns `NaN` for non-numeric input — callers should check with `Number.isFinite()`.
 *
 * @example
 * ```ts
 * const converter = new NumberConverter();
 * converter.convert('42'); // 42
 * converter.convert('not-a-number'); // NaN
 * ```
 */
export class NumberConverter implements Converter<string, number> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NumberConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NumberConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'NumberConverter';
    }

    /** Parses a string as a number. @param value - The numeric string. @returns The parsed number (may be `NaN`). */
    convert(value: string): number {
        return parseFloat(value);
    }
}

/**
 * Converts strings to booleans using common truthy/falsy conventions.
 *
 * Truthy values (case-insensitive): `true`, `1`, `yes`, `on`
 * Falsy values (case-insensitive): `false`, `0`, `no`, `off`
 *
 * @example
 * ```ts
 * const converter = new BooleanConverter();
 * converter.convert('true'); // true
 * converter.convert('off'); // false
 * ```
 */
export class BooleanConverter implements Converter<string, boolean> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "BooleanConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object BooleanConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'BooleanConverter';
    }

    /** Parses a string as a boolean. @param value - The boolean string. @returns The parsed boolean. */
    convert(value: string): boolean {
        const normalized = value.trim().toLowerCase();

        switch (normalized) {
            case 'true':
            case '1':
            case 'yes':
            case 'on':
                return true;
            case 'false':
            case '0':
            case 'no':
            case 'off':
                return false;
            default:
                throw new TypeError(`Invalid boolean value: ${value}`);
        }
    }
}

/**
 * Converts strings to arrays by splitting on a separator.
 *
 * @example
 * ```ts
 * const converter = new ArrayConverter();
 * converter.convert('a, b, c'); // ['a', 'b', 'c']
 * ```
 */
export class ArrayConverter implements Converter<string, string[]> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ArrayConverter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ArrayConverter]"
     */
    get [Symbol.toStringTag](): string {
        return 'ArrayConverter';
    }

    /** Splits a string into an array. @param value - The string to split. @param separator - Split separator (default `','`). @returns The resulting array. */
    convert(value: string, separator: string | RegExp = ','): string[] {
        return `${value}`
            .split(separator)
            .map((item) => item.trim())
            .filter(Boolean);
    }
}
