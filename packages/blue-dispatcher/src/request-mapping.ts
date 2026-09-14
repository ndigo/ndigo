/**
 * the `requestMapping` decorator — server-side route mapping decorator.
 * * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { HTTPMethod } from '@blue/http';
import { routeMapping, RouteMappingConfiguration } from './route-mapping';

/**
 * Configuration for the `requestMapping` decorator. Same shape as `RouteMappingConfiguration`
 * plus HTTP request semantics.
 */
export interface RequestMappingConfiguration extends RouteMappingConfiguration {
    /** HTTP method this mapping handles; absent = any method. */
    method?: HTTPMethod;
}

/**
 * Apply route mapping metadata with HTTP request semantics to a class or method.
 *
 * Works as both a class and method decorator, exactly like the `routeMapping` decorator.
 *
 * @param route - The route path or mapping configuration.
 * @returns A decorator function for the target.
 *
 * @example
 * // Any method — equivalent to `routeMapping`('/users')
 * \`requestMapping`('/users')
 *
 * @example
 * // GET only
 * \`requestMapping`({ value: '/users', method: 'GET' })
 *
 * @example
 * // With the same query/matrix conditions as `routeMapping`
 * \`requestMapping`({ value: '/users/{id}', method: 'DELETE', queryParams: 'filter=all' })
 */
export function requestMapping(route: string | RequestMappingConfiguration) {
    return routeMapping(route);
}
