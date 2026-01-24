/**
 * @author Jeff Rose
 */

import { like } from '@blue/util';
import { Comparator, PatternMatcher } from '@blue/core';

export interface URLMatcher extends PatternMatcher<string, string> {
    getPatternComparator(url: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}

/**
 * @interface module:http.URLMatcher
 * @extends module:core.PatternMatcher
 */

/**
 * Given a full url, returns a {@linkcode module:core.Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @function module:http.URLMatcher#getPatternComparator
 * @param {external:string} url The full url to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */

/**
 * Match the given `url` against the given `pattern`, according to this URLMatcher's matching strategy.
 * @function module:http.URLMatcher#match
 * @param {external:string} pattern The pattern to match against
 * @param {external:string} url The url to test
 * @returns {external:boolean} Whether or not the `url` matched.
 */

const { defineProperty } = Reflect;

/**
 * @function module:core.likeURLMatcher
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:http.URLMatcher|URLMatcher}.
 */
export const likeURLMatcher = like({ getPatternComparator: Function, match: Function }) as (
    value
) => value is URLMatcher;

abstract class AbstractURLComparator implements Comparator<string> {
    readonly url: string;

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

/**
 * @abstract
 * @class module:http.AbstractURLComparator
 * @implements module:core.Comparator<external:string>
 */

/**
 * @class module:http.EqualsURLComparator
 * @extends module:http.AbstractURLComparator
 */
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
 * @class module:core.EqualsURLMatcher
 * @extends module:http.URLMatcher
 */
export class EqualsURLMatcher implements URLMatcher {
    getPatternComparator(path: string): Comparator<string> {
        return new EqualsURLComparator(path);
    }

    match(pattern: string, url: string): boolean {
        return pattern === url;
    }
}
