/**
 */
import type { Converter } from './converter.js';

/**
 * Parses a wildcard pattern into a bounded regular-expression source string.
 *
 * Any string is a valid wildcard pattern — `*` matches any sequence of characters.
 * This converter always succeeds.
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
        // Every regex metacharacter is escaped so a wildcard pattern matches
        // literally except for `*`, which becomes the wildcard group `.*?`.
        // Without this, patterns such as `a.b`, `a+b` or `[x]` would be
        // interpreted as regular-expression syntax.
        return `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, (match) => (match === '*' ? '.*?' : `\\${match}`))}$`;
    }
}
