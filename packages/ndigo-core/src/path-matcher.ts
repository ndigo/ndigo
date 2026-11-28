/**
 * Path matching, globbing, and include/exclude filtering contracts.
 *
 * Provides `EqualsPathMatcher`, `GlobPatternInfo`, `URLGlobPathMatcher`, and
 * comparator helpers for deciding whether a path matches a pattern or set of
 * include/exclude globs.
 *
 * @example
 * ```ts
 * const matcher = new URLGlobPathMatcher();
 * matcher.match('/users/*', '/users/42'); // true
 * ```
 */
import { like } from '@ndigo/util/types';

import type { Comparator } from './comparable.js';
import type { Constructable } from './constructable.js';
import type { Matchable, PatternMatcher } from './matchable.js';

/**
 * Defines a contract for matching and merging path patterns.
 * This interface extends `PatternMatcher` for string patterns and paths.
 *
 * @example
 * ```ts
 * const matcher: PathMatcher = new EqualsPathMatcher();
 * matcher.match('/a', '/a'); // true
 * ```
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
 *
 * @example
 * ```ts
 * const filter: PathMatcherFilter = new MappedRouterInterceptor(interceptor, { include: '/users/*' });
 * ```
 */
export interface PathMatcherFilter extends Matchable<string> {
    /**
     * The `PathMatcher` instance used for matching patterns.
     */
    pathMatcher: PathMatcher;
    /**
     * The configured include patterns. Empty means every path is included
     * unless an exclude pattern matches.
     */
    readonly includePatterns: readonly string[];
    /**
     * The configured exclude patterns; a match wins over any include pattern.
     */
    readonly excludePatterns: readonly string[];
    /**
     * Checks if a given path matches the configured include/exclude patterns.
     * @param path - The path to check.
     * @param matcher - An optional `PathMatcher` to use for matching. If not provided, `this.pathMatcher` is used.
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
export const likePathMatcher = like({ getPatternComparator: Function, match: Function, merge: Function }) as (
    value: unknown
) => value is PathMatcher;

// ! Not sure I like this name. Should really come up with a better one.
/**
 * Applies include/exclude patterns to a value.
 *
 * Exclusion wins over inclusion; an empty include list matches every value
 * that is not excluded. Shared by the path-matching mixin and the HTTP and
 * service interceptor wrappers so the precedence rule lives in one place.
 *
 * @param value - The path or URL to test.
 * @param includePatterns - Patterns that opt the value in.
 * @param excludePatterns - Patterns that opt the value out.
 * @param match - Tests one pattern against the value (pattern first).
 * @returns `true` when the value is included and not excluded.
 */
export function matchesPathPatterns(
    value: string,
    includePatterns: readonly string[],
    excludePatterns: readonly string[],
    match: (pattern: string, value: string) => boolean
): boolean {
    for (const pattern of excludePatterns) {
        if (match(pattern, value)) {
            return false;
        }
    }

    if (includePatterns.length === 0) {
        return true;
    }

    for (const pattern of includePatterns) {
        if (match(pattern, value)) {
            return true;
        }
    }

    return false;
}

/**
 * Mixin adding include/exclude pattern filtering to a class that owns a
 * `pathMatcher`: `matches()` accepts a path when it satisfies every include
 * pattern and no exclude pattern, and rejects an empty include list.
 */
export const AsPathMatcherFilter = <T extends Constructable>(superclass: T): Constructable<PathMatcherFilter> & T =>
    class extends superclass implements PathMatcherFilter {
        #excludePatterns: string[] | null = null;
        #includePatterns: string[] | null = null;
        pathMatcher!: PathMatcher;

        /**
         * The configured include patterns; an empty list includes everything
         * that is not excluded.
         */
        get includePatterns(): readonly string[] {
            return this.#includePatterns ?? [];
        }

        /**
         * The configured exclude patterns; exclusion wins over inclusion.
         */
        get excludePatterns(): readonly string[] {
            return this.#excludePatterns ?? [];
        }

        matches(path: string, matcher?: PathMatcher): boolean {
            const pathMatcher = matcher || this.pathMatcher;

            if (!pathMatcher) {
                return false;
            }

            return matchesPathPatterns(
                path,
                this.#includePatterns ?? [],
                this.#excludePatterns ?? [],
                (pattern, value) => pathMatcher.match(pattern, value)
            );
        }

        setExcludePatterns(excludePatterns: string[] = []): void {
            this.#excludePatterns = excludePatterns;
        }

        setIncludePatterns(includePatterns: string[] = []): void {
            this.#includePatterns = includePatterns;
        }
    };

export * from './glob-pattern-info.js';
export * from './path-matchers.js';
