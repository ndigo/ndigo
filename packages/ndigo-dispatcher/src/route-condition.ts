/**
 */
import { Serializable, Equatable, JSONValue, Matchable, ResultMatcher } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import { Route } from '@ndigo/router';

/**
 * Describes a parsed name/value expression.
 */
export interface NameValueExpression<T> {
    isNegated: boolean;
    name: string;
    value?: T;
}

/**
 * Contract for route matching conditions.
 */
export interface RouteCondition<T = unknown> extends ResultMatcher<Route, T> {
    /**
     * Merge this condition with another condition of the same type.
     *
     * @param value - The condition to merge with.
     * @returns The merged condition.
     */
    merge(value: T): T;

    /**
     * Return the condition that matches a route, or `null` when no match exists.
     *
     * @param route - The current route.
     * @returns A matching condition instance or `null`.
     */
    match(route: Route): T | null;

    /**
     * Compare this condition with another condition.
     *
     * @param value - The condition to compare against.
     * @param route - The route used to break ties, if needed.
     * @returns A comparison result compatible with `Array.prototype.sort`.
     */
    compareTo(value: T, route?: Route): number;
}

const { defineProperty } = Reflect;

/**
 * Tests whether a value behaves like a {@link RouteCondition|RouteCondition}.
 *
 * @param value - The value to test.
 * @returns `true` when the value is a RouteCondition.
 */
export const likeRouteCondition = like({ merge: Function, match: Function }) as (
    value: unknown
) => value is RouteCondition;

/**
 * Base class for parsed name/value expressions.
 */
export abstract class AbstractNameValueExpression<T> implements NameValueExpression<T>, Serializable, Matchable<Route> {
    readonly isNegated!: boolean;
    readonly name!: string;
    readonly value?: T;

    abstract readonly isCaseSensitiveName: boolean;

