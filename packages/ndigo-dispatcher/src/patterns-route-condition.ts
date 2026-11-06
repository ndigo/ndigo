/**
 */
import { Route } from '@ndigo/router';
import { PathMatcher, URLGlobPathMatcher, likePathMatcher } from '@ndigo/core';
import { AbstractRouteCondition, likeRouteCondition } from './route-condition';
const { defineProperty } = Reflect;
const { isArray } = Array;
const preprendPeriod = (value: string) => (value[0] === '.' ? value : `.${value}`);
const prependSlash = (value: string) => (value[0] === '/' ? value : `/${value}`);

/**
 * @param {Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
 * @param {module:core.PathMatcher} pathMatcher
 * @param {boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
 * @param {Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
 */
export class PatternsRouteCondition extends AbstractRouteCondition<PatternsRouteCondition> {
    /**
     * Matcher used to compare and merge route patterns.
     */
    readonly pathMatcher!: PathMatcher;

    /**
     * File extensions that are treated as matchable suffixes.
     */
    fileExtensions!: string[];

    /**
     * Route patterns to match against.
     */
    patterns!: Set<string>;

    /**
     * Whether a trailing slash may be treated as equivalent.
     */
    useTrailingSlashMatch!: boolean;

    get content(): string[] {
        return Array.from(this.patterns);
    }

    get infix(): string {
        return ' || ';
    }

