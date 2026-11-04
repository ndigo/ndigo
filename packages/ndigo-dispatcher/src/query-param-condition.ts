/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Route } from '@ndigo/router';
import { AbstractNameValueExpression, AbstractRouteCondition } from './route-condition';
const { defineProperty } = Reflect;

/**
 * Parses and matches a single URL query-string parameter expression against a route.
 *
 * Query parameters are the `?key=value` pairs carried in `Route.data`.
 * Repeated keys aggregate into arrays, and a `key=value` expression matches
 * when any element equals `value` (`?q=a&q=b` matches `q=a` and `q=b`).
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
     * A route value may be an array when the query string repeats a key
     * (`?q=a&q=b` parses to `['a', 'b']`); the expression matches when any
     * element equals the expected value. A single value matches by strict
     * equality, so `q=` matches only an explicit empty-string value.
     *
     * @param route - The current route.
     * @returns `true` when the parameter value matches.
     */
    matchValue(route: Route): boolean {
        const routeValue = route.data[this.name];
        return Array.isArray(routeValue) ? routeValue.some((value) => value === this.value) : this.value === routeValue;
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
 * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in `RouteMapping`.
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
    match(route: Route): QueryParamCondition | null {
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
