import { Comparator, IllegalStateError } from '@blue/core';
import { Initializable } from '@blue/factory';
import { ApplicationContext } from '@blue/context';
import { Route } from '@blue/router';
import { isFunction } from '@blue/util/types';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo, PatternsRouteCondition, QueryParamCondition, MatrixParamCondition } from './route-mapping-info';
import { hasRouteMapping, getRouteMapping } from './route-mapping';
import { hasMethodParameter, getMethodParameter, MethodParameter } from './route-parameter';
import { AbstractHandlerMapping } from './abstract-handler-mapping';
import { MappingRegistry } from './_mapping-registry';
import { Match, MatchComparator } from './_match';
import { resolveHandlerWithContext, kindOf } from './_shared';
import type { MaybeHandler } from './_shared';

const { from } = Array,
    { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object;

/**
 * Base class for mappings that resolve handler methods from application context values.
 */
export abstract class AbstractHandlerMethodMapping<T extends RouteMappingInfo> extends AbstractHandlerMapping implements Initializable {
    /**
     * Naming strategy used when exposing handler methods by name.
     */
    namingStrategy!: RouteHandlerMethodMappingNamingStrategy<T>;

    /**
     * Registry of route mappings and their handler methods.
     */
    readonly mappingRegistry!: MappingRegistry<T>;

    /**
     * Cache for kindOf(this) to avoid repeated calls
     */
    #kindOfTag: string | undefined;

    /**
     * Create a handler-method mapping with an empty registry.
     */
    constructor() {
        super();
        this.mappingRegistry = new MappingRegistry<T>();
    }

    /**
     * Detect and register handler methods from the application context.
     */
    init(): void {
        const { applicationContext } = this;
        keys(applicationContext).forEach((name) => {
            const value = applicationContext.getValue(name);
            this._isHandler(value) && this._detectHandlerMethods(value);
        });
    }

    /**
     * Return all registered handler methods.
     *
     * @returns The mapping-to-handler-method registry.
     */
    getHandlerMethods(): Map<T, RouteHandlerMethod> {
        return this.mappingRegistry.mappings;
    }

    /**
     * Return handler methods registered under a mapping name.
     *
     * @param name - The mapping name.
     * @returns The matching handler methods.
     */
    getHandlerMethodsForMappingName(name: string): RouteHandlerMethod[] {
        return this.mappingRegistry.getHandlerMethodsByMappingName(name) ?? [];
    }

    /**
     * Register a single mapping and handler method.
     *
     * @param mapping - The mapping metadata.
     * @param handler - The handler instance or application-context name.
     * @param method - The handler method name.
     * @param directPaths - Paths that map directly to this entry.
     */
    registerMapping(mapping: T, handler: MaybeHandler, method: string, directPaths?: string[]): void {
        this.mappingRegistry.register(mapping, this._createRequestHandlerMethod(handler, method), directPaths);
    }

    /**
     * Remove a mapping from the registry.
     *
     * @param mapping - The mapping metadata to remove.
     */
    unregisterMapping(mapping: T): void {
        this.mappingRegistry.unregister(mapping);
    }

    /**
     * Create a handler method reference from a handler object and method name.
     *
     * @param handler - The handler instance or application-context name.
     * @param method - The handler method name.
     * @returns The resolved handler method.
     */
    protected _createRequestHandlerMethod(handler: MaybeHandler, method: string): RouteHandlerMethod {
        const resolvedHandler = resolveHandlerWithContext(this.applicationContext)(handler);
        if (!resolvedHandler) {
            throw new IllegalStateError(`Could not resolve handler: ${handler}`);
        }

        const handlerMethod = new RouteHandlerMethod(resolvedHandler, method);

        if (hasMethodParameter(resolvedHandler, method)) {
            handlerMethod.parameters = getMethodParameter(resolvedHandler, method) as MethodParameter[];
        }

        return handlerMethod;
    }

    /**
     * Scan a handler for mapped methods and register them.
     *
     * @param handler - The handler instance or application-context name.
     */
    protected _detectHandlerMethods(handler: MaybeHandler) {
        const resolvedHandler = resolveHandlerWithContext(this.applicationContext)(handler);

        if (resolvedHandler) {
            const handlerPrototype = getPrototypeOf(resolvedHandler);
            
            if (handlerPrototype !== null) {
                keys(handlerPrototype).forEach((key) => {
                    if (isFunction((handlerPrototype as any)[key]) && hasRouteMapping(resolvedHandler, key)) {
                        const info = this._getMappingForMethod(key, handlerPrototype);
                        if (info !== undefined) {
                            this._registerHandlerMethod(resolvedHandler, key, info);
                        }
                    }
                });
            }
        }
    }

    /**
     * Resolve a route by looking up the best handler method.
     *
     * @param route - The current route.
     * @returns The resolved handler method, or `null`.
     */
    protected _getHandler(route: Route): RouteHandlerMethod | null {
        const { path } = route;
        return this._lookupHandlerMethod(path, route);
    }

    /**
     * Find the best handler method for a path.
     *
     * @param path - The request path.
     * @param route - The current route.
     * @returns The best matching handler method, or `null`.
     */
    protected _lookupHandlerMethod(path: string, route: Route): RouteHandlerMethod | null {
        const { mappingRegistry } = this,
            matches: Match<T>[] = [],
            directPathMatches = mappingRegistry.getMappingsByPath(path);

        if (directPathMatches && directPathMatches.length) {
            this._addMatchingMappings(directPathMatches, matches, route);
        }

        if (!matches.length) {
            this._addMatchingMappings(from(mappingRegistry.mappings.keys()), matches, route);
        }

        if (matches.length) {
            if (matches.length > 1) {
                const comparator = new MatchComparator(this._getMappingComparator(route));
                matches.sort(comparator.compare);
                if (comparator.compare(matches[0], matches[1]) === 0) {
                    const m1 = matches[0].handlerMethod.method,
                        m2 = matches[1].handlerMethod.method;
                    throw new IllegalStateError(`Ambiguous handler methods mapped for "${path}": { ${m1}, ${m2} }`);
                }
            }
            const bestMatch = matches[0];
            this._handleMatch(bestMatch.mapping, path, route);
            return bestMatch.handlerMethod;
        }

        return null;
    }

    /**
     * Record route metadata for a successful mapping match.
     *
     * @param mapping - The matched mapping.
     * @param path - The matched path.
     * @param route - The current route.
     */
    protected _handleMatch(mapping: T, path: string, route: Route): void {
        const kindOfTag = this.#kindOfTag ??= kindOf(this);
        if (kindOfTag) {
            (route as any)[kindOfTag] = path;
        }
    }

    /**
     * Register a handler method for the given mapping.
     *
     * @param handler - The handler instance or application-context name.
     * @param method - The method name.
     * @param mapping - The mapping metadata.
     */
    protected _registerHandlerMethod(handler: MaybeHandler, method: string, mapping: T): void {
        this.registerMapping(mapping, handler, method);
    }

    private _addMatchingMappings(mappings: T[], matches: Match<T>[], route: Route): void {
        const length = mappings.length;
        for (let index = 0; index < length; index++) {
            const match: T | null = this._getMatchingMapping(mappings[index], route);
            if (match) {
                const handlerMethod = this.mappingRegistry.mappings.get(mappings[index]);
                if (handlerMethod) {
                    matches.push(new Match<T>(match, handlerMethod));
                }
            }
        }
    }

    protected abstract _isHandler(value: any): boolean;
    protected abstract _getMappingComparator(route: Route): Comparator<T>;
    /**
     * Build a {@link RouteMappingInfo} for the given handler method.
     *
     * Reads `@routeMapping` metadata from both the method and the containing class,
     * constructs {@link QueryParamCondition} and {@link MatrixParamCondition} from the
     * `params` and `matrixParams` fields respectively, and merges class-level and
     * method-level mappings when both are present.
     *
     * @param method - The method name to inspect.
     * @param handler - The handler instance whose prototype carries the metadata.
     * @returns The combined {@link RouteMappingInfo}, or `undefined` if no mapping exists.
     */
    protected _getMappingForMethod(method: string, handler: any): T | undefined {
        const methodMapping = getRouteMapping(handler, method);
        let methodInfo: RouteMappingInfo | undefined;
        if (methodMapping) {
            const methodParams = (methodMapping as any).queryParams
                ? new QueryParamCondition(...((methodMapping as any).queryParams as string).split(',').map((s) => s.trim()))
                : new QueryParamCondition();
            const methodMatrix = (methodMapping as any).matrixParams
                ? new MatrixParamCondition(...((methodMapping as any).matrixParams as string).split(',').map((s) => s.trim()))
                : new MatrixParamCondition();

            methodInfo = new RouteMappingInfo(
                methodMapping.value,
                new PatternsRouteCondition(methodMapping.value),
                methodParams,
                methodMatrix
            );

            const handlerMapping = getRouteMapping(handler.constructor);
            if (handlerMapping) {
                const handlerParams = (handlerMapping as any).queryParams
                    ? new QueryParamCondition(...((handlerMapping as any).queryParams as string).split(',').map((s) => s.trim()))
                    : new QueryParamCondition();
                const handlerMatrix = (handlerMapping as any).matrixParams
                    ? new MatrixParamCondition(...((handlerMapping as any).matrixParams as string).split(',').map((s) => s.trim()))
                    : new MatrixParamCondition();

                const handlerInfo = new RouteMappingInfo(
                    handlerMapping.value,
                    new PatternsRouteCondition(handlerMapping.value),
                    handlerParams,
                    handlerMatrix
                );
                methodInfo = handlerInfo.merge(methodInfo);
            }
        }
        return methodInfo as T;
    }
    protected abstract _getMatchingMapping(mapping: T, route: Route): T | null;
}