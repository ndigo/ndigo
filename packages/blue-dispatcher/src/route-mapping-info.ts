/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';
import { PathMatcher, GlobPathMatcher, likePathMatcher } from '@blue/core';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import {
    AbstractNameValueExpression,
    AbstractRouteCondition,
    RouteCondition,
    RouteConditionHolder,
    likeRouteCondition,
} from './route-condition';

const { defineProperty } = Reflect,
    { isArray } = Array,
    preprendPeriod = (value: string) => (value[0] === '.' ? value : `.${value}`),
    prependSlash = (value: string) => (value[0] === '/' ? value : `/${value}`),
    separator = '';

/*
export class AccessExpression extends AbstractNameValueExpression<boolean> {
    isCaseSensitiveName: boolean;

    matchName( route: Route ): boolean {
        return 'private' in route && route.private;
    }

    matchValue( route: Route ): boolean {
        return this.value === route.private;
    }

    parseValue( valueExpression: string ): boolean {
        throw new FrameworkError('Method not implemented.');
    }
}
*/

/**
 * Parses and matches a single parameter expression against a route.
 */
export class ParamExpression extends AbstractNameValueExpression<string> {
    /**
     * Parameter names that may satisfy this expression.
     */
    readonly namesToMatch: Set<string>;

    get isCaseSensitiveName(): boolean {
        return true;
    }

