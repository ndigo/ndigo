/**
 */
import { Comparator, IllegalStateError } from '@ndigo/core';
import { Initializable, SmartLifecycle } from '@ndigo/factory';
import { Route } from '@ndigo/router';
import { isFunction } from '@ndigo/util/types';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfoHandlerMethodMappingNamingStrategy } from './route-mapping-info-naming-strategy';
import { resolveParameters, storeResolvedParameters, getMethodParameter, MethodParameter } from './parameters';
import {
    RouteMappingInfo,
    PatternsRouteCondition,
    QueryParamCondition,
    MatrixParamCondition,
} from './route-mapping-info';
import { HTTPMethodCondition } from './http-method-condition';
import { hasRouteMapping, getRouteMapping } from './route-mapping';
import { AbstractHandlerMapping } from './abstract-handler-mapping';
import { type MappingEntry, MappingRegistry } from './mapping-registry';
import { Match, MatchComparator } from './_match';
import { resolveHandlerWithContext, kindOf } from './_shared';
import type { MaybeHandler } from './_shared';

const { from } = Array,
    { getPrototypeOf } = Reflect,
    { keys } = Object;

/**
 * Shared default naming strategy — stateless, so one instance serves every mapping.
 */
const defaultNamingStrategy = new RouteMappingInfoHandlerMethodMappingNamingStrategy();

/**
 * Base class for mappings that resolve handler methods from application context values.
 */
