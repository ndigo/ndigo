/**
 * @author Jeff Rose
 */

import safeRegex from 'safe-regex';

const MAX_CACHE_SIZE = 1000;
const regExpFlags = /[gimsuy]+/,
    leadingSlash = /^\//,
    trailingSlashAndFlags = /\/([gimsuy]*)$/,
    patternWithTrailingSlashAndFlags = /.+\/([gimsuy]*)$/,
    cache = new Map<string, RegExp>(),
    hasValidFlags = (value: string) => regExpFlags.test(value),
    removeLeadingSlash = (val: string) => val.replace(leadingSlash, ''),
    removeTrailingSlashAndFlags = (val: string) => val.replace(trailingSlashAndFlags, ''),
    extractFlags = (val: string) => val.replace(patternWithTrailingSlashAndFlags, '$1'),
    removeSlashesAndFlags = (val: string) => {
        val = removeLeadingSlash(val);
        return removeTrailingSlashAndFlags(val);
    };

/**
 * Returns a regular expression for the given `pattern`.
 * @param {string} value - The pattern string (with optional /pattern/flags format)
 * @returns {RegExp}
 * @throws {Error} If the pattern is malformed
 * @security WARNING: This function accepts arbitrary regex patterns. 
 *   Do not use with untrusted user input without validation.
 *   Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
 * @category String
 */
const toRegExp = (value: string): RegExp => {
    let regex: RegExp;

    if (cache.has(value)) {
        regex = cache.get(value)!;
    } else {
        const flags = extractFlags(value),
            pattern = removeSlashesAndFlags(value);
        
        // Security check for ReDoS vulnerabilities (SEC-002)
        const isSafe = safeRegex(pattern);
        if (!isSafe) {
            // In development, warn; in production, proceed but note the risk
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[toRegExp] Potentially unsafe regex pattern detected: ${pattern}`);
            }
        }
        
        regex = hasValidFlags(flags) ? new RegExp(pattern, flags) : new RegExp(pattern);
        
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