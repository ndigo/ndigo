/**
 * Route mapping-info naming strategies.
 */

import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo } from './route-mapping-info-model';
const { defineProperty } = Reflect;
const SEPARATOR = '';

/**
 * Default naming strategy for route mappings: prefers the mapping's explicit
 * `name`, and otherwise joins the handler class and method with the static
 * `separator`.
 *
 * @example
 * ```ts
 * const strategy = new RouteMappingInfoHandlerMethodMappingNamingStrategy();
 * ```
 */
export class RouteMappingInfoHandlerMethodMappingNamingStrategy implements RouteHandlerMethodMappingNamingStrategy<RouteMappingInfo> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RouteMappingInfoHandlerMethodMappingNamingStrategy".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RouteMappingInfoHandlerMethodMappingNamingStrategy]"
     */
    get [Symbol.toStringTag](): string {
        return 'RouteMappingInfoHandlerMethodMappingNamingStrategy';
    }

    /**
     * Separator used when generating fallback mapping names.
     */
    static readonly separator: string;

    /**
     * Create a mapping name from the handler method and mapping metadata.
     *
     * @param handlerMethod - The handler method being named.
     * @param mapping - The associated route mapping metadata.
     * @returns The mapping name.
     */
    getName(handlerMethod: RouteHandlerMethod, mapping: RouteMappingInfo): string {
        if (mapping.name) {
            return mapping.name;
        }

        return `${handlerMethod.name}${SEPARATOR}${handlerMethod.method}`;
    }
}

defineProperty(RouteMappingInfoHandlerMethodMappingNamingStrategy, 'separator', {
    value: SEPARATOR,
    configurable: true,
    enumerable: false,
    writable: false,
});
