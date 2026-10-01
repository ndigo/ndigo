/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Converter } from './converter.js';

/**
 * Parses a wildcard pattern into a bounded regular-expression source string.
 *
 * Any string is a valid wildcard pattern — `*` matches any sequence of characters.
 * This function always succeeds.
 *
 * @param pattern - Wildcard pattern where `*` matches any sequence of characters.
 * @returns A regular-expression source string anchored with `^` and `$`.
 *
 * @example
 * const wildcards = new WildcardConverter();
 * wildcards.convert('foo*bar') // '^foo.*?bar$'
 * wildcards.convert('*')       // '^.*?$'
 */
export class WildcardConverter implements Converter<string, string> {
    convert(pattern: string): string {
        return `^${pattern.replace(/\*/g, '.*?')}$`;
    }
}
