import { Serializable, Equatable, JSONValue } from '@blue/core';
import { Route } from '@blue/router';
export interface NameValueExpression<T> {
    isNegated: boolean;
    name: string;
    value?: T;
}
export interface RouteCondition<T = any> {
    merge(value: T): T;
    getMatchingCondition(route: Route): T;
    compareTo(value: T, route?: Route): number;
}
/**
 * @function module:dispatcher.likeRouteCondition
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:router.RouteCondition|RouteCondition}.
 */
export declare const likeRouteCondition: (value: any) => value is RouteCondition;
export declare abstract class AbstractNameValueExpression<T> implements NameValueExpression<T>, Serializable {
    readonly isNegated: boolean;
    readonly name: string;
    readonly value?: T;
    abstract readonly isCaseSensitiveName: boolean;
    constructor(expression: string);
    match(route: Route): boolean;
    toJSON(): JSONValue;
    toString(): string;
    abstract matchName(route: Route): boolean;
    abstract matchValue(route: Route): boolean;
    abstract parseValue(valueExpression: string): T;
}
export declare abstract class AbstractRouteCondition<T extends AbstractRouteCondition<T>> implements Equatable, RouteCondition<T>, Serializable {
    get isEmpty(): boolean;
    abstract content: any[];
    abstract infix: string;
    equals(value: any): boolean;
    toJSON(): JSONValue;
    toString(): string;
    abstract merge(other: T): T;
    abstract getMatchingCondition(route: Route): T;
    abstract compareTo(value: T, route?: Route): number;
}
/**
 * Supports "name=value" style expressions.
 * @abstract
 * @class module:dispatcher.AbstractNameValueExpression
 * @implements module:dispatcher.NameValueExpression
 * @see {@link module:dispatcher.ParamExpression}
 */
/**
 * A base class for {@linkcode module:router.RouteCondition|RouteCondition} types.
 * @abstract
 * @class module:dispatcher.AbstractRouteCondition
 * @implements module:router.RouteCondition
 */
/**
 * The discrete items a route condition is composed of, e.g. URL patterns, param expressions, etc.
 * @abstract
 * @member module:dispatcher.AbstractRouteCondition#content
 */
/**
 * @class module:router.RouteConditionHolder
 * @extends module:dispatcher.AbstractRouteCondition<module:router.RouteConditionHolder>
 */
export declare class RouteConditionHolder extends AbstractRouteCondition<RouteConditionHolder> {
    readonly condition: RouteCondition;
    get content(): RouteCondition[];
    get infix(): string;
    constructor(routeCondition?: RouteCondition);
    /**
     * Combine the route conditions held by the two RouteConditionHolder instances after making sure the conditions are of the same type. Or if one holder is empty, the other holder is returned.
     * @function module:router.RouteConditionHolder#merge
     * @param {module:router.RouteConditionHolder} other
     * @returns {module:router.RouteConditionHolder}
     */
    merge(other: RouteConditionHolder): RouteConditionHolder;
    getMatchingCondition(route: Route): RouteConditionHolder;
    compareTo(value: RouteConditionHolder, route?: Route): number;
}
/**
 * Implements the {@linkcode module:router.RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
 *
 * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
 * @class module:dispatcher.CompositeRouteCondition
 */
export declare class CompositeRouteCondition extends AbstractRouteCondition<CompositeRouteCondition> {
    get infix(): string;
    get isEmpty(): boolean;
    get length(): number;
    get conditions(): RouteCondition[];
    get content(): RouteCondition[];
    readonly routeConditions: RouteConditionHolder[];
    constructor(...routeConditions: RouteCondition[] | RouteConditionHolder[]);
    /**
     * If one instance is empty, return the other. If both instances have conditions, combine the individual conditions after ensuring they are of the same type and number.
     * @function module:dispatcher.CompositeRouteCondition#merge
     * @param {module:dispatcher.CompositeRouteCondition} other
     * @returns {module:dispatcher.CompositeRouteCondition}
     */
    merge(other: CompositeRouteCondition): CompositeRouteCondition;
    getMatchingCondition(route: Route): CompositeRouteCondition;
    compareTo(value: CompositeRouteCondition, route?: Route): number;
    private _wrap;
    private _unwrap;
}
//# sourceMappingURL=route-condition.d.ts.map