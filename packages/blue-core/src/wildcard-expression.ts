/**
 * @author Jeff Rose
 */

import type { Converter } from './parser.js';

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
export const parseWildcard: Converter<string, string> = (pattern: string): string =>
    `^${pattern.replace(/\*/g, '.*?')}$`;
