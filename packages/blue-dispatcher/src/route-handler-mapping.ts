/**
 * @author Jeff Rose
 */

import {
    createNull,
    JSONValue,
    Null,
    MultiValueMap,
    PathMatcher,
    GlobPathMatcher,
    Comparator,
    Serializable,
    IllegalStateError,
} from '@blue/core';
import { AsNameAware, Initializable } from '@blue/factory';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Route } from '@blue/router';
import { when } from '@blue/util/logic';
import { startsWith } from '@blue/util/list';
import { trim } from '@blue/util/string';
import { isFunction, isString } from '@blue/util/types';
import { RouteHandlerInterceptor, MappedHandlerInterceptor } from './route-handler-interceptor';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo, PatternsRouteCondition } from './route-mapping-info';
import { hasRouteMapping, getRouteMapping } from './route-mapping';
import { hasMethodParameter, getMethodParameter } from './route-parameter';

/**
 * A value that may be supplied directly or by name through the application context.
 */
export type Maybe<T> = string | T;

/**
 * A handler value that may be supplied directly or by name.
 */
export type MaybeHandler = Maybe<object>;

/**
 * Resolves a route to a handler execution chain.
 */
export interface RouteHandlerMapping {
    /**
     * Resolve the handler for a route.
     *
     * @param route - The current route.
     * @returns The execution chain for the chosen handler, or `null`.
     */
    getHandler(route: Route): RouteHandlerExecutionChain;
}

/**
 * A handler mapping that can also report whether a route matches a pattern.
 */
export interface MatchableHandlerMapping extends RouteHandlerMapping {
    /**
     * Check whether the route matches a pattern.
     *
     * @param route - The current route.
     * @param pattern - The pattern to test.
     * @returns A match result, or `null`.
     */
    match(route: Route, pattern: string): RouteMatchResult;
}

/**
 * @typedef {string:external | T} module:dispatcher.Maybe<T>
 */

/**
 * @typedef {module:dispatcher.Maybe<*>} module:dispatcher.MaybeHandler
 */

/**
 * Interface to be implemented by objects that define a mapping between routes and handler objects.
 * A handler will always be wrapped in a {@link HandlerExecutionChain|HandlerExecutionChain} instance.
 */

/**
 * Return a handler for this route. The choice may be made on any factor the implementing class chooses.
 * Returns `null` if no match was found.
 * @param {module:dispatcher.Request} route The current route
 * @returns {module:dispatcher.HandlerExecutionChain} A HandlerExecutionChain instance containing handler object or `null` if no mapping
 */

/**
 * Additional interface that a {@link RouteHandlerMapping|HandlerMapping} can implement to expose a route matching API aligned with its internal route matching configuration and implementation.
 * @extends module:router.RouteHandlerMapping
 */

/**
 * Determine whether the given route matches the route criteria.
 * @param {module:dispatcher.Request} route The current route
 * @param {string} pattern
 * @returns {module:dispatcher.HandlerExecutionChain}
 */

