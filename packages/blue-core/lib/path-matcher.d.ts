/**
 * @author Jeff Rose
 */
import { Comparator } from './comparable';
import { Constructable } from './constructable';
import { PatternMatcher } from './matchable';
export interface PathMatcher extends PatternMatcher<string, string> {
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, path: string): boolean;
    merge(pattern1: string, pattern2: string): string;
}
export interface PathMatcherFilter {
    pathMatcher: PathMatcher;
    matches(path: string, matcher?: PathMatcher): boolean;
    setExcludePatterns(excludePatterns: string[]): void;
    setIncludePatterns(includePatterns: string[]): void;
}
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link PathMatcher|PathMatcher}.
 */
export declare const likePathMatcher: (value: any) => value is PathMatcher;
/**
 * @extends module:core.PathMatcher
 */
export declare class EqualsPathMatcher implements PathMatcher {
    merge(pattern1: string, pattern2: string): string;
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, path: string): boolean;
}
/**
 * @extends module:core.PathMatcher
 */
export declare class GlobPathMatcher implements PathMatcher {
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, path: string): boolean;
    merge(pattern1: string, pattern2: string): string;
}
export declare class GlobPatternInfo {
    #private;
    readonly pattern: string;
    doubleWildcards: number;
    singleWildcards: number;
    get isLeastSpecific(): boolean;
    get isPrefixPattern(): boolean;
    get length(): number;
    get totalCount(): number;
    constructor(pattern?: string);
    protected _initCounters(): void;
}
export declare const AsPathMatcherFilter: <T extends Constructable>(superclass: T) => Constructable<PathMatcherFilter> & T;
//# sourceMappingURL=path-matcher.d.ts.map