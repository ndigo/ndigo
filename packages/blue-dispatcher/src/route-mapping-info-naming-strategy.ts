import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo } from './route-mapping-info-model';
const { defineProperty } = Reflect;
const separator = '';

export class RouteMappingInfoHandlerMethodMappingNamingStrategy
    implements RouteHandlerMethodMappingNamingStrategy<RouteMappingInfo>
{
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

        return `${handlerMethod.name}${separator}${handlerMethod.method}`;
    }
}

defineProperty(RouteMappingInfoHandlerMethodMappingNamingStrategy, 'separator', {
    value: separator,
    configurable: true,
    enumerable: false,
    writable: false,
});
