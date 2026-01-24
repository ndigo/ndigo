/**
 * @author Jeff Rose
 */
import { Comparator, PatternMatcher } from '@blue/core';
export interface URLMatcher extends PatternMatcher<string, string> {
    getPatternComparator(url: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}
/**
 * @function module:core.likeURLMatcher
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:http.URLMatcher|URLMatcher}.
 */
export declare const likeURLMatcher: (value: any) => value is URLMatcher;
/**
 * @class module:core.EqualsURLMatcher
 * @extends module:http.URLMatcher
 */
export declare class EqualsURLMatcher implements URLMatcher {
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}
//# sourceMappingURL=url-matcher.d.ts.map