    /**
     * Parse a name/value expression.
     *
     * @param expression - The expression to parse.
     */
    constructor(expression: string) {
        const index = expression.indexOf('=');
        if (index === -1) {
            defineProperty(this, 'isNegated', {
                value: expression.startsWith('!'),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: this.isNegated ? expression.substring(1) : expression,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        } else {
            defineProperty(this, 'isNegated', {
                value: index > 0 && expression[index - 1] === '!',
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: this.isNegated ? expression.substring(0, index - 1) : expression.substring(0, index),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'value', {
                value: this.parseValue(expression.substring(index + 1)),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    }

    /**
     * Determine whether this expression matches the given route.
     *
     * A `name` expression (no `=`) matches on the name alone; a `name=`
     * expression — including the empty value — matches on value. The branch
     * uses `!== undefined` rather than truthiness so `name=` is not silently
     * treated as a name-only expression (which would accept any route
     * carrying the name, whatever its value).
     *
     * @param route - The current route.
     * @returns `true` when the expression matches.
     */
    match(route: Route): boolean {
        const isMatch = this.value !== void 0 ? this.matchValue(route) : this.matchName(route);
        return this.isNegated !== isMatch;
    }

    /**
     * Implements {@link Matchable}: equivalent to {@link match}. Gives the
     * matcher family (`RouteDefinition`, `PathRoute`, …) a single name
     * (MTC-1).
     *
     * @param value - The route to test.
     * @returns `true` when this expression matches the route.
     */
    matches(value: Route): boolean {
        return this.match(value);
    }

    /**
     * Serialize the expression to JSON.
     *
     * @returns The string form of the expression.
     */
    toJSON(): JSONValue {
        return this.toString();
    }

    /**
     * Convert the expression to its textual form.
     *
     * @returns The expression string.
     */
    toString(): string {
        const negate = this.isNegated ? '!' : '';
        return this.value !== void 0 ? `${this.name}${negate}=${this.value}` : `${negate}${this.name}`;
    }

    abstract matchName(route: Route): boolean;
    abstract matchValue(route: Route): boolean;
    abstract parseValue(valueExpression: string): T;
}

export abstract class AbstractRouteCondition<T extends AbstractRouteCondition<T>>
    implements Equatable, RouteCondition<T>, Serializable
{
    /**
     * Whether this condition contains no content.
     */
    get isEmpty(): boolean {
        return this.content.length === 0;
    }

    abstract content: unknown[];
    abstract infix: string;

    /**
     * Compare this condition to another value.
     *
     * @param value - The value to compare.
     * @returns `true` when both conditions are equivalent.
     */
    equals(value: unknown): boolean {
        if (this === value) {
            return true;
        }
        if (typeof value !== 'object' || value === null || this.constructor !== value.constructor) {
            return false;
        }
        return this.toString() === value.toString();
    }

    /**
     * Serialize the condition to JSON.
     *
     * @returns The string form of the condition.
     */
    toJSON(): JSONValue {
        return this.toString();
    }

    /**
     * Convert the condition to its textual form.
     *
     * @returns The condition string.
     */
    toString(): string {
        return `[${this.content.join(this.infix)}]`;
    }

    abstract merge(other: T): T;

    abstract match(route: Route): T | null;

    abstract compareTo(value: T, route?: Route): number;
}

/**
 * Supports "name=value" style expressions.
 *
 * @see {@link ParamExpression}
 */

/**
 * A base class for {@link RouteCondition|RouteCondition} types.
 */

/**
 * The discrete items a route condition is composed of, e.g. URL patterns, param expressions, etc.
 */

export class RouteConditionHolder extends AbstractRouteCondition<RouteConditionHolder> {
    /**
     * Wrapped condition, when present.
     */
    readonly condition!: RouteCondition;

    get content(): RouteCondition[] {
        return this.condition ? [this.condition] : [];
    }

    get infix(): string {
        return ' ';
    }

    /**
     * Create a holder for an optional condition.
     *
     * @param routeCondition - The wrapped condition, if any.
     */
    constructor(routeCondition: RouteCondition | null = null) {
        super();
        defineProperty(this, 'condition', {
            value: routeCondition,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Combine the route conditions held by the two RouteConditionHolder instances after making sure the conditions are of the same type. Or if one holder is empty, the other holder is returned.
     * @param {module:router.RouteConditionHolder} other
     * @returns {module:router.RouteConditionHolder}
     */
    /**
     * Merge two holders, preserving empty holders when possible.
     *
     * @param other - The holder to merge with.
     * @returns A merged holder.
     */
    merge(other: RouteConditionHolder): RouteConditionHolder {
        if (!this.condition && !other.condition) {
            return this;
        } else if (!this.condition) {
            return other;
        } else if (!other.condition) {
            return this;
        } else {
            const combined = this.condition.merge(other.condition);
            // merge returns the same concrete condition type this holder wraps;
            // the RouteCondition<unknown> interface is widened only here.
            return new RouteConditionHolder(combined as RouteCondition);
        }
    }

    /**
     * Return a holder for the wrapped condition when it matches the route.
     *
     * @param route - The current route.
     * @returns A matching holder, or `null`.
     */
    match(route: Route): RouteConditionHolder | null {
        if (!this.condition) {
            return this;
        }
        // A matching condition is the same concrete type this holder wraps;
        // the RouteCondition<unknown> interface is widened only here.
        const match = this.condition.match(route) as RouteCondition | null;
        return match ? new RouteConditionHolder(match) : null;
    }

    /**
     * Compare two holders by comparing their wrapped conditions.
     *
     * @param value - The holder to compare.
     * @param route - The route used to break ties, if needed.
     * @returns A comparison result.
     */
    compareTo(value: RouteConditionHolder, route?: Route): number {
        if (!this.condition && !value.condition) {
            return 0;
        } else if (!this.condition) {
            return 1;
        } else if (!value.condition) {
            return -1;
        } else {
            return this.condition.compareTo(value.condition, route);
        }
    }
}

/**
 * Implements the {@link RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
 *
 * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
 */
export class CompositeRouteCondition extends AbstractRouteCondition<CompositeRouteCondition> {
    get infix(): string {
        return ' && ';
    }

    get isEmpty(): boolean {
        return this.length === 0;
    }

    get length(): number {
        return this.routeConditions.length;
    }

    get conditions(): RouteCondition[] {
        return this._unwrap(...this.routeConditions);
    }

    get content(): RouteCondition[] {
        return !this.isEmpty ? this.conditions : [];
    }

    readonly routeConditions!: RouteConditionHolder[];

    /**
     * Create a composite condition from one or more route conditions.
     *
     * @param routeConditions - Conditions to combine.
     */
    constructor(...routeConditions: RouteCondition[] | RouteConditionHolder[]) {
        super();
        if (routeConditions.length) {
            if (likeRouteCondition(routeConditions[0])) {
                defineProperty(this, 'routeConditions', {
                    value: this._wrap(...routeConditions),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            } else {
                defineProperty(this, 'routeConditions', {
                    value: routeConditions,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }
        }
    }

    /**
     * If one instance is empty, return the other. If both instances have conditions, combine the individual conditions after ensuring they are of the same type and number.
     * @param {module:dispatcher.CompositeRouteCondition} other
     * @returns {module:dispatcher.CompositeRouteCondition}
     */
    /**
     * Merge two composite conditions element by element.
     *
     * @param other - The condition to merge with.
     * @returns The merged composite condition.
     */
    merge(other: CompositeRouteCondition): CompositeRouteCondition {
        if (this.isEmpty && other.isEmpty) {
            return this;
        } else if (other.isEmpty) {
            return this;
        } else if (this.isEmpty) {
            return other;
        } else {
            const length = this.length,
                combinedConditions: RouteConditionHolder[] = new Array<RouteConditionHolder>(length);
            for (let index = 0; index < length; index++) {
                combinedConditions[index] = this.routeConditions[index].merge(other.routeConditions[index]);
            }
            return new CompositeRouteCondition(...combinedConditions);
        }
    }

    /**
     * Return the subset of conditions that match the route.
     *
     * @param route - The current route.
     * @returns A matching composite condition, or `null`.
     */
    match(route: Route): CompositeRouteCondition | null {
        if (this.isEmpty) {
            return this;
        }
        const length = this.length,
            matchingConditions: (RouteConditionHolder | null)[] = new Array<RouteConditionHolder | null>(length);
        for (let index = 0; index < length; index++) {
            matchingConditions[index] = this.routeConditions[index].match(route);
            if (matchingConditions[index] === null) {
                return null;
            }
        }
        return new CompositeRouteCondition(...(matchingConditions as RouteConditionHolder[]));
    }

    /**
     * Compare two composite conditions in route-specific context.
     *
     * @param value - The condition to compare.
     * @param route - The route used to break ties, if needed.
     * @returns A comparison result.
     */
    compareTo(value: CompositeRouteCondition, route?: Route): number {
        if (this.isEmpty && value.isEmpty) {
            return 0;
        } else if (this.isEmpty) {
            return 1;
        } else if (value.isEmpty) {
            return -1;
        } else {
            const length = this.length;
            let index = 0;
            for (; index < length; index++) {
                const result = this.routeConditions[index].compareTo(value.routeConditions[index], route);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        }
    }

    private _wrap(...conditions: RouteCondition[]): RouteConditionHolder[] {
        return conditions.map((condition) => new RouteConditionHolder(condition));
    }

    private _unwrap(...wrappedConditions: RouteConditionHolder[]): RouteCondition[] {
        return wrappedConditions.map((wrappedCondition) => wrappedCondition.condition);
    }
}