    /**
     * Create a condition from one or more patterns.
     *
     * @param patterns - Route patterns to use.
     */
    constructor(...patterns: string[]);
    /**
     * Create a condition from a prebuilt pattern set.
     *
     * @param patterns - The pattern set to use.
     * @param routeCondition - A template condition to copy matcher settings from.
     */
    constructor(patterns: Set<string>, routeCondition?: PatternsRouteCondition);
    /**
     * Create a condition with explicit matcher settings.
     *
     * @param patterns - Route patterns to use.
     * @param pathMatcher - The matcher to use.
     * @param useTrailingSlashMatch - Whether to allow trailing slash matches.
     * @param fileExtensions - File extensions to treat as suffix patterns.
     */
    constructor(patterns: string[], pathMatcher: PathMatcher, useTrailingSlashMatch: boolean, fileExtensions: string[]);
    constructor(
        patterns: string | string[] | Set<string> = '',
        pathMatcherOrRouteCondition?: string | PathMatcher | PatternsRouteCondition,
        useTrailingSlashMatch?: string | boolean,
        fileExtensions?: string | string[],
        ...morePatterns: string[]
    ) {
        super();

        if (typeof patterns === 'string') {
            const collectedPatterns = [patterns];
            const remainingArgs: Array<string | PathMatcher | PatternsRouteCondition | boolean | string[] | undefined> =
                [pathMatcherOrRouteCondition, useTrailingSlashMatch, fileExtensions, ...morePatterns];
            // Non-string, non-undefined args are matcher/settings per the
            // legacy positional API, collected in slots below.
            const options: Array<PathMatcher | PatternsRouteCondition | boolean | string[]> = [];

            for (const arg of remainingArgs) {
                if (typeof arg === 'string') {
                    collectedPatterns.push(arg);
                } else if (arg !== undefined) {
                    options.push(arg);
                }
            }

            patterns = collectedPatterns;
            // Each slot's runtime value matches its documented constructor
            // parameter; widen only here, at the boundary.
            const matcherOption = options[0] as PathMatcher | PatternsRouteCondition | undefined;
            const trailingOption = options[1] as boolean | undefined;
            const extensionOption = options[2] as string[] | undefined;
            pathMatcherOrRouteCondition = matcherOption ?? new URLGlobPathMatcher();
            useTrailingSlashMatch = trailingOption ?? true;
            fileExtensions = extensionOption ?? [];
        }

        if (isArray(patterns)) {
            const discretePatterns = new Set<string>();
            patterns.forEach(function (pattern) {
                if (pattern.length > 0) {
                    pattern = prependSlash(pattern);
                }
                discretePatterns.add(pattern);
            });
            defineProperty(this, 'patterns', {
                value: discretePatterns,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        } else {
            defineProperty(this, 'patterns', {
                value: patterns,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }

        if (likePathMatcher(pathMatcherOrRouteCondition)) {
            defineProperty(this, 'pathMatcher', {
                value: pathMatcherOrRouteCondition,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: useTrailingSlashMatch,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        } else if (likeRouteCondition(pathMatcherOrRouteCondition)) {
            const { pathMatcher } = pathMatcherOrRouteCondition;
            useTrailingSlashMatch = pathMatcherOrRouteCondition.useTrailingSlashMatch;
            fileExtensions = pathMatcherOrRouteCondition.fileExtensions;

            defineProperty(this, 'pathMatcher', {
                value: pathMatcher,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: useTrailingSlashMatch,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        } else {
            defineProperty(this, 'pathMatcher', {
                value: new URLGlobPathMatcher(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'useTrailingSlashMatch', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }

        defineProperty(this, 'fileExtensions', {
            value: isArray(fileExtensions) && fileExtensions.length ? fileExtensions.map(preprendPeriod) : [],
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    /**
     * Merge route patterns from both conditions.
     *
     * @param value - The condition to merge with.
     * @returns A new condition containing the merged patterns.
     */
    merge(value: PatternsRouteCondition): PatternsRouteCondition {
        const result = new Set<string>(),
            thisSize = this.patterns.size,
            valueSize = value.patterns.size;

        if (thisSize > 0 && valueSize > 0) {
            for (const pattern1 of this.patterns) {
                for (const pattern2 of value.patterns) {
                    result.add(this.pathMatcher.merge(pattern1, pattern2));
                }
            }
        } else if (thisSize > 0) {
            for (const pattern of this.patterns) {
                result.add(pattern);
            }
        } else if (valueSize > 0) {
            for (const pattern of value.patterns) {
                result.add(pattern);
            }
        } else {
            result.add('/');
        }

        return new PatternsRouteCondition(result, this);
    }

    /**
     * Return a condition containing only the patterns that match the route.
     *
     * @param route - The current route.
     * @returns A matching condition, or `null`.
     */
    match(route: Route): PatternsRouteCondition | null {
        if (this.patterns.size === 0) {
            return this;
        }
        const matches = this.getMatchingPatterns(route.path);
        return matches.length ? new PatternsRouteCondition(new Set<string>(matches), this) : null;
    }

    /**
     * Return the patterns that match a path.
     *
     * @param path - The path to test.
     * @returns The matching patterns, sorted when necessary.
     */
    getMatchingPatterns(path: string): string[] {
        const matches: string[] = [];
        this.patterns.forEach((pattern) => {
            const match = this._getMatchingPattern(pattern, path);
            if (match !== null) {
                matches.push(match);
            }
        }, this);
        if (matches.length > 1) {
            const comparator = this.pathMatcher.getPatternComparator(path);
            matches.sort(comparator.compare);
        }
        return matches;
    }

    /**
     * Compare route patterns using the configured path matcher.
     *
     * @param value - The condition to compare.
     * @param route - The route used to obtain a pattern comparator.
     * @returns A comparison result.
     */
    compareTo(value: PatternsRouteCondition, route: Route): number {
        const path = route.path,
            patternComparator = this.pathMatcher.getPatternComparator(path),
            iterator1 = this.patterns.values(),
            iterator2 = value.patterns.values();

        for (let item1, item2; !(item1 = iterator1.next()).done && !(item2 = iterator2.next()).done;) {
            const result = patternComparator.compare(item1.value, item2.value);
            if (result !== 0) {
                return result;
            }
        }

        // Check if there are remaining items in the first iterator
        const next1 = iterator1.next();
        if (!next1.done) {
            return -1;
        } else {
            // Check if there are remaining items in the second iterator
            const next2 = iterator2.next();
            if (!next2.done) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    /**
     * Return the pattern variant that matches the given path.
     *
     * @param pattern - The pattern to test.
     * @param path - The route path.
     * @returns The matching pattern, or `null`.
     */
    private _getMatchingPattern(pattern: string, path: string): string | null {
        // Root pattern "/" matches empty internal path ""
        if (pattern === '/' && path === '') {
            return pattern;
        }

        if (pattern === path) {
            return pattern;
        }

        const { pathMatcher, useTrailingSlashMatch } = this;

        if (pathMatcher.match(pattern, path)) {
            return pattern;
        }

        if (useTrailingSlashMatch) {
            const patternSlash = `${pattern}/`;
            if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                return patternSlash;
            }
        }

        return null;
    }
}
