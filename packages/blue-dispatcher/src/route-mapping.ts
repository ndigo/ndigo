import '@tsmetadata/polyfill';
import { FrameworkError, getSymbolMetadata } from '@blue/core';
import type { HTTPMethod } from '@blue/http';
import { isString } from '@blue/util/types';

/**
 * Basic value shared by route mapping metadata objects.
 */
type RouteMappingValue = {
    value: string;
};

/**
 * Configuration shape for route mappings.
 *
 * `method` is optional — when absent the mapping matches any HTTP method.
 * It is normally set via `requestMapping` / `@getMapping` (see
 * `request-mapping.ts` / `http-method-mapping.ts`), not `routeMapping`
 * directly, but the shared metadata record carries it.
 */
export type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    /** HTTP method this mapping handles; absent = any method. */
    method?: HTTPMethod;
    /**
     * Comma-separated query-parameter expressions that must all match for this
     * mapping to be selected.  Supported syntax per expression:
     * - `name` — parameter must be present
     * - `name=value` — parameter must equal the given value
     * - `!name` — parameter must be absent
     * - `name!=value` — parameter must not equal the given value
     *
     * @example `queryParams: 'filter=active'`
     * @example `queryParams: 'filter=active, sort'`
     */
    queryParams?: string;
    /**
     * Comma-separated matrix-parameter expressions that must all match for this
     * mapping to be selected.  Matrix parameters are per-path-segment key=value
     * pairs (e.g. `/products/42;color=red`).  Supported syntax is identical to
     * `params` above.
     */
    matrixParams?: string;
    private: boolean;
    path?: string; // Computed path combining class and method routes
};

const { defineProperty, getOwnPropertyDescriptor } = Reflect;

const defaultMapping: RouteMappingConfiguration = {
    value: '/**',
    private: false,
};

const withDefaults = (conf: RouteMappingValue): RouteMappingConfiguration => ({ ...defaultMapping, ...conf });
const configurationOf = (value: string): RouteMappingValue => ({ value });
const toRouteMappingConfiguration = (value: string | RouteMappingConfiguration): RouteMappingConfiguration =>
    isString(value) ? withDefaults(configurationOf(value)) : (value as RouteMappingConfiguration);

/**
 * Get route mapping metadata from a class or method.
 *
 * @param target - The class constructor or prototype to inspect.
 * @param propertyKey - The method name, when reading method-level metadata.
 * @returns The stored route mapping, or `undefined`.
 */
export const getRouteMapping = (
    target: unknown,
    propertyKey?: string | symbol
): RouteMappingConfiguration | undefined => {
    const metadata = getSymbolMetadata(target);
    if (propertyKey) {
        return metadata[`route:mapping:${String(propertyKey)}`];
    }
    return metadata['route:mapping'];
};

/**
 * Check whether route mapping metadata exists.
 *
 * @param target - The class constructor or prototype to inspect.
 * @param propertyKey - The method name, when checking method-level metadata.
 * @returns `true` when route mapping metadata is present.
 */
export const hasRouteMapping = (target: unknown, propertyKey?: string | symbol): boolean => {
    return getRouteMapping(target, propertyKey) !== undefined;
};

/**
 * Apply route mapping metadata to a class or method.
 *
 * Works as both a class and method decorator.
 *
 * @param route - The route path or mapping configuration to apply.
 * @returns A decorator function for the target.
 *
 * @example
 * // Query params — selects only when ?filter=active is present
 * \`routeMapping`({ value: '/:id', queryParams: 'filter=active' })
 *
 * @example
 * // Matrix params — selects only when ;color=red is in any path segment
 * \`routeMapping`({ value: '/:id', matrixParams: 'color=red' })
 */
export function routeMapping(route: string | RouteMappingConfiguration = defaultMapping) {
    const conf = toRouteMappingConfiguration(route);

    if (conf.value === '') {
        throw new FrameworkError('@routeMapping("") is not allowed. Use @routeMapping("/") for the root route.');
    }

    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        if (context.kind === 'class') {
            // Class decorator
            context.metadata['route:mapping'] = conf;
            return;
        } else if (context.kind === 'method') {
            // Method decorator
            context.metadata[`route:mapping:${String(context.name)}`] = conf;

            // Make method enumerable so it can be discovered via for...in
            context.addInitializer(function (this: unknown) {
                const descriptor = getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
                if (descriptor && !descriptor.enumerable) {
                    defineProperty(Object.getPrototypeOf(this), context.name, {
                        ...descriptor,
                        enumerable: true,
                    });
                }
            });
        }
    };
}

/**
 * Create a public route mapping decorator.
 *
 * @param route - The route path to map.
 * @returns A route mapping decorator marked as public.
 */
export const publicMapping = (route: string) => routeMapping({ value: route, private: false });

/**
 * Create a private route mapping decorator.
 *
 * @param route - The route path to map.
 * @returns A route mapping decorator marked as private.
 */
export const privateMapping = (route: string) => routeMapping({ value: route, private: true });