const { from, isArray } = Array,
    { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object,
    { toString } = Object.prototype,
    doesNotStartWithSlash = (value: string) => !startsWith('/')(value),
    kind = /^\[object (.+)\]$/,
    kindOf = (value): string => kind.exec(toString.call(value))[1],
    resolveHandlerWithContext =
        (context: ApplicationContext) =>
        (handler: MaybeHandler): object =>
            when(isString, (key: string) => context.getValue(key))(handler);

/**
 * Internal registry entry for a mapping and its resolved handler method.
 */
class MappingEntry<T = any> {
    readonly mapping: T;
    readonly handlerMethod: RouteHandlerMethod;
    readonly directPaths: string[];
    readonly mappingName: string;

    get [Symbol.toStringTag](): string {
        return 'MappingEntry';
    }

    /**
     * Create a mapping registry entry.
     *
     * @param mapping - The mapping key.
     * @param handlerMethod - The resolved handler method.
     * @param mappingName - The mapping name, if any.
     * @param directPaths - Paths that map directly to this entry.
     */
    constructor(mapping: T, handlerMethod: RouteHandlerMethod, mappingName: string, directPaths: string[] = []) {
        /**
         */
        defineProperty(this, 'mapping', {
            value: mapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         */
        defineProperty(this, 'handlerMethod', {
            value: handlerMethod,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         */
        defineProperty(this, 'mappingName', {
            value: mappingName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         */
        defineProperty(this, 'directPaths', {
            value: directPaths,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * Maintains mapping-to-handler-method lookups.
 */
class MappingRegistry<T = any> {
    #registry = new Map<T, MappingEntry<T>>();
    #mappingLookup = new Map<T, RouteHandlerMethod>();
    #pathLookup = new MultiValueMap<string, T>();
    #nameLookup = new MultiValueMap<string, RouteHandlerMethod>();

    get [Symbol.toStringTag](): string {
        return 'MappingRegistry';
    }

    /**
     * Return the current mapping table.
     *
     * @returns The mapping-to-handler-method map.
     */
    get mappings(): Map<T, RouteHandlerMethod> {
        return this.#mappingLookup;
    }

    /**
     * Find mappings that are associated with a path.
     *
     * @param path - The request path.
     * @returns The matching mappings.
     */
    getMappingsByPath(path: string): T[] {
        return this.#pathLookup.get(path);
    }

    /**
     * Find handler methods registered under a mapping name.
     *
     * @param name - The mapping name.
     * @returns The matching handler methods.
     */
    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[] {
        return this.#nameLookup.get(name);
    }

    /**
     * Register a mapping and its handler method.
     *
     * @param mapping - The mapping key.
     * @param handlerMethod - The handler method to associate.
     * @param directPaths - Paths that map directly to this entry.
     */
    register(mapping: T, handlerMethod: RouteHandlerMethod, directPaths: string[] = []): void {
        this.#mappingLookup.set(mapping, handlerMethod);
        const length = directPaths.length;
        for (let i = 0; i < length; i++) {
            this.#pathLookup.add(directPaths[i], mapping);
        }
        let name: string;

        this.#registry.set(mapping, new MappingEntry(mapping, handlerMethod, name, directPaths));
    }

    unregister(mapping: T): void {
        if (!this.#registry.has(mapping)) {
            return;
        } else {
            const entry = this.#registry.get(mapping),
                { directPaths } = entry,
                length = directPaths.length;

            this.#registry.delete(mapping);
            this.#mappingLookup.delete(entry.mapping);

            for (let index = 0; index < length; index++) {
                const path = directPaths[index];
                if (this.#pathLookup.has(path)) {
                    const list = this.#pathLookup.get(path),
                        index = list.indexOf(entry.mapping);
                    index !== -1 && list.splice(index, 1);
                }
            }

            this._removeMappingName(entry);
        }
    }

    private _removeMappingName({ mappingName, handlerMethod }: MappingEntry): void {
        if (!mappingName) {
            return;
        }

        const _nameLookup = this.#nameLookup,
            oldList = _nameLookup.get(mappingName);

        if (!oldList) {
            return;
        }

        if (oldList.length <= 1) {
            _nameLookup.delete(mappingName);
            return;
        }

        const newList: RouteHandlerMethod[] = oldList.filter((hm) => hm !== handlerMethod);

        _nameLookup.set(mappingName, newList);
    }
}

/**
 * @implements module:core.Serializable
 */
class Match<T> implements Serializable {
    readonly mapping: T;
    readonly handlerMethod: RouteHandlerMethod;

    get [Symbol.toStringTag](): string {
        return 'Match';
    }

    constructor(mapping: T, handlerMethod: RouteHandlerMethod) {
        /**
         */
        defineProperty(this, 'mapping', {
            value: mapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        /**
         */
        defineProperty(this, 'handlerMethod', {
            value: handlerMethod,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * @returns {string}
     */
    toString(): string {
        return this.mapping.toString();
    }
}

/**
 * @implements module:core.Comparator<module:dispatcher~Match>
 */
class MatchComparator<T> implements Comparator<Match<T>> {
    readonly comparator: Comparator<T>;

    get [Symbol.toStringTag](): string {
        return 'MatchComparator';
    }

    constructor(comparator: Comparator<T>) {
        defineProperty(this, 'comparator', {
            value: comparator,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * @param {module:dispatcher~Match} match1
     * @param {module:dispatcher~Match} match2
     * @returns {number}
     */
    compare(match1: Match<T>, match2: Match<T>): number {
        return this.comparator.compare(match1.mapping, match2.mapping);
    }
}

/**
 * Base class for handler mappings that resolve a route to a handler.
 */
export abstract class AbstractHandlerMapping
    extends AsNameAware(AsApplicationContextAware(Null))
    implements RouteHandlerMapping
{
    /**
     * Application context used to resolve named handlers.
     */
    applicationContext: ApplicationContext;

    /**
     * Default handler used when no specific mapping matches.
     */
    defaultHandler;

    /**
     * Interceptors applied to matched handlers.
     */
    interceptors: RouteHandlerInterceptor[];

    /**
     * Path matcher used by path-based mappings.
     */
    pathMatcher: PathMatcher;

    /**
     * Pre-bound resolver for handlers with context.
     */
    #resolveHandler: (handler: MaybeHandler) => object = (handler) => handler as object;

    get [Symbol.toStringTag](): string {
        return 'HandlerMapping';
    }

    /**
     * Create a handler mapping with default path matching behavior.
     */
    constructor() {
        super();
        defineProperty(this, 'defaultHandler', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'interceptors', {
            value: [],
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'pathMatcher', {
            value: new GlobPathMatcher(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Store the application context for later handler resolution.
     *
     * @param applicationContext - The application context to use.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.#resolveHandler = resolveHandlerWithContext(applicationContext);
    }

    /**
     * Resolve a route to a handler execution chain.
     *
     * @param route - The current route.
     * @returns The execution chain, or `null` when no handler matches.
     */
    getHandler(route: Route): RouteHandlerExecutionChain {
        let handler: any | string | RouteHandlerExecutionChain = this._getHandler(route);

        if (!handler) {
            handler = this.defaultHandler;
        }
        if (!handler) {
            return null;
        }

        handler = this.#resolveHandler(handler);

        return this._getHandlerExecutionChain(handler, route);
    }

    /**
     * Build an execution chain for a resolved handler and route.
     *
     * @param handler - The resolved handler or existing execution chain.
     * @param route - The current route.
     * @returns The execution chain to invoke.
     */
    protected _getHandlerExecutionChain(
        handler: any | RouteHandlerExecutionChain,
        route: Route
    ): RouteHandlerExecutionChain {
        const chain = handler instanceof RouteHandlerExecutionChain ? handler : new RouteHandlerExecutionChain(handler),
            { interceptors, pathMatcher } = this,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedHandlerInterceptor) {
                    if (interceptor.matches(route.path, pathMatcher)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                } else {
                    chain.addInterceptor(interceptor);
                }
            }
        }

        return chain;
    }

    /**
     * Resolve the handler for a route without applying defaults or interceptors.
     *
     * @param route - The current route.
     * @returns The handler or execution chain, or `null`.
     */
    protected abstract _getHandler(route: Route): RouteHandlerExecutionChain;
}

/**
 * Base class for mappings that resolve handler methods from application context values.
 */
export abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping implements Initializable {
    /**
     * Naming strategy used when exposing handler methods by name.
     */
    namingStrategy: RouteHandlerMethodMappingNamingStrategy<T>;

    /**
     * Registry of route mappings and their handler methods.
     */
    readonly mappingRegistry: MappingRegistry<T>;

    /**
     * Cache for kindOf(this) to avoid repeated calls
     */
    #kindOfTag: string | undefined;

    /**
     * Create a handler-method mapping with an empty registry.
     */
    constructor() {
        super();
        defineProperty(this, 'mappingRegistry', {
            value: new MappingRegistry<T>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
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
        return this.mappingRegistry.getHandlerMethodsByMappingName(name);
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
        handler = resolveHandlerWithContext(this.applicationContext)(handler);

        const handlerMethod = new RouteHandlerMethod(handler, method);

        if (hasMethodParameter(handler, method)) {
            handlerMethod.parameters = getMethodParameter(handler, method);
        }

        return handlerMethod;
    }

    /**
     * Look for methods in the specified handler.
     * @param {*} handler Either a name or an actual handler instance.
     * @see {@link AbstractHandlerMethodMapping#_getMappingForMethod}
     */
    /**
     * Scan a handler for mapped methods and register them.
     *
     * @param handler - The handler instance or application-context name.
     */
    protected _detectHandlerMethods(handler: MaybeHandler) {
        handler = resolveHandlerWithContext(this.applicationContext)(handler);

        if (handler) {
            const handlerPrototype = getPrototypeOf(handler);

            keys(handlerPrototype).forEach((key) => {
                if (isFunction(handlerPrototype[key]) && hasRouteMapping(handler, key)) {
                    const info = this._getMappingForMethod(key, handlerPrototype);
                    this._registerHandlerMethod(handler, key, info);
                }
            });
        }
    }

    /**
     * Resolve a route by looking up the best handler method.
     *
     * @param route - The current route.
     * @returns The resolved handler method, or `null`.
     */
    protected _getHandler(route: Route): any {
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
    protected _lookupHandlerMethod(path: string, route: Route): RouteHandlerMethod {
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
        // TODO Put this in a categorized spot?
        route[(this.#kindOfTag ??= kindOf(this))] = path;
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
            const match: T = this._getMatchingMapping(mappings[index], route);
            if (match) {
                matches.push(new Match<T>(match, this.mappingRegistry.mappings.get(mappings[index])));
            }
        }
    }

    protected abstract _isHandler(value): boolean;
    protected abstract _getMappingComparator(route: Route): Comparator<T>;
    protected abstract _getMappingForMethod(method: string, handler): T;
    protected abstract _getMatchingMapping(mapping: T, route: Route): T;
}

/**
 * Base class for path-based handler mappings.
 */
export abstract class AbstractPathHandlerMapping extends AbstractHandlerMapping implements MatchableHandlerMapping {
    /**
     * Handler mapped to the root path.
     */
    rootHandler: object;

    /**
     * Whether trailing slash variants should be considered matches.
     */
    useTrailingSlashMatch: boolean;

    readonly #handlers: Map<string, MaybeHandler>;

    /**
     * Create a path handler mapping with empty path registrations.
     */
    constructor() {
        super();
        this.rootHandler = null;
        this.useTrailingSlashMatch = false;
        this.#handlers = new Map<string, MaybeHandler>();
    }

    /**
     * Look up the handler for a path.
     *
     * @param path - The request path.
     * @param route - The current route.
     * @returns The resolved execution chain, or `null`.
     */
    lookUpHandler(path: string, route: Route): RouteHandlerExecutionChain {
        const { applicationContext, pathMatcher, useTrailingSlashMatch } = this,
            _handlers = this.#handlers;
        let handler: MaybeHandler;
        if (_handlers.has(path)) {
            handler = _handlers.get(path);

            handler = resolveHandlerWithContext(applicationContext)(handler);

            return new RouteHandlerExecutionChain(handler);
        }

        const matchingPatterns: string[] = [];
        for (let pattern of _handlers.keys()) {
            if (pathMatcher.match(pattern, path)) {
                matchingPatterns.push(pattern);
            } else if (useTrailingSlashMatch) {
                if (!pattern.endsWith('/') && pathMatcher.match(`${pattern}/`, path)) {
                    matchingPatterns.push(`${pattern}/`);
                }
            }
        }

        let bestMatch: string = null;
        //const patternComparator: Comparator<string> = this.pathMatcher.getPatternComparator( path );
        if (matchingPatterns.length) {
            // TODO provide sorting function
            matchingPatterns.sort();
            bestMatch = matchingPatterns[0];
        }

        if (bestMatch) {
            handler = _handlers.get(bestMatch);
            if (!handler) {
                if (bestMatch.endsWith('/')) {
                    handler = _handlers.get(bestMatch.substring(0, bestMatch.length - 1));
                }
                if (!handler) {
                    throw new IllegalStateError(`Could not find handler for pattern "${bestMatch}"`);
                }
            }

            handler = resolveHandlerWithContext(this.applicationContext)(handler);

            return new RouteHandlerExecutionChain(handler);
        }

        return null;
    }

    /**
     * Check whether a route matches a path pattern.
     *
     * @param route - The current route.
     * @param pattern - The pattern to test.
     * @returns A match result, or `null`.
     */
    match(route: Route, pattern: string): RouteMatchResult {
        const { pathMatcher, useTrailingSlashMatch } = this,
            path = route.path;
        if (pathMatcher.match(pattern, path)) {
            return new RouteMatchResult(pattern, path);
        } else if (useTrailingSlashMatch) {
            const patternSlash = `${pattern}/`;
            if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                return new RouteMatchResult(patternSlash, path);
            }
        }
        return null;
    }

    /**
     * Resolve the most appropriate handler for a route.
     *
     * @param route - The current route.
     * @returns The execution chain, or `null`.
     */
    protected _getHandler(route: Route): RouteHandlerExecutionChain {
        let path = route.path,
            handler = this.lookUpHandler(path, route);
        if (!handler) {
            let rawHandler: MaybeHandler | RouteHandlerExecutionChain = null;
            if ('/' === path) {
                rawHandler = this.rootHandler;
            }
            if (!rawHandler) {
                rawHandler = this.defaultHandler;
            }
            if (rawHandler) {
                rawHandler = resolveHandlerWithContext(this.applicationContext)(rawHandler);
                handler = new RouteHandlerExecutionChain(rawHandler);
            }
        }
        return handler;
    }

    /**
     * Register a handler against one or more paths.
     *
     * @param path - One path or many paths to register.
     * @param handler - The handler instance or application-context name.
     */
    protected _registerHandler(path: string | string[], handler: MaybeHandler): void {
        if (!isArray(path)) {
            path = [path];
        }

        path.forEach((p) => {
            if (typeof p !== 'string') {
                throw new TypeError(`Path must be a string`);
            }
            if (typeof handler === 'undefined') {
                throw new TypeError('Handler must be defined');
            }
            let resolvedHandler = resolveHandlerWithContext(this.applicationContext)(handler);

            const mappedHandler: MaybeHandler = this.#handlers.get(p);

            if (mappedHandler) {
                if (mappedHandler !== resolvedHandler) {
                    throw new IllegalStateError(
                        `Cannot map handler ${handler} to path "${p}". There is already ${mappedHandler} mapped.`
                    );
                }
            } else {
                switch (p) {
                    case '/':
                        this.rootHandler = resolvedHandler;
                        break;
                    case '/*':
                        this.defaultHandler = resolvedHandler;
                        break;
                    default:
                        this.#handlers.set(p, resolvedHandler);
                        break;
                }
            }
        });
    }
}

/**
 * Base class for path mappings that discover handlers from the application context.
 */
export abstract class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    /**
     * Store the application context and detect handlers immediately.
     *
     * @param context - The application context to use.
     */
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        this._detectHandlers();
    }

    /**
     * Scan the application context for handlers and register their paths.
     */
    protected _detectHandlers(): void {
        const names = keys(this.applicationContext);
        names.forEach((name) => {
            const paths = this._determinePathsForHandler(name);
            paths.length && this._registerHandler(paths, name);
        });
    }

    /**
     * Determine the paths for a handler name.
     *
     * @param name - The application-context name.
     * @returns The paths to register.
     */
    protected abstract _determinePathsForHandler(name: string): string[];
}

/**
 * Abstract base class for {@link RouteHandlerMapping|HandlerMapping} implementations.
 * @abstract
 * @implements module:router.RouteHandlerMapping
 */

/**
 */

/**
 */

/**
 * Look up a handler for the given route, returning null if no specific one is found.
 * @protected
 * @abstract
 * @param {module:dispatcher.Request} route The current route
 * @returns {module:dispatcher.HandlerExecutionChain}
 */

/**
 * Abstract base class for path-mapped {@link RouteHandlerMapping|HandlerMapping} implementations. Provides infrastructure for mapping handlers to paths.
 * @abstract
 * @extends module:dispatcher.AbstractHandlerMapping
 * @implements module:dispatcher.MatchableHandlerMapping
 */

/**
 * Abstract implementation of the {@link RouteHandlerMapping|HandlerMapping} interface, detecting path mappings for handlers.
 * @abstract
 * @extends module:dispatcher.AbstractPathHandlerMapping
 */

/**
 * Register all handlers found in the current Context.
 * The actual path determination for a handler is up to the {@link AbstractDetectingPathHandlerMapping#_determinePathsForHandler|_determinePathsForHandler} implementation.
 * @protected
 */

/**
 * Determine the paths for the given handler.
 * @protected
 * @abstract
 * @param {string} name
 * @returns {Array<external:string>} The paths determined for the handler or an empty array if none found
 */

/**
 * Implementation of the {@link RouteHandlerMapping|HandlerMapping} interface that map from paths to handlers with names that start with slash ("/").
 * <p>This is the default implementation used by {@link Dispatcher|the dispatcher} along with {@link LinearMetadataHandlerMapping|LinearMetadataHandlerMapping}.
 * <p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
 * <p>Supports direct matches and wildcard matches.
 * @extends module:dispatcher.AbstractDetectingPathHandlerMapping
 */
/**
 * Map handlers by application-context names that start with `/`.
 */
export class NamePathHandlerMapping extends AbstractDetectingPathHandlerMapping {
    get [Symbol.toStringTag](): string {
        return 'NamePathHandlerMapping';
    }

    /**
     * Use slash-prefixed application-context names as route paths.
     *
     * @param name - The application-context name.
     * @returns The derived paths.
     */
    protected _determinePathsForHandler(name: string): string[] {
        const paths: string[] = [];
        name.startsWith('/') && paths.push(...name.split(' '));
        return paths;
    }
}

/**
 * Creates {@link RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@link RequestMapping|@RequestHandler} and {@link RequestMapping|@RequestMapping} decorators.
 * @extends module:dispatcher.AbstractHandlerMethodMapping<module:dispatcher.RequestMappingInfo>
 * @implements module:dispatcher.MatchableHandlerMapping
 */
/**
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
    match(route: Route, pattern: string): RouteMatchResult {
        const info: RouteMappingInfo = new RouteMappingInfo(pattern),
            matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value as string, route.path);
    }

    /**
     * Build mapping metadata for a handler method.
     *
     * @param method - The handler method name.
     * @param handler - The handler instance.
     * @returns The route mapping metadata, or `undefined`.
     */
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
    protected _getMatchingMapping(mapping: RouteMappingInfo, route: Route): RouteMappingInfo {
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
    protected _handleNoMatch(mappings, path: string, route: Route): RouteHandlerMethod {
        return null;
    }

    /**
     * Determine whether a value can be treated as a mapped handler.
     *
     * @param value - The candidate value.
     * @returns `true` when route mapping metadata is present.
     */
    protected _isHandler(value: any): boolean {
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

/**
 * Result of matching a route pattern to a path.
 */
export class RouteMatchResult {
    /**
     * The matched pattern.
     */
    readonly pattern: string;

    /**
     * The matched path.
     */
    readonly path: string;

    get [Symbol.toStringTag](): string {
        return 'RouteMatchResult';
    }

    /**
     * Create a route match result.
     *
     * @param pattern - The matched pattern.
     * @param path - The matched path.
     */
    constructor(pattern: string, path: string) {
        /**
         */
        defineProperty(this, 'pattern', {
            value: pattern,
            configurable: true,
            enumerable: true,
            writable: false,
        });
        /**
         */
        defineProperty(this, 'path', {
            value: path,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    /**
     * Serialize the match result to JSON.
     *
     * @returns A JSON representation of the match.
     */
    toJSON(): JSONValue {
        const json = createNull();
        json.pattern = this.pattern;
        json.path = this.path;
        return json;
    }
}

/**
 * Implementation of the {@link RouteHandlerMapping|HandlerMapping} interface to map from paths to handlers.
 * @extends module:dispatcher.AbstractPathHandlerMapping
 * @param {module:core.ApplicationContext} [context]
 * @param {Map<external:string, module:dispatcher.MaybeHandler>} [mappings]
 */
/**
 * Map handlers from explicit path registrations.
 */
export class SimplePathHandlerMapping extends AbstractPathHandlerMapping {
    /**
     * Explicit path-to-handler mappings.
     */
    mappings: Map<string, MaybeHandler>;

    get [Symbol.toStringTag](): string {
        return 'SimplePathHandlerMapping';
    }

    /**
     * Create an empty explicit path mapping.
     */
    constructor() {
        super();
        /**
         */
        this.mappings = new Map<string, MaybeHandler>();
    }

    /**
     * @param {module:core.ApplicationContext} context The application context to be set.
     */
    /**
     * Store the application context and register configured mappings.
     *
     * @param context - The application context to use.
     */
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        const mappings = this.mappings;
        this.registerHandlers(mappings);
    }

    /**
     * Map paths to handlers or handler names, merging it into the existing mappings if any.
     * @param {Object} mappings The path mappings
     */
    /**
     * Merge explicit path mappings into the registry.
     *
     * @param mappings - The path-to-handler map to merge.
     */
    setMappings(mappings: { [path: string]: MaybeHandler }): void {
        keys(mappings).forEach((path: string) => this.mappings.set(path, mappings[path]));
    }

    /**
     * @param {Map<external:string,module:dispatcher.MaybeHandler>} mappings
     */
    /**
     * Register handlers from a map, normalizing paths and handler names.
     *
     * @param mappings - The path-to-handler map to register.
     */
    registerHandlers(mappings: Map<string, MaybeHandler>): void {
        mappings &&
            mappings.size &&
            mappings.forEach((handler: MaybeHandler, path: string) => {
                path = when(doesNotStartWithSlash, (p) => `/${p}`)(path);
                handler = when(isString, trim)(handler);
                this._registerHandler(path, handler);
            });
    }
}
