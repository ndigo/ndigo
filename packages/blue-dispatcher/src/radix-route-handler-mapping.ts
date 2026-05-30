/**
 * @author Jeff Rose
 */

import { RadixTree, RadixMatch, Comparator } from '@blue/core';
import { Route } from '@blue/router';
import {
    AbstractHandlerMethodMapping,
    MatchableHandlerMapping,
    MaybeHandler,
    RouteMatchResult,
} from './route-handler-mapping';
import { RouteHandlerMethod } from './route-handler-method';
import { RouteMappingInfo, PatternsRouteCondition } from './route-mapping-info';
import { hasRouteMapping, getRouteMapping } from './route-mapping';

interface RadixEntry {
    readonly handlerMethod: RouteHandlerMethod;
    readonly mapping: RouteMappingInfo;
}

export class RadixMetadataHandlerMapping
    extends AbstractHandlerMethodMapping<RouteMappingInfo>
    implements MatchableHandlerMapping
{
    #radixTree = new RadixTree<RadixEntry>();

    get [Symbol.toStringTag](): string {
        return 'RadixMetadataHandlerMapping';
    }

    match(route: Route, pattern: string): RouteMatchResult {
        const info: RouteMappingInfo = new RouteMappingInfo(pattern),
            matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value as string, route.path);
    }

    protected _getMappingForMethod(method: string, handler: any): RouteMappingInfo {
        const methodMapping = getRouteMapping(handler, method);
        let methodInfo: RouteMappingInfo;
        if (methodMapping) {
            methodInfo = new RouteMappingInfo(methodMapping.value, new PatternsRouteCondition(methodMapping.value));
            const handlerMapping = getRouteMapping(handler.constructor);
            if (handlerMapping) {
                const handlerInfo = new RouteMappingInfo(
                    handlerMapping.value,
                    new PatternsRouteCondition(handlerMapping.value)
                );
                methodInfo = handlerInfo.merge(methodInfo);
            }
        }
        return methodInfo;
    }

    protected _getMappingComparator(route: Route): Comparator<RouteMappingInfo> {
        return {
            compare: (info1, info2) => info1.compareTo(info2, route),
        };
    }

    protected _getMatchingMapping(mapping: RouteMappingInfo, route: Route): RouteMappingInfo {
        return mapping.getMatchingCondition(route);
    }

    protected _handleNoMatch(mappings, path: string, route: Route): RouteHandlerMethod {
        return null;
    }

    protected _isHandler(value: any): boolean {
        return hasRouteMapping(value) || ('constructor' in value && hasRouteMapping(value.constructor));
    }

    protected override _getHandler(route: Route): RouteHandlerMethod {
        const { path } = route;
        const match: RadixMatch<RadixEntry> | null = this.#radixTree.lookup(path);

        if (!match) {
            return this._handleNoMatch([], path, route);
        }

        const { mapping, handlerMethod } = match.value;

        if (match.params) {
            route.params = match.params;
        }

        this._handleMatch(mapping, path, route);

        // Store pattern with radix-tree precision
        Reflect.defineProperty(route, 'pattern', {
            value: match.pattern,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        return handlerMethod;
    }

    protected override _handleMatch(mapping: RouteMappingInfo, path: string, route: Route): void {
        super._handleMatch(mapping, path, route);
    }

    override registerMapping(mapping: RouteMappingInfo, handler: MaybeHandler, method: string): void {
        const handlerMethod = this._createRequestHandlerMethod(handler, method);
        for (const pattern of mapping.patternsCondition.patterns) {
            this.#radixTree.insert(pattern, { handlerMethod, mapping });
        }
        // Register in mappingRegistry with empty directPaths for getHandlerMethods() API compat
        this.mappingRegistry.register(mapping, handlerMethod, []);
    }
}