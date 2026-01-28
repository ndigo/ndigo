/**
 * @author Jeff Rose
 */
import { Comparator, PatternMatcher } from '@blue/core';
export interface URLMatcher extends PatternMatcher<string, string> {
    getPatternComparator(url: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link URLMatcher|URLMatcher}.
 */
export declare const likeURLMatcher: (value: any) => value is URLMatcher;
/**
 * @extends module:http.URLMatcher
 */
export declare class EqualsURLMatcher implements URLMatcher {
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, url: string): boolean;
}
//# sourceMappingURL=url-matcher.d.ts.map