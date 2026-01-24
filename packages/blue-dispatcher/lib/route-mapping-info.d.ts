/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
import { PathMatcher } from '@blue/core';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { AbstractNameValueExpression, AbstractRouteCondition, RouteCondition, RouteConditionHolder } from './route-condition';
/**
 * Parses and matches a single param expression to a route.
 * @class module:dispatcher.ParamExpression
 * @extends module:dispatcher.AbstractNameValueExpression<external:string>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
export declare class ParamExpression extends AbstractNameValueExpression<string> {
    readonly namesToMatch: Set<string>;
    get isCaseSensitiveName(): boolean;
    constructor(expression: string);
    matchName(route: Route): boolean;
    matchValue(route: Route): boolean;
    parseValue(valueExpression: string): string;
}
/**
 * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in {@linkcode module:dispatcher.RouteMapping|RouteMapping}.
 * @class module:dispatcher.ParamsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition
 */
export declare class ParamsRouteCondition extends AbstractRouteCondition<ParamsRouteCondition> {
    readonly expressions: Set<ParamExpression>;
    get content(): ParamExpression[];
    get infix(): string;
    constructor(...params: string[]);
    constructor(conditions: Set<ParamExpression>);
    /**
     * Returns a new instance with the union of the param expressions from _this_ and the value provided.
     */
    merge(value: ParamsRouteCondition): ParamsRouteCondition;
    /**
     * Returns `this` instance if the route matches all param expressions or `null` otherwise.
     */
    getMatchingCondition(route: Route): ParamsRouteCondition;
    /**
     * Compare to another condition based on parameter expressions. A condition is considered to be a more specific match, if it has:
     * - A greater number of expressions.
     * - A greater number of non-negated expressions with a concrete value.
     * @function module:dispatcher.ParamsRouteCondition#compareTo
     * @param {module:dispatcher.ParamsRouteCondition} value
     * @returns {external:number}
     */
    compareTo(value: ParamsRouteCondition, route?: Route): number;
    private _getValueMatchCount;
    private _parseExpressions;
}
/**
 * Creates a new instance with the given route patterns. Each pattern that is not empty and does not start with "/" is prepended with "/".
 * @class module:dispatcher.PatternsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
 */
/**
 * @class module:dispatcher.PatternsRouteCondition
 * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
 * @param {external:Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
 * @param {module:core.PathMatcher} pathMatcher
 * @param {external:boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
 * @param {external:Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
 */
export declare class PatternsRouteCondition extends AbstractRouteCondition<PatternsRouteCondition> {
    readonly pathMatcher: PathMatcher;
    fileExtensions: string[];
    patterns: Set<string>;
    useTrailingSlashMatch: boolean;
    get content(): string[];
    get infix(): string;
    constructor(...patterns: string[]);
    constructor(patterns: Set<string>, routeCondition?: PatternsRouteCondition);
    constructor(patterns: string[], pathMatcher: PathMatcher, useTrailingSlashMatch: boolean, fileExtensions: string[]);
    merge(value: PatternsRouteCondition): PatternsRouteCondition;
    getMatchingCondition(route: Route): PatternsRouteCondition;
    getMatchingPatterns(path: string): string[];
    compareTo(value: PatternsRouteCondition, route: Route): number;
    private _getMatchingPattern;
}
export declare class RouteMappingInfo implements RouteCondition<RouteMappingInfo> {
    readonly name: string;
    readonly patternsCondition: PatternsRouteCondition;
    readonly paramsCondition: ParamsRouteCondition;
    readonly customConditionHolder: RouteConditionHolder;
    constructor(name?: string, patterns?: PatternsRouteCondition, params?: ParamsRouteCondition, custom?: RouteCondition);
    merge(value: RouteMappingInfo): RouteMappingInfo;
    getMatchingCondition(route: Route): RouteMappingInfo;
    compareTo(value: RouteMappingInfo, route: Route): number;
    private _mergeNames;
}
export declare class RouteMappingInfoHandlerMethodMappingNamingStrategy implements RouteHandlerMethodMappingNamingStrategy<RouteMappingInfo> {
    static readonly separator: string;
    getName(handlerMethod: RouteHandlerMethod, mapping: RouteMappingInfo): string;
}
/**
 * * Developer Notes
 * TODO Create a condition for public vs. private routes if that's still going to be a thing in BlueJS3
 * ? Should we grab cookies and put them on the Route so developers don't need to touch document? If so a condition needs to be made.
 */
//# sourceMappingURL=route-mapping-info.d.ts.map