export abstract class AbstractHandlerMethodMapping<T extends RouteMappingInfo>
    extends AbstractHandlerMapping
    implements Initializable, SmartLifecycle
{
    /**
     * Naming strategy used when exposing handler methods by name.
     *
     * Defaults to {@link RouteMappingInfoHandlerMethodMappingNamingStrategy}
     * (the mapping's own name, falling back to the handler + method).
     */
    namingStrategy: RouteHandlerMethodMappingNamingStrategy<T> = defaultNamingStrategy;

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
     * Set of handler instances already scanned by {@link init}. Guards against
     * duplicate registrations when init runs more than once: the DI container
     * auto-initializes Initializable beans at registration time, and the
     * lifecycle processor re-runs init on refresh — the same controllers must
     * not be registered twice.
     */
    #detectedHandlers: Set<object> = new Set<object>();
    #lifecycleStarted: boolean = false;

    /**
     * `SmartLifecycle` — whether the lifecycle has driven init.
     */
    get isRunning(): boolean {
        return this.#lifecycleStarted;
    }

    /**
     * `SmartLifecycle` — init runs before the dispatcher and server.
     */
    readonly phase = -100;

    /**
     * `SmartLifecycle` — handler mappings must be initialized once the context refreshes.
     */
    readonly isAutoStartup = true;

    /**
     * `SmartLifecycle` — initialize handler discovery from the application
     * context. Runs on refresh, after every configuration has registered.
     */
    start(): void {
        this.#lifecycleStarted = true;
        this.init();
    }

    /**
     * `SmartLifecycle` — mappings are immutable once initialized; nothing to
     * release. Present so this type is a well-behaved lifecycle bean.
     */
    stop(): void {
        this.#lifecycleStarted = false;
    }

    /**
     * Detect and register handler methods from the application context.
     *
     * No-op when the application context has not been injected yet (the DI
     * container auto-initializes initializable beans during refresh, which can
     * run before `setApplicationContext`). Idempotent: handlers already
     * detected on a previous init are skipped.
     */
    init(): void {
        const { applicationContext } = this;
        if (!applicationContext) {
            return;
        }
        keys(applicationContext).forEach((name) => {
            const value = applicationContext.getValue(name);
            if (this._isHandler(value)) {
                // _isHandler true implies an object handler; widen only here.
                const handler = value as object;
                if (!this.#detectedHandlers.has(handler)) {
                    this.#detectedHandlers.add(handler);
                    this._detectHandlerMethods(handler);
                }
            }
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
     * Return the registered mapping entries, in registration order.
     *
     * Read-only introspection seam over {@link mappingRegistry}: each entry
     * carries the mapping object, its resolved handler method, the mapping
     * name and any direct paths. Dispatch behavior is unchanged — this exists
     * for tooling that needs a pattern → handler read model (API docs,
     * `ndigo inspect`).
     *
     * @returns A snapshot array of the registered mapping entries.
     */
    getMappingEntries(): MappingEntry<T>[] {
        return this.mappingRegistry.entries();
    }

    /**
     * Return handler methods registered under a mapping name.
     *
     * Names are assigned at registration by {@link namingStrategy} (by
     * default the mapping's own name, e.g. its route pattern).
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
        const handlerMethod = this._createRequestHandlerMethod(handler, method);
        this.mappingRegistry.register(
            mapping,
            handlerMethod,
            this.namingStrategy?.getName(handlerMethod, mapping) ?? '',
            directPaths
        );
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

        // @parameters is declarative: resolve the raw map against THIS method
        // and its mapping kind (route/request/socket), validating source
        // compatibility, then store + attach the positional parameters.
        const resolved = resolveParameters(
            resolvedHandler,
            method,
            (resolvedHandler as Record<string, unknown>)[method] as Function
        );
        storeResolvedParameters(resolvedHandler, method, resolved);
        handlerMethod.parameters = (getMethodParameter(resolvedHandler, method) as MethodParameter[] | undefined) ?? [];

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
            // Walk the whole prototype chain: a method decorated on a base
            // class is an own enumerable property of the base prototype, not
            // of the instance's immediate prototype. Each key is handled once,
            // at the nearest prototype level where it is declared.
            let handlerPrototype: object | null = getPrototypeOf(resolvedHandler) as object | null;
            const detectedKeys = new Set<string>();
            while (handlerPrototype !== null) {
                const handlerKeys = keys(handlerPrototype);
                for (let index = 0; index < handlerKeys.length; index++) {
                    const key = handlerKeys[index];
                    if (detectedKeys.has(key)) {
                        continue;
                    }
                    detectedKeys.add(key);
                    if (
                        isFunction((handlerPrototype as Record<string, unknown>)[key]) &&
                        hasRouteMapping(resolvedHandler, key)
                    ) {
                        const info = this._getMappingForMethod(key, handlerPrototype);
                        if (info !== undefined) {
                            this._registerHandlerMethod(resolvedHandler, key, info);
                        }
                    }
                }
                handlerPrototype = getPrototypeOf(handlerPrototype) as object | null;
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
        const kindOfTag = (this.#kindOfTag ??= kindOf(this));
        if (kindOfTag) {
            // kindOfTag is this mapping's kind name (e.g. "RouteHandlerMapping");
            // the route exposes it as a dynamic attribute for kindOf narrowing.
            const dynamicRoute = route as unknown as Record<string, unknown>;
            dynamicRoute[kindOfTag] = path;
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

    protected abstract _isHandler(value: unknown): boolean;
    protected abstract _getMappingComparator(route: Route): Comparator<T>;
    /**
     * Build a {@link RouteMappingInfo} for the given handler method.
     *
     * Reads `routeMapping` metadata from both the method and the containing class,
     * constructs {@link QueryParamCondition} and {@link MatrixParamCondition} from the
     * `params` and `matrixParams` fields respectively, and merges class-level and
     * method-level mappings when both are present.
     *
     * @param method - The method name to inspect.
     * @param handler - The handler instance whose prototype carries the metadata.
     * @returns The combined {@link RouteMappingInfo}, or `undefined` if no mapping exists.
     */
    protected _getMappingForMethod(method: string, handler: object): T | undefined {
        const methodMapping = getRouteMapping(handler, method);
        let methodInfo: RouteMappingInfo | undefined;
        if (methodMapping) {
            const methodParams = methodMapping.queryParams
                ? new QueryParamCondition(...methodMapping.queryParams.split(',').map((s) => s.trim()))
                : new QueryParamCondition();
            const methodMatrix = methodMapping.matrixParams
                ? new MatrixParamCondition(...methodMapping.matrixParams.split(',').map((s) => s.trim()))
                : new MatrixParamCondition();
            const methodMethod = new HTTPMethodCondition(methodMapping.method);

            methodInfo = new RouteMappingInfo(
                methodMapping.value,
                new PatternsRouteCondition(methodMapping.value),
                methodParams,
                methodMatrix,
                null,
                null,
                methodMethod
            );

            const handlerMapping = getRouteMapping(handler.constructor);
            if (handlerMapping) {
                const handlerParams = handlerMapping.queryParams
                    ? new QueryParamCondition(...handlerMapping.queryParams.split(',').map((s) => s.trim()))
                    : new QueryParamCondition();
                const handlerMatrix = handlerMapping.matrixParams
                    ? new MatrixParamCondition(...handlerMapping.matrixParams.split(',').map((s) => s.trim()))
                    : new MatrixParamCondition();

                const handlerInfo = new RouteMappingInfo(
                    handlerMapping.value,
                    new PatternsRouteCondition(handlerMapping.value),
                    handlerParams,
                    handlerMatrix,
                    null,
                    null,
                    new HTTPMethodCondition(handlerMapping.method)
                );
                methodInfo = handlerInfo.merge(methodInfo);
            }
        }
        return methodInfo as T;
    }
    protected abstract _getMatchingMapping(mapping: T, route: Route): T | null;
}
