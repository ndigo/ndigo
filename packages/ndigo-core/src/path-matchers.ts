/**
 * Concrete path matchers: literal equality and URL globs.
 */
import { AbstractValueComparator, Comparator } from './comparable.js';
import { BoundedCache } from './bounded-cache.js';
import { FrameworkError } from './error.js';
import type { PathMatcher } from './path-matcher.js';
import { parseUrlGlob } from './url-glob.js';
import { DOT, SLASH, SLASH_GLOBSTAR, SLASH_STAR } from './_path-matcher-constants.js';
import { GlobPatternInfo } from './glob-pattern-info.js';

/**
 * Comparator that orders patterns by exact equality with the matched path.
 */
class EqualsPathComparator extends AbstractValueComparator {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "EqualsPathComparator".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object EqualsPathComparator]"
     */
    get [Symbol.toStringTag](): string {
        return 'EqualsPathComparator';
    }

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
 * Comparator that orders glob patterns by specificity.
 */
class GlobPatternComparator extends AbstractValueComparator {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "GlobPatternComparator".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object GlobPatternComparator]"
     */
    get [Symbol.toStringTag](): string {
        return 'GlobPatternComparator';
    }

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
 * Path matcher for literal comparison: `merge` joins two patterns and `match`
 * accepts only an exact string match. The identity matcher for callers that
 * need pattern plumbing without wildcard semantics.
 *
 * @example
 * ```ts
 * const matcher = new EqualsPathMatcher();
 * matcher.match('/a', '/a'); // true
 * matcher.match('/a', '/b'); // false
 * ```
 */
export class EqualsPathMatcher implements PathMatcher {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "EqualsPathMatcher".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object EqualsPathMatcher]"
     */
    get [Symbol.toStringTag](): string {
        return 'EqualsPathMatcher';
    }

    /** Merges two patterns into the matcher's combined pattern. @param pattern1 - First pattern. @param pattern2 - Second pattern. @returns The merged pattern. */
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

    /** Returns a comparator that orders patterns by specificity for the given path. @param path - The path. @returns A comparator for pattern ordering. */
    getPatternComparator(path: string): Comparator<string> {
        return new EqualsPathComparator(path);
    }

    /** Tests whether a path matches a pattern. @param pattern - The pattern. @param path - The path. @returns `true` when the path matches. */
    match(pattern: string, path: string): boolean {
        return pattern === path;
    }
}

/**
 * `PathMatcher` for URL globs: translates a pattern (`*`, `**`, `?`, character
 * classes) into a regular expression, caches compiled patterns in a bounded
 * LRU keyed by pattern string, and compares patterns by specificity.
 *
 * @example
 * ```ts
 * const matcher = new URLGlobPathMatcher();
 * matcher.match('/users/*', '/users/42'); // true
 * ```
 */
export class URLGlobPathMatcher implements PathMatcher {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "URLGlobPathMatcher".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object URLGlobPathMatcher]"
     */
    get [Symbol.toStringTag](): string {
        return 'URLGlobPathMatcher';
    }

    #cache: BoundedCache<string, RegExp>;

    /**
     * @param cacheCapacity - Maximum number of compiled patterns to cache. Default: 256.
     */
    constructor(cacheCapacity = 256) {
        this.#cache = new BoundedCache<string, RegExp>({ maxSize: cacheCapacity, policy: 'lru' });
    }

    /** Returns a comparator that orders patterns by specificity for the given path. @param path - The path. @returns A comparator for pattern ordering. */
    getPatternComparator(path: string): Comparator<string> {
        return new GlobPatternComparator(path);
    }

    /** Tests whether a path matches a pattern. @param pattern - The pattern. @param path - The path. @returns `true` when the path matches. */
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

    /** Merges two patterns into the matcher's combined pattern. @param pattern1 - First pattern. @param pattern2 - Second pattern. @returns The merged pattern. */
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
