import { Comparator } from '@blue/core';
import { Route } from '@blue/router';
import { RouteMatchResult } from './route-match-result';
import { RouteHandlerMethod } from './route-handler-method';
import { AbstractHandlerMethodMapping } from './abstract-handler-method-mapping';
import { MatchableHandlerMapping } from './abstract-handler-mapping';
import { RouteMappingInfo } from './route-mapping-info';
import { hasRouteMapping } from './route-mapping';
import type { MaybeHandler } from './_shared';

const { defineProperty } = Reflect;

/**
 * Creates {@link RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@link RequestMapping|@RequestHandler} and {@link RequestMapping|@RequestMapping} decorators.
 *
 * Map handler methods using route mapping metadata.
 */
export class LinearMetadataHandlerMapping
    extends AbstractHandlerMethodMapping<RouteMappingInfo>
    implements MatchableHandlerMapping
{
    get [Symbol.toStringTag](): string {
        return 'LinearMetadataHandlerMapping';
    }

    /**
     * Check whether the route matches a mapping pattern.
     *
     * @param route - The current route.
     * @param pattern - The pattern to test.
     * @returns A match result, or `null`.
     */
    match(route: Route, pattern: string): RouteMatchResult | null {
        const info: RouteMappingInfo = new RouteMappingInfo(pattern),
            matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value as string, route.path);
    }

    /**
     * Create a comparator for route mapping metadata.
     *
     * @param route - The current route.
     * @returns A comparator for route mapping info.
     */
    protected _getMappingComparator(route: Route): Comparator<RouteMappingInfo> {
        return {
            compare: (info1, info2) => info1.compareTo(info2, route),
        };
    }

    /**
     * Return the mapping when it matches the current route.
     *
     * @param mapping - The mapping to test.
     * @param route - The current route.
     * @returns A matching mapping, or `null`.
     */
    protected _getMatchingMapping(mapping: RouteMappingInfo, route: Route): RouteMappingInfo | null {
        return mapping.getMatchingCondition(route);
    }

    /**
     * Record the best route pattern and attach it to the route.
     *
     * @param mapping - The matched mapping.
     * @param path - The matched path.
     * @param route - The current route.
     */
    protected _handleMatch(mapping: RouteMappingInfo, path: string, route: Route) {
        super._handleMatch(mapping, path, route);

        let bestPattern: string;

        const patterns = mapping.patternsCondition.patterns;

        if (!patterns.size) {
            bestPattern = path;
        } else {
            bestPattern = patterns[Symbol.iterator]().next().value as string;
        }

        defineProperty(route, 'pattern', {
            value: bestPattern,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    /**
     * Handle the no-match case for metadata mappings.
     *
     * @param mappings - Candidate mappings.
     * @param path - The requested path.
     * @param route - The current route.
     * @returns Always `null`.
     */
    protected _handleNoMatch(mappings: RouteMappingInfo[], path: string, route: Route): RouteHandlerMethod | null {
        return null;
    }

    /**
     * Determine whether a value can be treated as a mapped handler.
     *
     * @param value - The candidate value.
     * @returns `true` when route mapping metadata is present.
     */
    protected _isHandler(value: any): boolean {
        if (!value) {
            return false;
        }
        return hasRouteMapping(value) || ('constructor' in value && hasRouteMapping(value.constructor));
    }

    /**
     * Register a single mapping and handler method.
     *
     * @param mapping - The mapping metadata.
     * @param handler - The handler instance or application-context name.
     * @param method - The handler method name.
     */
    override registerMapping(mapping: RouteMappingInfo, handler: MaybeHandler, method: string): void {
        const directPaths = this._getDirectPaths(mapping);
        this.mappingRegistry.register(mapping, this._createRequestHandlerMethod(handler, method), directPaths);
    }

    /**
     * Extract static paths from a route mapping.
     *
     * @param mapping - The route mapping info.
     * @returns Array of static paths.
     */
    private _getDirectPaths(mapping: RouteMappingInfo): string[] {
        const paths: string[] = [];
        for (const pattern of mapping.patternsCondition.patterns) {
            if (!/[*?{[]/.test(pattern)) {
                paths.push(pattern);
            }
        }
        return paths;
    }
}
