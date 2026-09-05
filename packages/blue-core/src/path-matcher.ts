/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';
import { AbstractValueComparator, Comparator } from './comparable.js';
import { Constructable } from './constructable.js';
import { FrameworkError } from './error.js';
import { parseUrlGlob } from './url-glob.js';
import { LRUCache } from './_lru-cache.js';
import { PatternMatcher } from './matchable.js';

const DOT = '.',
    SLASH = '/',
    STAR = '*',
    GLOBSTAR = `${STAR}${STAR}`,
    DOT_STAR = `${DOT}${STAR}`,
    SLASH_STAR = `${SLASH}${STAR}`,
    SLASH_GLOBSTAR = `${SLASH}${GLOBSTAR}`;

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
     * The `PathMatcher` instance used for matching patterns.
     */
    pathMatcher: PathMatcher;
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
    value: any
) => value is PathMatcher;

/**
 * @extends module:core.AbstractStringComparator
 */
class EqualsPathComparator extends AbstractValueComparator {
    compare(pattern1: string, pattern2: string): number {
        const { value } = this,
            pattern1EqualsPath = pattern1 === value,
            pattern2EqualsPath = pattern2 === value;

        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        } else if (pattern1EqualsPath) {
            return -1;
        } else if (pattern2EqualsPath) {
            return 1;
        }

        return 0;
    }
}

/**
 * @extends module:core.AbstractStringComparator
 */
class GlobPatternComparator extends AbstractValueComparator {
    compare(pattern1: string, pattern2: string): number {
        const info1 = new GlobPatternInfo(pattern1),
            info2 = new GlobPatternInfo(pattern2);

        if (info1.isLeastSpecific && info2.isLeastSpecific) {
            return 0;
        } else if (info1.isLeastSpecific) {
            return 1;
        } else if (info2.isLeastSpecific) {
            return -1;
        }

        const { value } = this,
            pattern1EqualsPath = pattern1 === value,
            pattern2EqualsPath = pattern2 === value;

        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        } else if (pattern1EqualsPath) {
            return -1;
        } else if (pattern2EqualsPath) {
            return 1;
        }

        if (info1.isPrefixPattern && info2.isPrefixPattern) {
            return info2.length - info1.length;
        } else if (info1.isPrefixPattern && info2.doubleWildcards === 0) {
            return 1;
        } else if (info2.isPrefixPattern && info1.doubleWildcards === 0) {
            return -1;
        }

        if (info1.totalCount !== info2.totalCount) {
            return info1.totalCount - info2.totalCount;
        }

        if (info1.length !== info2.length) {
            return info2.length - info1.length;
        }

        if (info1.singleWildcards < info2.singleWildcards) {
            return -1;
        } else if (info2.singleWildcards < info1.singleWildcards) {
            return 1;
        }

        return 0;
    }
}

/**
 * @extends module:core.PathMatcher
 */
export class EqualsPathMatcher implements PathMatcher {
    merge(pattern1: string, pattern2: string): string {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }

        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }

        // Root merging: "/" acts as identity
        if (pattern1 === SLASH && pattern2 === SLASH) {
            return SLASH;
        }
        if (pattern1 === SLASH) {
            return pattern2;
        }
        if (pattern2 === SLASH) {
            return pattern1;
        }

        const isEmpty1 = pattern1.length === 0,
            isEmpty2 = pattern2.length === 0,
            hasSlash1 = !isEmpty1 && pattern1.indexOf(SLASH) === 0,
            hasSlash2 = !isEmpty2 && pattern2.indexOf(SLASH) === 0;

        if (isEmpty1 && isEmpty2) {
            return '';
        } else if (isEmpty1) {
            return pattern2;
        } else if (isEmpty2) {
            return pattern1;
        } else {
            const hasPeriod1 = pattern1.indexOf(DOT) !== -1,
                hasPeriod2 = pattern2.indexOf(DOT) !== -1;
            if (hasPeriod1 && !hasPeriod2) {
                return `${pattern2}${SLASH}${hasSlash1 ? pattern1.substring(1) : pattern1}`;
            } else if (!hasPeriod1 && hasPeriod2) {
                return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
            } else if (hasPeriod1 && hasPeriod2) {
                throw new FrameworkError(`Cannot combine "${pattern1}" and "${pattern2}"`);
            }
        }

        return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
    }

    getPatternComparator(path: string): Comparator<string> {
        return new EqualsPathComparator(path);
    }

    match(pattern: string, path: string): boolean {
        return pattern === path;
    }
}

