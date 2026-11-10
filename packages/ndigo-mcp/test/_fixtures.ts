/**
 * Mapping and handler stubs for the `@ndigo/mcp` specs.
 */
import type { MethodParameter, RouteHandlerMethod, RouteMappingInfo } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';
import type { MappingEntryLike, MappingTableLike } from '../src/project';

/** Builds a handler-method stub around a real decorated controller. */
export function handlerMethod(
    handler: object,
    method: string,
    parameters: readonly MethodParameter[],
    invoke: (route: Route) => unknown = () => undefined
): RouteHandlerMethod {
    return { handler, method, parameters, invoke } as unknown as RouteHandlerMethod;
}

/** Builds a mapping-info stub with one pattern and one HTTP method. */
export function mapping(pattern: string, method = 'GET'): RouteMappingInfo {
    return {
        patternsCondition: { patterns: new Set([pattern]) },
        methodCondition: { method },
        queryCondition: { expressions: [] },
        matrixCondition: { expressions: [] },
    } as unknown as RouteMappingInfo;
}

/** Builds a single-table mapping source. */
export function table(entries: readonly MappingEntryLike[]): MappingTableLike {
    return { getMappingEntries: () => entries };
}
