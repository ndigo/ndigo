import { RadixTree, RadixMatch, Comparator, MultiValueMap } from '@blue/core';
import type { HTTPMethod } from '@blue/http';
import { Route } from '@blue/router';
import {
    AbstractHandlerMethodMapping,
    MatchableHandlerMapping,
    MaybeHandler,
    RouteMatchResult,
} from './route-handler-mapping';
import { RouteHandlerMethod } from './route-handler-method';
import { RouteMappingInfo } from './route-mapping-info';
import { hasRouteMapping } from './route-mapping';
import { setMethodNotAllowed } from './route-handler-denial';

interface RadixEntry {
    readonly handlerMethod: RouteHandlerMethod;
    readonly mapping: RouteMappingInfo;
}

export class RadixMetadataHandlerMapping
    extends AbstractHandlerMethodMapping<RouteMappingInfo>
    implements MatchableHandlerMapping
{
    #radixTree = new RadixTree<RadixEntry>();

    /**
     * All registered candidates per pattern.
     *
     * The radix tree holds only the first-registered entry per pattern (path
     * resolution sentinel). This map holds every entry so that `_getHandler`
     * can filter and disambiguate when multiple handlers share a path pattern
     * but differ by `params` or `matrixParams` conditions.
     */
    #candidatesByPattern = new MultiValueMap<string, RadixEntry>();

    get [Symbol.toStringTag](): string {
        return 'RadixMetadataHandlerMapping';
    }

    match(route: Route, pattern: string): RouteMatchResult | null {
        const info: RouteMappingInfo = new RouteMappingInfo(pattern),
            matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value as string, route.path);
    }

    protected _getMappingComparator(route: Route): Comparator<RouteMappingInfo> {
        return {
            compare: (info1, info2) => info1.compareTo(info2, route),
        };
    }

    protected _getMatchingMapping(mapping: RouteMappingInfo, route: Route): RouteMappingInfo | null {
        return mapping.getMatchingCondition(route);
    }

    protected override _getHandler(route: Route): RouteHandlerMethod | null {
        const { path } = route;
        const match: RadixMatch<RadixEntry> | null = this.#radixTree.lookup(path);

        if (!match) {
            return this._handleNoMatch([], path, route);
        }

        // Extract path params before filtering — all candidates share the same pattern
        // so params are the same regardless of which candidate wins.
        if (match.params) {
            route.params = match.params;
        }

        // Retrieve all handlers registered at this pattern and filter by conditions.
        // Note: we do NOT call mapping.getMatchingCondition(route) here because the full
        // PatternsRouteCondition check uses GlobPathMatcher which does not understand
        // :param-style patterns — the radix tree already validated the path.
        const candidates = this.#candidatesByPattern.get(match.pattern) ?? [];
        const matching = candidates.filter(
            ({ mapping }) =>
                mapping.queryCondition.getMatchingCondition(route) !== null &&
                mapping.matrixCondition.getMatchingCondition(route) !== null &&
                mapping.methodCondition.getMatchingCondition(route) !== null
        );

        if (matching.length === 0) {
            // RFC 9110 §15.5.6: when the path exists but no handler accepts the
            // request method, that's 405 Method Not Allowed, not 404. Distinguish
            // "path + params match, only the method differs" from a true no-match:
            // candidates that pass the non-method conditions. OPTIONS is exempt —
            // it is always allowable (RFC 9110 §9.3.7) and platform interceptors
            // (CORS preflight) finalize it, so it must reach dispatch.
            if (route.method !== 'OPTIONS') {
                const nonMethodMatches = candidates.filter(
                    ({ mapping }) =>
                        mapping.queryCondition.getMatchingCondition(route) !== null &&
                        mapping.matrixCondition.getMatchingCondition(route) !== null
                );
                if (nonMethodMatches.length > 0) {
                    const allowed = [
                        ...new Set(
                            nonMethodMatches
                                .map(({ mapping }) => mapping.methodCondition.method)
                                .filter((method: HTTPMethod | undefined): method is HTTPMethod => method !== undefined)
                        ),
                    ].join(', ');
                    setMethodNotAllowed(route, allowed);
                }
            }
            return this._handleNoMatch([], path, route);
        }

        // When multiple candidates pass, pick the most specific via compareTo.
        const winner =
            matching.length === 1
                ? matching[0]
                : matching.reduce((best, c) => (c.mapping.compareTo(best.mapping, route) < 0 ? c : best));

        this._handleMatch(winner.mapping, path, route);

        // Store pattern with radix-tree precision.
        Reflect.defineProperty(route, 'pattern', {
            value: match.pattern,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        return winner.handlerMethod;
    }

    protected _handleNoMatch(mappings: any, path: string, route: Route): RouteHandlerMethod | null {
        return null;
    }

    protected _isHandler(value: any): boolean {
        return hasRouteMapping(value) || ('constructor' in value && hasRouteMapping(value.constructor));
    }

    protected override _handleMatch(mapping: RouteMappingInfo, path: string, route: Route): void {
        super._handleMatch(mapping, path, route);
    }

    override registerMapping(mapping: RouteMappingInfo, handler: MaybeHandler, method: string): void {
        const handlerMethod = this._createRequestHandlerMethod(handler, method);
        for (const pattern of mapping.patternsCondition.patterns) {
            // Insert into the radix tree only on first registration for this pattern;
            // the tree is the path-resolution engine and is single-entry-per-pattern.
            if (!this.#candidatesByPattern.has(pattern)) {
                this.#radixTree.insert(pattern, { handlerMethod, mapping });
            }
            // Always register in the candidates map so _getHandler can disambiguate.
            this.#candidatesByPattern.add(pattern, { handlerMethod, mapping });
        }
        // Register in mappingRegistry with empty directPaths for getHandlerMethods() API compat
        this.mappingRegistry.register(mapping, handlerMethod, []);
    }
}
