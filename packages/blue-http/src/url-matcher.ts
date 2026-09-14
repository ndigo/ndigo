/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';
import { Comparator, PatternMatcher } from '@blue/core';

/**
 * Matcher contract for URL-aware pattern ordering.
 */
export interface URLMatcher extends PatternMatcher<string, string> {
    getPatternComparator(url: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}

/**
 */

/**
 * Given a full url, returns a {@link Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @param {string} url The full url to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */

/**
 * Match the given `url` against the given `pattern`, according to this URLMatcher's matching strategy.
 * @param {string} pattern The pattern to match against
 * @param {string} url The url to test
 * @returns {boolean} Whether or not the `url` matched.
 */

const { defineProperty } = Reflect;

/**
 * Tests whether a value implements {@link URLMatcher}.
 *
 * @param value - The value to test.
 * @returns `true` when the value exposes URL matching behavior.
 */
export const likeURLMatcher = like({ getPatternComparator: Function, match: Function }) as (
    value: unknown
) => value is URLMatcher;

abstract class AbstractURLComparator implements Comparator<string> {
    readonly url!: string;

    constructor(url: string) {
        defineProperty(this, 'url', {
            value: url,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    abstract compare(pattern1: string, pattern2: string): number;
}

class EqualsURLComparator extends AbstractURLComparator {
    compare(pattern1: string, pattern2: string): number {
        const { url } = this,
            pattern1EqualsURL = pattern1 === url,
            pattern2EqualsURL = pattern2 === url;

        if (pattern1EqualsURL && pattern2EqualsURL) {
            return 0;
        } else if (pattern1EqualsURL) {
            return -1;
        } else if (pattern2EqualsURL) {
            return 1;
        }

        return 0;
    }
}

/**
 * URL matcher that only accepts exact string matches.
 *
 */
export class EqualsURLMatcher implements URLMatcher {
    /**
     * Builds a comparator for exact URL sorting.
     *
     * @param path - The URL to compare against.
     * @returns A comparator that ranks exact matches first.
     */
    getPatternComparator(path: string): Comparator<string> {
        return new EqualsURLComparator(path);
    }

    /**
     * Tests whether a pattern exactly matches a URL.
     *
     * @param pattern - The pattern to test.
     * @param url - The URL to compare.
     * @returns `true` when both strings are identical.
     */
    match(pattern: string, url: string): boolean {
        return pattern === url;
    }
}
