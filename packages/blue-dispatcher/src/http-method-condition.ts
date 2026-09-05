/**
 * A route condition that matches an HTTP request method.
 *
 * Follows the same pattern as `QueryParamCondition` / `MatrixParamCondition`
 * so the shared mapping stack (`RouteMappingInfo`) treats it uniformly.
 * A condition with no method (`undefined`) matches any method — this preserves
 * `routeMapping` behavior, which never sets a method.
 *
 * @module
 * @since 1.0.0
 */

import { Route } from '@blue/router';
import type { HTTPMethod } from '@blue/http';
import { AbstractRouteCondition } from './route-condition';

const { defineProperty } = Reflect;

/**
 * Matches a route's `method` against a required HTTP method.
 *
 * @example
 * // A GET-only mapping
 * const condition = new HTTPMethodCondition('GET');
 * condition.getMatchingCondition({ method: 'GET', … } as Route) // this
 * condition.getMatchingCondition({ method: 'POST', … } as Route) // null
 */
export class HTTPMethodCondition extends AbstractRouteCondition<HTTPMethodCondition> {
    /**
     * The required HTTP method, or `undefined` to match any method.
     */
    readonly method: HTTPMethod | undefined;

    get content(): HTTPMethod[] {
        return this.method ? [this.method] : [];
    }

    get infix(): string {
        return ' ';
    }

    /**
     * Create a method condition.
     *
     * @param method - The required HTTP method. Omit for any-method matching.
     */
    constructor(method?: HTTPMethod) {
        super();
        defineProperty(this, 'method', {
            value: method,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Merge two conditions. A concrete method wins over `undefined`; when both
     * specify a method, `other` (the method-level mapping) wins as the more
     * specific of the two.
     *
     * @param other - The condition to merge with.
     * @returns The merged condition.
     */
    merge(other: HTTPMethodCondition): HTTPMethodCondition {
        return new HTTPMethodCondition(other.method ?? this.method);
    }

    /**
     * Return this condition when the route's method matches (or this condition
     * has no method constraint); `null` otherwise.
     *
     * @param route - The current route.
     * @returns This condition, or `null`.
     */
    getMatchingCondition(route: Route): HTTPMethodCondition | null {
        if (this.method === undefined || route.method === undefined) {
            return this;
        }
        return this.method === route.method ? this : null;
    }

    /**
     * A concrete method is more specific than the any-method condition.
     *
     * @param value - The condition to compare.
     * @param route - Unused, part of the shared contract.
     * @returns A comparison result.
     */
    compareTo(value: HTTPMethodCondition, route?: Route): number {
        if (this.method === undefined && value.method !== undefined) {
            return 1;
        }
        if (this.method !== undefined && value.method === undefined) {
            return -1;
        }
        return 0;
    }

    /**
     * The method name, or an empty string for the any-method condition.
     *
     * @returns The method or `''`.
     */
    toString(): string {
        return this.method ?? '';
    }
}
