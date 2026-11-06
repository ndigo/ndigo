/**
 */
import { Route } from '@ndigo/router';
import type { HTTPMethod } from '@ndigo/http';
import { RouteCondition, RouteConditionHolder } from './route-condition';
import { AccessControlCondition } from './access-control-condition';
import { HTTPMethodCondition } from './http-method-condition';
import { QueryParamCondition } from './query-param-condition';
import { MatrixParamCondition } from './matrix-param-condition';
import { PatternsRouteCondition } from './patterns-route-condition';

const separator = '';

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
     * HTTP method matching condition (any method when empty).
     */
    readonly methodCondition!: HTTPMethodCondition;

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
        custom: RouteCondition<unknown> | null = null,
        access: AccessControlCondition | null = null,
        method: HTTPMethodCondition = new HTTPMethodCondition()
    ) {
        this.name = name || '';
        this.patternsCondition = patterns;
        this.queryCondition = params;
        this.matrixCondition = matrix;
        this.methodCondition = method;
        this.customConditionHolder = new RouteConditionHolder(custom);
        this.accessCondition = access;
    }

    /**
     * The route patterns this mapping matches, in registration order.
     *
     * Public read model for mapping inspection (`@ndigo/inspect` via the
     * `getMappingEntries()` seam): consumers MUST NOT reach into the
     * `patternsCondition` internal condition to read them.
     *
     * @returns A fresh array of the mapping's patterns.
     */
    patterns(): string[] {
        return [...this.patternsCondition.patterns];
    }

    /**
     * The required HTTP method, or `undefined` when the mapping matches any
     * method.
     *
     * Public read model for mapping inspection (`@ndigo/inspect` via the
     * `getMappingEntries()` seam): consumers MUST NOT reach into the
     * `methodCondition` internal condition to read it.
     *
     * @returns The fixed method, or `undefined` for an any-method mapping.
     */
    method(): HTTPMethod | undefined {
        return this.methodCondition.method;
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
            custom = this.customConditionHolder.merge(value.customConditionHolder),
            method = this.methodCondition.merge(value.methodCondition);

        // Merge access conditions: the most restrictive level wins (private > public).
        const mergedAccess =
            this.accessCondition && value.accessCondition
                ? this.accessCondition.merge(value.accessCondition)
                : (this.accessCondition ?? value.accessCondition);

        return new RouteMappingInfo(name, patterns, params, matrix, custom.condition, mergedAccess, method);
    }

    /**
     * Return a condition instance that matches the current route.
     *
     * @param route - The current route.
     * @returns A matching mapping info, or `null`.
     */
    match(route: Route): RouteMappingInfo | null {
        // Check patterns first — most discriminating filter, eliminates non-matching
        // routes before the cheaper param/matrix/method checks run.
        const patterns = this.patternsCondition.match(route);
        if (!patterns) {
            return null;
        }

        const params = this.queryCondition.match(route);
        if (!params) {
            return null;
        }

        const matrix = this.matrixCondition.match(route);
        if (!matrix) {
            return null;
        }

        const method = this.methodCondition.match(route);
        if (!method) {
            return null;
        }

        const custom = this.customConditionHolder.match(route);
        if (!custom) {
            return null;
        }

        // Check access control — private routes require an authenticated principal.
        if (this.accessCondition) {
            const accessMatch = this.accessCondition.match(route);
            if (!accessMatch) {
                return null;
            }
            return new RouteMappingInfo(this.name, patterns, params, matrix, custom.condition, accessMatch, method);
        }

        return new RouteMappingInfo(this.name, patterns, params, matrix, custom.condition, null, method);
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

        // A method-specific mapping wins over an any-method mapping on the same path.
        result = this.methodCondition.compareTo(value.methodCondition, route);
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
