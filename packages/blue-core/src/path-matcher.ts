/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';
import { AbstractValueComparator, Comparator } from './comparable';
import { Constructable } from './constructable';
import { FrameworkError } from './error';
import { glob } from '@blue/parser';
import { PatternMatcher } from './matchable';

export interface PathMatcher extends PatternMatcher<string, string> {
    getPatternComparator(path: string): Comparator<string>;
    match(pattern: string, path: string): boolean;
    merge(pattern1: string, pattern2: string): string;
}

// ! This is a terrible name. Should really come up with a better one. -JBR
export interface PathMatcherFilter {
    pathMatcher: PathMatcher;
    matches(path: string, matcher?: PathMatcher): boolean;
    setExcludePatterns(excludePatterns: string[]): void;
    setIncludePatterns(includePatterns: string[]): void;
}

/**
 * Combines two patterns into a new pattern.
 *
 * The approach used for combining the two pattern depends on the underlying implementation.
 * @param {string} pattern1 The first pattern
 * @param {string} pattern2 The second pattern
 * @returns {string} The combination of the two patterns
 */

/**
 * Given a full path, returns a {@link Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @param {string} path The full path to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */

/**
 * Match the given `path` against the given `pattern`, according to this PathMatcher's matching strategy.
 * @param {string} pattern The pattern to match against
 * @param {string} path The path to test
 * @returns {boolean} Whether or not the `path` matched.
 */

/**
 */

const DOT = '.',
    SLASH = '/',
    STAR = '*',
    GLOBSTAR = `${STAR}${STAR}`,
    DOT_STAR = `${DOT}${STAR}`,
    SLASH_STAR = `${SLASH}${STAR}`,
    SLASH_GLOBSTAR = `${SLASH}${GLOBSTAR}`;

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link PathMatcher|PathMatcher}.
 */
export const likePathMatcher = like({ getPatternComparator: Function, match: Function, merge: Function }) as (
    value
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
export class GlobPathMatcher implements PathMatcher {
    getPatternComparator(path: string): Comparator<string> {
        return new GlobPatternComparator(path);
    }

    match(pattern: string, path: string): boolean {
        const parseResult = glob.run(pattern);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<string, any> here
            const regex = new RegExp(
                (parseResult as { isError: false; result: string; index: number; data: any }).result
            );
            return regex.test(path);
        }
        return false;
    }

    merge(pattern1: string, pattern2: string): string {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }

        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
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

    constructor(pattern: string = null) {
        this.pattern = pattern;

        this.doubleWildcards = 0;
        this.singleWildcards = 0;

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
        #excludePatterns: string[];
        #includePatterns: string[];
        pathMatcher: PathMatcher;

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
