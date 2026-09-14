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
 * parseWildcard('foo*bar') // '^foo.*?bar$'
 * parseWildcard('*')       // '^.*?$'
 */
export class WildcardConverter implements Converter<string, string> {
    convert(pattern: string): string {
        return `^${pattern.replace(/\*/g, '.*?')}$`;
    }
}

/** Singleton instance for backward compatibility. */
export const parseWildcard = new WildcardConverter().convert.bind(new WildcardConverter());
