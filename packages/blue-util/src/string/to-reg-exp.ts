/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import safeRegex from 'safe-regex';
import { isDevMode } from '../env.js';

const MAX_CACHE_SIZE = 1000;
const slashedPattern = /^\/(.*)\/([gimsuy]*)$/,
    repeatedFlag = /(.).*\1/,
    cache = new Map<string, RegExp>(),
    parsePattern = (value: string): [pattern: string, flags: string] => {
        const match = slashedPattern.exec(value);
        if (match === null || repeatedFlag.test(match[2])) {
            return [value, ''];
        }
        return [match[1], match[2]];
    };

/**
 * Returns a regular expression for the given `pattern`.
 * Input of the `/pattern/flags` form is split into a source and flags, where the
 * flags may contain only `g`, `i`, `m`, `s`, `u` or `y`, without duplicates. Any
 * other input - including plain patterns that merely contain flag letters
 * (`greedy`) and malformed slash forms (`/foo/garbage`, `/foo/gg`) - is compiled
 * as a literal pattern, slashes included, so it never fails on its flags.
 * @param {string} value - The pattern string (with optional /pattern/flags format)
 * @returns {RegExp}
 * @throws {Error} If the pattern is not valid regular expression syntax
 * `security` WARNING: This function accepts arbitrary regex patterns.
 *   Do not use with untrusted user input without validation.
 *   Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
 * @category String
 */
const toRegExp = (value: string): RegExp => {
    let regex: RegExp;

    const cached = cache.get(value);
    if (cached !== undefined) {
        regex = cached;
    } else {
        const [pattern, flags] = parsePattern(value);

        // Security check for ReDoS vulnerabilities (SEC-002)
        const isSafe = safeRegex(pattern);
        if (!isSafe) {
            // In development, warn; in production, proceed but note the risk
            if (isDevMode()) {
                console.warn(`[toRegExp] Potentially unsafe regex pattern detected: ${pattern}`);
            }
        }

        regex = new RegExp(pattern, flags);

        // LRU cache with size cap (SEC-008)
        if (cache.size >= MAX_CACHE_SIZE) {
            // Remove first entry (FIFO eviction)
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) {
                cache.delete(firstKey);
            }
        }
        cache.set(value, regex);
    }

    return regex;
};

export default toRegExp;
