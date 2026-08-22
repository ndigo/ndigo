/**
 * @author Jeff Rose
 */
import { Comparator } from './comparable.js';
import { Constructable } from './constructable.js';
import { PatternMatcher } from './matchable.js';
/**
 * Defines a contract for matching and merging path patterns.
 * This interface extends `PatternMatcher` for string patterns and paths.
 */
export interface PathMatcher extends PatternMatcher<string, string> {
    /**
     * Given a full path, returns a {@link Comparator} suitable for sorting patterns
     * in order of explicitness for that path.
     *
     * The approach used depends on the underlying implementation.
     * @param path - The full path to use for comparison.
     * @returns A comparator capable of sorting patterns in order of explicitness.
     */
    getPatternComparator(path: string): Comparator<string>;
    /**
     * Match the given `path` against the given `pattern`, according to this PathMatcher's matching strategy.
     * @param pattern - The pattern to match against.
     * @param path - The path to test.
     * @returns Whether or not the `path` matched.
     */
    match(pattern: string, path: string): boolean;
    /**
     * Combines two patterns into a new pattern.
     *
     * The approach used for combining the two patterns depends on the underlying implementation.
     * @param pattern1 - The first pattern.
     * @param pattern2 - The second pattern.
     * @returns The combination of the two patterns.
     */
    merge(pattern1: string, pattern2: string): string;
}
/**
 * Defines a contract for filtering paths based on include and exclude patterns.
 * This interface is typically implemented by mixins or classes that need path filtering capabilities.
 */
export interface PathMatcherFilter {
    /**
     * The {@link PathMatcher} instance used for matching patterns.
     */
    pathMatcher: PathMatcher;
    /**
     * Checks if a given path matches the configured include/exclude patterns.
     * @param path - The path to check.
     * @param matcher - An optional {@link PathMatcher} to use for matching. If not provided, `this.pathMatcher` is used.
     * @returns `true` if the path matches the include patterns and does not match any exclude patterns, `false` otherwise.
     */
    matches(path: string, matcher?: PathMatcher): boolean;
    /**
     * Sets the patterns to exclude. Paths matching these patterns will be filtered out.
     * @param excludePatterns - An array of patterns to exclude.
     */
    setExcludePatterns(excludePatterns: string[]): void;
    /**
     * Sets the patterns to include. Paths must match at least one of these patterns to be included.
     * If no include patterns are set, all paths are considered included (unless excluded by `excludePatterns`).
     * @param includePatterns - An array of patterns to include.
     */
    setIncludePatterns(includePatterns: string[]): void;
}
/**
 * Type guard that checks if a given value is a {@link PathMatcher}.
 * A value is considered a `PathMatcher` if it has `getPatternComparator`, `match`, and `merge` methods.
 * @param value - The value to check.
 * @returns `true` if the value is a `PathMatcher`, `false` otherwise.
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
export declare class URLGlobPathMatcher implements PathMatcher {
    #private;
    /**
     * @param cacheCapacity - Maximum number of compiled patterns to cache. Default: 256.
     */
    constructor(cacheCapacity?: number);
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
    constructor(pattern?: string | null);
    protected _initCounters(): void;
}
export declare const AsPathMatcherFilter: <T extends Constructable>(superclass: T) => Constructable<PathMatcherFilter> & T;
