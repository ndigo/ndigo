/**
 * @author Jeff Rose
 */

import { Route, RouteSegment } from '@blue/router';
import { AbstractNameValueExpression, AbstractRouteCondition } from './route-condition';
const { defineProperty } = Reflect;

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
