import { like } from '@blue/util';
/**
 * A contract for `"name!=value"` style expression used to specify route parameters.
 */
/**
 */
/**
 */
/**
 */
/**
 * Contract for route mapping conditions.
 *
 * Request conditions can be combined via {@link RouteCondition#merge|merge()}, matched to a route via {@link RouteCondition#getMatchingCondition|getMatchingCondition()}, and compared to each other via {@link RouteCondition#compareTo|compareTo()} to determine which is a closer match to the given route.
 */
/**
 * Merge this condition with another such as conditions from a type-level and method-level `RequestMapping` decorator.
 * @param {*} value
 * @returns {*}
 */
/**
 * Check if the condition matches the route returning a potentially new instance created for the current route.
 *
 * For example a condition with multiple path patterns may return a new instance only with those patterns that match the route.
 * @param {module:dispatcher.Request} route
 * @returns {*} A condition instance in case of a match or `null` otherwise.
 */
/**
 * Compare this condition to another condition, optionally in the context of a specific route. This method assumes both instances have been obtained via `getMatchingCondition`.
 * @param {*} value
 * @param {module:dispatcher.Request} [route]
 * @returns {number}
 */
const { defineProperty } = Reflect;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link RouteCondition|RouteCondition}.
 */
export const likeRouteCondition = like({ merge: Function, getMatchingCondition: Function });
export class AbstractNameValueExpression {
    isNegated;
    name;
    value;
    constructor(expression) {
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
        }
        else {
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
    match(route) {
        let isMatch = this.value ? this.matchValue(route) : this.matchName(route);
        return this.isNegated !== isMatch;
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        const negate = this.isNegated ? '!' : '';
        return this.value !== void 0 ? `${this.name}${negate}=${this.value}` : `${negate}${this.name}`;
    }
}
export class AbstractRouteCondition {
    get isEmpty() {
        return this.content.length === 0;
    }
    equals(value) {
        if (this === value) {
            return true;
        }
        if (value === void 0 || this.constructor !== value.constructor) {
            return false;
        }
        return this.toString() === value.toString();
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        return `[${this.content.join(this.infix)}]`;
    }
}
/**
 * Supports "name=value" style expressions.
 * @abstract
 * @implements module:dispatcher.NameValueExpression
 * @see {@link ParamExpression}
 */
/**
 * A base class for {@link RouteCondition|RouteCondition} types.
 * @abstract
 * @implements module:router.RouteCondition
 */
/**
 * The discrete items a route condition is composed of, e.g. URL patterns, param expressions, etc.
 * @abstract
 */
/**
 * @extends module:dispatcher.AbstractRouteCondition<module:router.RouteConditionHolder>
 */
export class RouteConditionHolder extends AbstractRouteCondition {
    condition;
    get content() {
        return this.condition ? [this.condition] : [];
    }
    get infix() {
        return ' ';
    }
    constructor(routeCondition = null) {
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
    merge(other) {
        if (!this.condition && !other.condition) {
            return this;
        }
        else if (!this.condition) {
            return other;
        }
        else if (!other.condition) {
            return this;
        }
        else {
            const combined = this.condition.merge(other.condition);
            return new RouteConditionHolder(combined);
        }
    }
    getMatchingCondition(route) {
        if (!this.condition) {
            return this;
        }
        const match = this.condition.getMatchingCondition(route);
        return match ? new RouteConditionHolder(match) : null;
    }
    compareTo(value, route) {
        if (!this.condition && !value.condition) {
            return 0;
        }
        else if (!this.condition) {
            return 1;
        }
        else if (!value.condition) {
            return -1;
        }
        else {
            return this.condition.compareTo(value.condition, route);
        }
    }
}
/**
 * Implements the {@link RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
 *
 * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
 */
export class CompositeRouteCondition extends AbstractRouteCondition {
    get infix() {
        return ' && ';
    }
    get isEmpty() {
        return this.length === 0;
    }
    get length() {
        return this.routeConditions.length;
    }
    get conditions() {
        return this._unwrap(...this.routeConditions);
    }
    get content() {
        return !this.isEmpty ? this.conditions : [];
    }
    routeConditions;
    constructor(...routeConditions) {
        super();
        if (routeConditions.length) {
            if (likeRouteCondition(routeConditions[0])) {
                defineProperty(this, 'routeConditions', {
                    value: this._wrap(...routeConditions),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }
            else {
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
    merge(other) {
        if (this.isEmpty && other.isEmpty) {
            return this;
        }
        else if (other.isEmpty) {
            return this;
        }
        else if (this.isEmpty) {
            return other;
        }
        else {
            const length = this.length, combinedConditions = new Array(length);
            for (let index = 0; index < length; index++) {
                combinedConditions[index] = this.routeConditions[index].merge(other.routeConditions[index]);
            }
            return new CompositeRouteCondition(...combinedConditions);
        }
    }
    getMatchingCondition(route) {
        if (this.isEmpty) {
            return this;
        }
        const length = this.length, matchingConditions = new Array(length);
        for (let index = 0; index < length; index++) {
            matchingConditions[index] = this.routeConditions[index].getMatchingCondition(route);
            if (matchingConditions[index] === null) {
                return null;
            }
        }
        return new CompositeRouteCondition(...matchingConditions);
    }
    compareTo(value, route) {
        if (this.isEmpty && value.isEmpty) {
            return 0;
        }
        else if (this.isEmpty) {
            return 1;
        }
        else if (value.isEmpty) {
            return -1;
        }
        else {
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
    _wrap(...conditions) {
        return conditions.map((condition) => new RouteConditionHolder(condition));
    }
    _unwrap(...wrappedConditions) {
        return wrappedConditions.map((wrappedCondition) => wrappedCondition.condition);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWNvbmRpdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZWxDOztHQUVHO0FBRUg7R0FDRztBQUVIO0dBQ0c7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsQ0FFOUQsQ0FBQztBQUU3QixNQUFNLE9BQWdCLDJCQUEyQjtJQUNwQyxTQUFTLENBQVU7SUFDbkIsSUFBSSxDQUFTO0lBQ2IsS0FBSyxDQUFLO0lBSW5CLFlBQVksVUFBa0I7UUFDMUIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7Z0JBQzlCLEtBQUssRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDakMsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7Z0JBQzVELFlB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