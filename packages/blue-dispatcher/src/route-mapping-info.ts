/**
 * @author Jeff Rose
 */

import { Route, RouteSegment } from '@blue/router';
import { PathMatcher, URLGlobPathMatcher, likePathMatcher } from '@blue/core';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import {
    AbstractNameValueExpression,
    AbstractRouteCondition,
    RouteCondition,
    RouteConditionHolder,
    likeRouteCondition,
} from './route-condition';
import { AccessControlCondition } from './access-control-condition';

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
 * Parses and matches a single URL query-string parameter expression against a route.
 *
 * Query parameters are the `?key=value` pairs carried in `Route.data`.
 * For path-segment matrix parameters (`/path;key=value`), see {@link MatrixParamExpression}.
 */
export class QueryParamExpression extends AbstractNameValueExpression<string> {
    /**
     * Parameter names that may satisfy this expression.
     */
    readonly namesToMatch!: Set<string>;

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
        return false;
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
export class QueryParamCondition extends AbstractRouteCondition<QueryParamCondition> {
    /**
     * Parameter expressions that must all match.
     */
    readonly expressions!: Set<QueryParamExpression>;

    get content(): QueryParamExpression[] {
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
    constructor(conditions: Set<QueryParamExpression>);
    constructor(paramOrConditions: string | Set<QueryParamExpression>, ...params: string[]) {
        super();
        defineProperty(this, 'expressions', {
            value:
                typeof paramOrConditions === 'string'
                    ? this._parseExpressions([paramOrConditions].concat(params))
                    : new Set<QueryParamExpression>(paramOrConditions),
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
    merge(value: QueryParamCondition): QueryParamCondition {
        const expressions: Set<QueryParamExpression> = new Set<QueryParamExpression>(this.expressions);

        for (const expression of value.expressions) {
            expressions.add(expression);
        }

        return new QueryParamCondition(expressions);
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
    getMatchingCondition(route: Route): QueryParamCondition | null {
        for (const expression of this.expressions) {
            if (!expression.match(route)) {
                return null;
            }
        }
        return this;
    }

    /**
     * Compare parameter conditions by specificity.
     *
     * @param value - The condition to compare.
     * @param route - Unused, but part of the shared contract.
     * @returns A comparison result.
     */
    compareTo(value: QueryParamCondition, route?: Route): number {
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
    private _getValueMatchCount(expressions: Set<QueryParamExpression>): number {
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
    private _parseExpressions(params: string[]): Set<QueryParamExpression> {
        const expressions = new Set<QueryParamExpression>();
        params.forEach((param) => expressions.add(new QueryParamExpression(param)));
        return expressions;
    }
}

/**
 * Parses and matches a single matrix-parameter expression against a route segment.
 *
 * Matrix parameters are per-segment key=value pairs carried in `RouteSegment.data`.
 * This expression walks every segment of the route looking for a matching name/value pair.
 */
export class MatrixParamExpression extends AbstractNameValueExpression<string> {
    get isCaseSensitiveName(): boolean {
        return true;
    }

    /**
     * Check whether any route segment contains a matching matrix-parameter name.
     *
     * @param route - The current route.
     * @returns `true` when at least one segment carries the parameter name.
     */
    matchName(route: Route): boolean {
        const length: number = route.length ?? 0;
        for (let i = 0; i < length; i++) {
            const segment: RouteSegment = route[i];
            if (segment?.data && this.name in segment.data) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check whether any route segment carries the expected matrix-parameter value.
     *
     * @param route - The current route.
     * @returns `true` when at least one segment matches both name and value.
     */
    matchValue(route: Route): boolean {
        // Intentional: matches if any segment carries the expected value,
        // consistent with cross-segment name scanning in matchName.
        const length: number = route.length ?? 0;
        for (let i = 0; i < length; i++) {
            const segment: RouteSegment = route[i];
            if (segment?.data && segment.data[this.name] === this.value) {
                return true;
            }
        }
        return false;
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

// TODO: When a third param-condition type is added, extract AbstractParamCondition<E extends AbstractNameValueExpression<string>> (Rule of Three).
/**
 * A logical conjunction ('&&') route condition that matches a route against
 * a set of matrix-parameter expressions.
 */
export class MatrixParamCondition extends AbstractRouteCondition<MatrixParamCondition> {
    /**
     * Matrix-parameter expressions that must all match.
     */
    readonly expressions!: Set<MatrixParamExpression>;

    get content(): MatrixParamExpression[] {
        return Array.from(this.expressions);
    }

    get infix(): string {
        return ' && ';
    }

    /**
     * Create a matrix-parameter condition from one or more expressions.
     *
     * @param params - Matrix-parameter expressions to parse.
     */
    constructor(...params: string[]);
    /**
     * Create a matrix-parameter condition from a prebuilt expression set.
     *
     * @param conditions - The matrix-parameter expressions to use.
     */
    constructor(conditions: Set<MatrixParamExpression>);
    constructor(paramOrConditions: string | Set<MatrixParamExpression>, ...params: string[]) {
        super();
        defineProperty(this, 'expressions', {
            value:
                typeof paramOrConditions === 'string'
                    ? this._parseExpressions([paramOrConditions].concat(params))
                    : new Set<MatrixParamExpression>(paramOrConditions),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Merge matrix-parameter expressions from both conditions.
     *
     * @param value - The condition to merge with.
     * @returns A condition containing the union of expressions.
     */
    merge(value: MatrixParamCondition): MatrixParamCondition {
        const expressions = new Set<MatrixParamExpression>(this.expressions);
        for (const expression of value.expressions) {
            expressions.add(expression);
        }
        return new MatrixParamCondition(expressions);
    }

    /**
     * Return this condition when every expression matches the route.
     *
     * @param route - The current route.
     * @returns This condition, or `null`.
     */
    getMatchingCondition(route: Route): MatrixParamCondition | null {
        for (const expression of this.expressions) {
            if (!expression.match(route)) {
                return null;
            }
        }
        return this;
    }

    /**
     * Compare matrix-parameter conditions by specificity.
     *
     * @param value - The condition to compare.
     * @param route - Unused, part of the shared contract.
     * @returns A comparison result.
     */
    compareTo(value: MatrixParamCondition, route?: Route): number {
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
    private _getValueMatchCount(expressions: Set<MatrixParamExpression>): number {
        let count = 0;
        for (const expression of expressions) {
            if (expression.value !== void 0 && !expression.isNegated) {
                count++;
            }
        }
        return count;
    }

    /**
     * Parse matrix-parameter expressions into a set.
     *
     * @param params - The raw matrix-parameter expressions.
     * @returns The parsed expressions.
     */
    private _parseExpressions(params: string[]): Set<MatrixParamExpression> {
        const expressions = new Set<MatrixParamExpression>();
        params.forEach((param) => expressions.add(new MatrixParamExpression(param)));
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

        // TODO Clean up this logic

        if (typeof patterns === 'string') {
            patterns = [patterns];
            if (typeof pathMatcherOrRouteCondition === 'string') {
                patterns.push(pathMatcherOrRouteCondition);
                pathMatcherOrRouteCondition = new URLGlobPathMatcher();
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
    getMatchingCondition(route: Route): PatternsRouteCondition | null {
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

export class RouteMappingInfo implements RouteCondition<RouteMappingInfo> {
    /**
     * Optional mapping name.
     */
    readonly name!: string;

    /**
     * Pattern matching condition.
     */
    readonly patternsCondition!: PatternsRouteCondition;

    /**
     * Query-parameter matching condition.
     */
    readonly queryCondition!: QueryParamCondition;

    /**
     * Matrix-parameter matching condition.
     */
    readonly matrixCondition!: MatrixParamCondition;

    /**
     * Custom condition wrapper.
     */
    readonly customConditionHolder!: RouteConditionHolder;

    /**
     * Optional access-control condition (public vs. private routes).
     */
    readonly accessCondition!: AccessControlCondition | null;

    /**
     * Create route mapping metadata for a handler method.
     *
     * @param name - The mapping name.
     * @param patterns - Pattern matching condition.
     * @param params - Query-parameter matching condition.
     * @param matrix - Matrix-parameter matching condition.
     * @param custom - Optional custom condition.
     * @param access - Optional access level (`'public'` or `'private'`).
     */
    constructor(
        name: string | null = null,
        patterns: PatternsRouteCondition = new PatternsRouteCondition(),
        params: QueryParamCondition = new QueryParamCondition(),
        matrix: MatrixParamCondition = new MatrixParamCondition(),
        custom: RouteCondition<any> | null = null,
        access: AccessControlCondition | null = null
    ) {
        this.name = name || '';
        this.patternsCondition = patterns;
        this.queryCondition = params;
        this.matrixCondition = matrix;
        this.customConditionHolder = new RouteConditionHolder(custom);
        this.accessCondition = access;
    }

    /**
     * Merge this mapping info with another.
     *
     * @param value - The mapping info to merge with.
     * @returns The merged mapping info.
     */
    merge(value: RouteMappingInfo): RouteMappingInfo {
        const name = this._mergeNames(value),
            params = this.queryCondition.merge(value.queryCondition),
            matrix = this.matrixCondition.merge(value.matrixCondition),
            patterns = this.patternsCondition.merge(value.patternsCondition),
            custom = this.customConditionHolder.merge(value.customConditionHolder);

        // Merge access conditions: the most restrictive level wins (private > public).
        const mergedAccess =
            this.accessCondition && value.accessCondition
                ? this.accessCondition.merge(value.accessCondition)
                : this.accessCondition ?? value.accessCondition;

        return new RouteMappingInfo(name, patterns, params, matrix, custom.condition, mergedAccess);
    }

    /**
     * Return a condition instance that matches the current route.
     *
     * @param route - The current route.
     * @returns A matching mapping info, or `null`.
     */
    getMatchingCondition(route: Route): RouteMappingInfo | null {
        // Check patterns first — most discriminating filter, eliminates non-matching
        // routes before the cheaper param/matrix checks run.
        const patterns = this.patternsCondition.getMatchingCondition(route);
        if (!patterns) {
            return null;
        }

        const params = this.queryCondition.getMatchingCondition(route);
        if (!params) {
            return null;
        }

        const matrix = this.matrixCondition.getMatchingCondition(route);
        if (!matrix) {
            return null;
        }

        const custom = this.customConditionHolder.getMatchingCondition(route);
        if (!custom) {
            return null;
        }

        // Check access control — private routes require an authenticated principal.
        if (this.accessCondition) {
            const accessMatch = this.accessCondition.getMatchingCondition(route);
            if (!accessMatch) {
                return null;
            }
            return new RouteMappingInfo(
                this.name, patterns, params, matrix, custom.condition,
                accessMatch
            );
        }

        return new RouteMappingInfo(this.name, patterns, params, matrix, custom.condition);
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

        result = this.queryCondition.compareTo(value.queryCondition, route);
        if (result !== 0) {
            return result;
        }

        result = this.matrixCondition.compareTo(value.matrixCondition, route);
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

        // Access-specific comparison: private routes are more specific than public.
        if (this.accessCondition && value.accessCondition) {
            result = this.accessCondition.compareTo(value.accessCondition, route);
            if (result !== 0) {
                return result;
            }
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