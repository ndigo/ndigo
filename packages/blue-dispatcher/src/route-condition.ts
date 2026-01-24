import { Serializable, Equatable, JSONValue } from '@blue/core';
import { like } from '@blue/util';
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
 * A contract for `"name!=value"` style expression used to specify route parameters.
 * @interface module:dispatcher.NameValueExpression
 */

/**
 * @member {external:boolean} module:dispatcher.NameValueExpression#isNegated
 */

/**
 * @member {external:string} module:dispatcher.NameValueExpression#name
 */

/**
 * @member {*} module:dispatcher.NameValueExpression#value
 */

/**
 * Contract for route mapping conditions.
 *
 * Request conditions can be combined via {@linkcode module:router.RouteCondition#merge|merge()}, matched to a route via {@linkcode module:router.RouteCondition#getMatchingCondition|getMatchingCondition()}, and compared to each other via {@linkcode module:router.RouteCondition#compareTo|compareTo()} to determine which is a closer match to the given route.
 * @interface module:router.RouteCondition
 */

/**
 * Merge this condition with another such as conditions from a type-level and method-level `RequestMapping` decorator.
 * @function module:router.RouteCondition#merge
 * @param {*} value
 * @return {*}
 */

/**
 * Check if the condition matches the route returning a potentially new instance created for the current route.
 *
 * For example a condition with multiple path patterns may return a new instance only with those patterns that match the route.
 * @function module:router.RouteCondition#getMatchingCondition
 * @param {module:dispatcher.Request} route
 * @return {*} A condition instance in case of a match or `null` otherwise.
 */

/**
 * Compare this condition to another condition, optionally in the context of a specific route. This method assumes both instances have been obtained via `getMatchingCondition`.
 * @function module:router.RouteCondition#compareTo
 * @param {*} value
 * @param {module:dispatcher.Request} [route]
 * @return {external:number}
 */

const { defineProperty } = Reflect;

/**
 * @function module:dispatcher.likeRouteCondition
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:router.RouteCondition|RouteCondition}.
 */
export const likeRouteCondition = like({ merge: Function, getMatchingCondition: Function }) as (
    value
) => value is RouteCondition;

export abstract class AbstractNameValueExpression<T> implements NameValueExpression<T>, Serializable {
    readonly isNegated: boolean;
    readonly name: string;
    readonly value?: T;

    abstract readonly isCaseSensitiveName: boolean;

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

    match(route: Route): boolean {
        let isMatch = this.value ? this.matchValue(route) : this.matchName(route);
        return this.isNegated !== isMatch;
    }

    toJSON(): JSONValue {
        return this.toString();
    }

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
    get isEmpty(): boolean {
        return this.content.length === 0;
    }

    abstract content: any[];
    abstract infix: string;

    equals(value): boolean {
        if (this === value) {
            return true;
        }
        if (value === void 0 || this.constructor !== value.constructor) {
            return false;
        }
        return this.toString() === value.toString();
    }

    toJSON(): JSONValue {
        return this.toString();
    }

    toString(): string {
        return `[${this.content.join(this.infix)}]`;
    }

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
export class RouteConditionHolder extends AbstractRouteCondition<RouteConditionHolder> {
    readonly condition: RouteCondition;

    get content(): RouteCondition[] {
        return this.condition ? [this.condition] : [];
    }

    get infix(): string {
        return ' ';
    }

    constructor(routeCondition: RouteCondition = null) {
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
     * @function module:router.RouteConditionHolder#merge
     * @param {module:router.RouteConditionHolder} other
     * @returns {module:router.RouteConditionHolder}
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
            return new RouteConditionHolder(combined);
        }
    }

    getMatchingCondition(route: Route): RouteConditionHolder {
        if (!this.condition) {
            return this;
        }
        const match: RouteCondition = this.condition.getMatchingCondition(route);
        return match ? new RouteConditionHolder(match) : null;
    }

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
 * Implements the {@linkcode module:router.RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
 *
 * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
 * @class module:dispatcher.CompositeRouteCondition
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

    readonly routeConditions: RouteConditionHolder[];

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
     * @function module:dispatcher.CompositeRouteCondition#merge
     * @param {module:dispatcher.CompositeRouteCondition} other
     * @returns {module:dispatcher.CompositeRouteCondition}
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

    getMatchingCondition(route: Route): CompositeRouteCondition {
        if (this.isEmpty) {
            return this;
        }
        const length = this.length,
            matchingConditions: RouteConditionHolder[] = new Array<RouteConditionHolder>(length);
        for (let index = 0; index < length; index++) {
            matchingConditions[index] = this.routeConditions[index].getMatchingCondition(route);
            if (matchingConditions[index] === null) {
                return null;
            }
        }
        return new CompositeRouteCondition(...matchingConditions);
    }

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
