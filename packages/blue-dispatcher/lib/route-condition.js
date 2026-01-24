import { like } from '@blue/util';
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
     * @function module:router.RouteConditionHolder#merge
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
 * Implements the {@linkcode module:router.RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
 *
 * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
 * @class module:dispatcher.CompositeRouteCondition
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
     * @function module:dispatcher.CompositeRouteCondition#merge
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWNvbmRpdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZWxDOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7OztHQU9HO0FBRUg7Ozs7OztHQU1HO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsQ0FFOUQsQ0FBQztBQUU3QixNQUFNLE9BQWdCLDJCQUEyQjtJQUNwQyxTQUFTLENBQVU7SUFDbkIsSUFBSSxDQUFTO0lBQ2IsS0FBSyxDQUFLO0lBSW5CLFlBQVksVUFBa0I7UUFDMUIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7Z0JBQzlCLEtBQUssRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDakMsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7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