/**
 * @extends module:core.PathMatcher
 */
export class URLGlobPathMatcher implements PathMatcher {
    #cache: LRUCache<string, RegExp>;

    /**
     * @param cacheCapacity - Maximum number of compiled patterns to cache. Default: 256.
     */
    constructor(cacheCapacity = 256) {
        this.#cache = new LRUCache(cacheCapacity);
    }

    getPatternComparator(path: string): Comparator<string> {
        return new GlobPatternComparator(path);
    }

    match(pattern: string, path: string): boolean {
        let regex = this.#cache.get(pattern);
        if (regex === undefined) {
            const regexSrc = parseUrlGlob(pattern);
            if (regexSrc === null) return false;
            regex = new RegExp(regexSrc);
            this.#cache.set(pattern, regex);
        }
        return (regex as RegExp).test(path);
    }

    merge(pattern1: string, pattern2: string): string {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }

        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }

        // Root merging: "/" acts as identity
        if (pattern1 === SLASH && pattern2 === SLASH) {
            return SLASH;
        }
        if (pattern1 === SLASH) {
            return pattern2;
        }
        if (pattern2 === SLASH) {
            return pattern1;
        }

        if (pattern1.endsWith(SLASH_STAR)) {
            return `${pattern1.substring(0, pattern1.length - 2)}${pattern2}`;
        }

        if (pattern1.endsWith(SLASH_GLOBSTAR)) {
            return `${pattern1}${pattern2}`;
        }

        return `${pattern1}${pattern2}`;
    }
}

export class GlobPatternInfo {
    #catchAllPattern: boolean;

    readonly pattern: string;

    doubleWildcards: number;
    singleWildcards: number;

    get isLeastSpecific(): boolean {
        return this.pattern === null || this.#catchAllPattern;
    }

    get isPrefixPattern(): boolean {
        return !this.#catchAllPattern && this.pattern.endsWith(SLASH_GLOBSTAR);
    }

    get length(): number {
        return this.pattern ? this.pattern.length : 0;
    }

    get totalCount(): number {
        return this.singleWildcards + 2 * this.doubleWildcards;
    }

    constructor(pattern: string | null = null) {
        this.pattern = pattern ?? '';

        this.doubleWildcards = 0;
        this.singleWildcards = 0;
        this.#catchAllPattern = false;

        if (this.pattern) {
            this._initCounters();
            this.#catchAllPattern = this.pattern === SLASH_GLOBSTAR;
        }
    }

    protected _initCounters(): void {
        let index: number = 0;
        const pattern = this.pattern;
        if (pattern) {
            const length: number = pattern.length;
            while (index < length) {
                switch (pattern[index]) {
                    case STAR:
                        if (index + 1 < length && pattern[index + 1] === STAR) {
                            this.doubleWildcards++;
                            index++;
                        } else if (index > 0 && pattern.substring(index - 1) === DOT_STAR) {
                            this.singleWildcards++;
                        }
                    default:
                        index++;
                        break;
                }
            }
        }
    }
}

// ! Not sure I like this name. Should really come up with a better one. -JBR
export const AsPathMatcherFilter = <T extends Constructable>(superclass: T): Constructable<PathMatcherFilter> & T =>
    class extends superclass implements PathMatcherFilter {
        #excludePatterns: string[] | null = null;
        #includePatterns: string[] | null = null;
        pathMatcher!: PathMatcher;

        matches(path: string, matcher?: PathMatcher): boolean {
            const pathMatcher = matcher || this.pathMatcher;

            if (pathMatcher) {
                const excludePatterns = this.#excludePatterns ?? [],
                    includePatterns = this.#includePatterns ?? [];
                let index: number, length: number;

                if (excludePatterns.length) {
                    length = excludePatterns.length;
                    for (index = 0; index < length; index++) {
                        if (pathMatcher.match(excludePatterns[index], path)) {
                            return false;
                        }
                    }
                }

                if (!includePatterns.length) {
                    return true;
                }

                length = includePatterns.length;
                for (index = 0; index < length; index++) {
                    if (pathMatcher.match(includePatterns[index], path)) {
                        return true;
                    }
                }
            }

            return false;
        }

        setExcludePatterns(excludePatterns: string[] = []): void {
            this.#excludePatterns = excludePatterns;
        }

        setIncludePatterns(includePatterns: string[] = []): void {
            this.#includePatterns = includePatterns;
        }
    };