    /**
     * Parse a parameter expression.
     *
     * @param expression - The expression to parse.
     */
    constructor(expression: string) {
        super(expression);

        defineProperty(this, 'namesToMatch', {
            value: new Set<string>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.namesToMatch.add(this.name);
    }

    /**
     * Check whether the route contains a matching parameter name.
     *
     * @param route - The current route.
     * @returns `true` when the parameter name matches.
     */
    matchName(route: Route): boolean {
        for (const name of this.namesToMatch) {
            if ('data' in route && name in route.data) {
                return true;
            }
        }
        return 'data' in route && this.name in route.data;
    }

    /**
     * Check whether the route parameter value matches this expression.
     *
     * @param route - The current route.
     * @returns `true` when the parameter value matches.
     */
    matchValue(route: Route): boolean {
        return this.value === route.data[this.name];
    }

    /**
     * Return the parameter value as-is.
     *
     * @param valueExpression - The raw value expression.
     * @returns The parsed value.
     */
    parseValue(valueExpression: string): string {
        return valueExpression;
    }
}

/**
 * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in {@link RouteMapping|RouteMapping}.
 * @extends module:dispatcher.AbstractRouteCondition
 */
export class ParamsRouteCondition extends AbstractRouteCondition<ParamsRouteCondition> {
    /**
     * Parameter expressions that must all match.
     */
    readonly expressions: Set<ParamExpression>;

    get content(): ParamExpression[] {
        return Array.from(this.expressions);
    }

    get infix(): string {
        return ' && ';
    }

    /**
     * Create a parameter condition from one or more expressions.
     *
     * @param params - Parameter expressions to parse.
     */
    constructor(...params: string[]);
    /**
     * Create a parameter condition from a prebuilt expression set.
     *
     * @param conditions - The parameter expressions to use.
     */
    constructor(conditions: Set<ParamExpression>);
    constructor(paramOrConditions: string | Set<ParamExpression>, ...params: string[]) {
        super();
        defineProperty(this, 'expressions', {
            value:
                typeof paramOrConditions === 'string'
                    ? this._parseExpressions([paramOrConditions].concat(params))
                    : new Set<ParamExpression>(paramOrConditions),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Returns a new instance with the union of the param expressions from _this_ and the value provided.
     */
    /**
     * Merge parameter expressions from both conditions.
     *
     * @param value - The condition to merge with.
     * @returns A condition containing the union of expressions.
     */
    merge(value: ParamsRouteCondition): ParamsRouteCondition {
        const expressions: Set<ParamExpression> = new Set<ParamExpression>(this.expressions);

        for (const expression of value.expressions) {
            expressions.add(expression);
        }

        return new ParamsRouteCondition(expressions);
    }

    /**
     * Returns `this` instance if the route matches all param expressions or `null` otherwise.
     */
    /**
     * Return this condition when every expression matches the route.
     *
     * @param route - The current route.
     * @returns This condition, or `null`.
     */
    getMatchingCondition(route: Route): ParamsRouteCondition {
        for (const expression of this.expressions) {
            if (!expression.match(route)) {
                return null;
            }
        }
        return this;
    }

    /**
     * Compare to another condition based on parameter expressions. A condition is considered to be a more specific match, if it has:
     * - A greater number of expressions.
     * - A greater number of non-negated expressions with a concrete value.
     * @param {module:dispatcher.ParamsRouteCondition} value
     * @returns {number}
     */
    /**
     * Compare parameter conditions by specificity.
     *
     * @param value - The condition to compare.
     * @param route - Unused, but part of the shared contract.
     * @returns A comparison result.
     */
    compareTo(value: ParamsRouteCondition, route?: Route): number {
        const result = value.expressions.size - this.expressions.size;
        if (result !== 0) {
            return result;
        }
        return this._getValueMatchCount(value.expressions) - this._getValueMatchCount(this.expressions);
    }

    /**
     * Count the number of concrete, non-negated expressions.
     *
     * @param expressions - The expressions to inspect.
     * @returns The number of concrete value matches.
     */
    private _getValueMatchCount(expressions: Set<ParamExpression>): number {
        let count = 0;
        for (const expression of expressions) {
            if (expression.value !== void 0 && !expression.isNegated) {
                count++;
            }
        }
        return count;
    }

    /**
     * Parse parameter expressions into a set.
     *
     * @param params - The raw parameter expressions.
     * @returns The parsed expressions.
     */
    private _parseExpressions(params: string[]): Set<ParamExpression> {
        const expressions = new Set<ParamExpression>();
        params.forEach((param) => expressions.add(new ParamExpression(param)));
        return expressions;
    }
}

/**
 * Creates a new instance with the given route patterns. Each pattern that is not empty and does not start with "/" is prepended with "/".
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
/**
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
 * @param {module:core.PathMatcher} pathMatcher
 * @param {boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
 * @param {Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
 */
export class PatternsRouteCondition extends AbstractRouteCondition<PatternsRouteCondition> {
    /**
     * Matcher used to compare and merge route patterns.
     */
    readonly pathMatcher: PathMatcher;

    /**
     * File extensions that are treated as matchable suffixes.
     */
    fileExtensions: string[];

    /**
     * Route patterns to match against.
     */
    patterns: Set<string>;

    /**
     * Whether a trailing slash may be treated as equivalent.
     */
    useTrailingSlashMatch: boolean;

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

        // TODO Clean up this logic

        if (typeof patterns === 'string') {
            patterns = [patterns];
            if (typeof pathMatcherOrRouteCondition === 'string') {
                patterns.push(pathMatcherOrRouteCondition);
                pathMatcherOrRouteCondition = new GlobPathMatcher();
            }
            if (typeof useTrailingSlashMatch === 'string') {
                patterns.push(useTrailingSlashMatch);
                useTrailingSlashMatch = true;
            }
            if (typeof fileExtensions === 'string') {
                patterns.push(fileExtensions);
                fileExtensions = [];
            }
            if (isArray(morePatterns) && morePatterns.length) {
                patterns = patterns.concat(morePatterns);
            }
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
                value: new GlobPathMatcher(),
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
    getMatchingCondition(route: Route): PatternsRouteCondition {
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
            // TODO Use pattern comparator
            matches.sort();
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

        for (let item1, item2; !(item1 = iterator1.next()).done && !(item2 = iterator2.next()).done; ) {
            const result = patternComparator.compare(item1, item2);
            if (result !== 0) {
                return result;
            }
        }

        if (!iterator1.next().done) {
            return -1;
        } else if (!iterator2.next().done) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Return the pattern variant that matches the given path.
     *
     * @param pattern - The pattern to test.
     * @param path - The route path.
     * @returns The matching pattern, or `null`.
     */
    private _getMatchingPattern(pattern: string, path: string): string {
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

export class RouteMappingInfo implements RouteCondition<RouteMappingInfo> {
    /**
     * Optional mapping name.
     */
    readonly name: string;

    /**
     * Pattern matching condition.
     */
    readonly patternsCondition: PatternsRouteCondition;

    /**
     * Parameter matching condition.
     */
    readonly paramsCondition: ParamsRouteCondition;

    /**
     * Custom condition wrapper.
     */
    readonly customConditionHolder: RouteConditionHolder;

    /**
     * Create route mapping metadata for a handler method.
     *
     * @param name - The mapping name.
     * @param patterns - Pattern matching condition.
     * @param params - Parameter matching condition.
     * @param custom - Optional custom condition.
     */
    constructor(
        name: string = null,
        patterns: PatternsRouteCondition = new PatternsRouteCondition(),
        params: ParamsRouteCondition = new ParamsRouteCondition(),
        custom: RouteCondition = null
    ) {
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'patternsCondition', {
            value: patterns,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'paramsCondition', {
            value: params,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'customConditionHolder', {
            value: new RouteConditionHolder(custom),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Merge this mapping info with another.
     *
     * @param value - The mapping info to merge with.
     * @returns The merged mapping info.
     */
    merge(value: RouteMappingInfo): RouteMappingInfo {
        const name = this._mergeNames(value),
            params = this.paramsCondition.merge(value.paramsCondition),
            patterns = this.patternsCondition.merge(value.patternsCondition),
            custom = this.customConditionHolder.merge(value.customConditionHolder);

        return new RouteMappingInfo(name, patterns, params, custom.condition);
    }

    /**
     * Return a condition instance that matches the current route.
     *
     * @param route - The current route.
     * @returns A matching mapping info, or `null`.
     */
    getMatchingCondition(route: Route): RouteMappingInfo {
        const params = this.paramsCondition.getMatchingCondition(route);
        if (!params) {
            return null;
        }

        const patterns = this.patternsCondition.getMatchingCondition(route);
        if (!patterns) {
            return null;
        }

        const custom = this.customConditionHolder.getMatchingCondition(route);
        if (!custom) {
            return null;
        }

        return new RouteMappingInfo(this.name, patterns, params, custom.condition);
    }

    /**
     * Compare mapping info by parameter, pattern, and custom specificity.
     *
     * @param value - The mapping info to compare.
     * @param route - The current route.
     * @returns A comparison result.
     */
    compareTo(value: RouteMappingInfo, route: Route): number {
        let result: number;

        result = this.paramsCondition.compareTo(value.paramsCondition, route);
        if (result !== 0) {
            return result;
        }

        result = this.patternsCondition.compareTo(value.patternsCondition, route);
        if (result !== 0) {
            return result;
        }

        result = this.customConditionHolder.compareTo(value.customConditionHolder, route);
        if (result !== 0) {
            return result;
        }

        return 0;
    }

    /**
     * Merge mapping names while preserving path separators.
     *
     * @param value - The mapping info to merge names from.
     * @returns The merged name.
     */
    private _mergeNames(value: RouteMappingInfo): string {
        if (this.name && value.name) {
            return `${this.name}${separator}${value.name}`.replace(/\/\//g, '/');
        } else if (this.name) {
            return this.name;
        } else {
            return value.name;
        }
    }
}

export class RouteMappingInfoHandlerMethodMappingNamingStrategy
    implements RouteHandlerMethodMappingNamingStrategy<RouteMappingInfo>
{
    /**
     * Separator used when generating fallback mapping names.
     */
    static readonly separator: string;

    /**
     * Create a mapping name from the handler method and mapping metadata.
     *
     * @param handlerMethod - The handler method being named.
     * @param mapping - The associated route mapping metadata.
     * @returns The mapping name.
     */
    getName(handlerMethod: RouteHandlerMethod, mapping: RouteMappingInfo): string {
        if (mapping.name) {
            return mapping.name;
        }

        return `${handlerMethod.name}${separator}${handlerMethod.method}`;
    }
}

defineProperty(RouteMappingInfoHandlerMethodMappingNamingStrategy, 'separator', {
    value: separator,
    configurable: true,
    enumerable: false,
    writable: false,
});

/**
 * * Developer Notes
 * TODO Create a condition for public vs. private routes if that's still going to be a thing in BlueJS3
 * ? Should we grab cookies and put them on the Route so developers don't need to touch document? If so a condition needs to be made.
 */
