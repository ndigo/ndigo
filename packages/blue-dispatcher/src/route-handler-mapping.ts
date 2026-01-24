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
} from '@blue/core';
import { AsNameAware, Initializable } from '@blue/factory';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Route } from '@blue/router';
import { complement, isFunction, isString, when, startsWith, trim } from '@blue/util';
import { RouteHandlerInterceptor, MappedHandlerInterceptor } from './route-handler-interceptor';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo, PatternsRouteCondition } from './route-mapping-info';
import { hasRouteMapping, getRouteMapping } from './route-mapping';
import { hasMethodParameter, getMethodParameter } from './route-parameter';

export type Maybe<T> = string | T;

export type MaybeHandler = Maybe<object>;

export interface RouteHandlerMapping {
    getHandler(route: Route): RouteHandlerExecutionChain;
}

export interface MatchableHandlerMapping extends RouteHandlerMapping {
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
 * A handler will always be wrapped in a {@linkcode module:dispatcher.HandlerExecutionChain|HandlerExecutionChain} instance.
 * @interface module:router.RouteHandlerMapping
 */

/**
 * Return a handler for this route. The choice may be made on any factor the implementing class chooses.
 * Returns `null` if no match was found.
 * @function module:router.RouteHandlerMapping#getHandler
 * @param {module:dispatcher.Request} route The current route
 * @returns {module:dispatcher.HandlerExecutionChain} A HandlerExecutionChain instance containing handler object or `null` if no mapping
 */

/**
 * Additional interface that a {@linkcode module:router.RouteHandlerMapping|HandlerMapping} can implement to expose a route matching API aligned with its internal route matching configuration and implementation.
 * @interface module:dispatcher.MatchableHandlerMapping
 * @extends module:router.RouteHandlerMapping
 */

/**
 * Determine whether the given route matches the route criteria.
 * @function module:dispatcher.MatchableHandlerMapping#match
 * @param {module:dispatcher.Request} route The current route
 * @param {external:string} pattern
 * @returns {module:dispatcher.HandlerExecutionChain}
 */

const { from, isArray } = Array,
    { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object,
    { toString } = Object.prototype,
    doesNotStartWithSlash = complement(startsWith('/')),
    kind = /^\[object (.+)\]$/,
    kindOf = (value): string => kind.exec(toString.call(value))[1],
    resolveHandlerWithContext =
        (context: ApplicationContext) =>
        (handler: MaybeHandler): object =>
            when(isString, (key: string) => context.getValue(key))(handler);

/**
 * @class module:dispatcher~MappingEntry
 */
class MappingEntry<T = any> {
    readonly mapping: T;
    readonly handlerMethod: RouteHandlerMethod;
    readonly directPaths: string[];
    readonly mappingName: string;

    get [Symbol.toStringTag](): string {
        return 'MappingEntry';
    }

    constructor(mapping: T, handlerMethod: RouteHandlerMethod, mappingName: string, directPaths: string[] = []) {
        /**
         * @member {T} module:dispatcher~MappingEntry#mapping
         */
        defineProperty(this, 'mapping', {
            value: mapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         * @member {module:dispatcher.HandlerMethod} module:dispatcher~MappingEntry#handlerMethod
         */
        defineProperty(this, 'handlerMethod', {
            value: handlerMethod,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         * @member {external:string} module:dispatcher~MappingEntry#mappingName
         */
        defineProperty(this, 'mappingName', {
            value: mappingName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        /**
         * @member {external:Array<external:string>} module:dispatcher~MappingEntry#directPaths
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
 * A registry that maintains all mappings to handler methods, exposing methods to perform lookups.
 * @class module:dispatcher~MappingRegistry
 */
class MappingRegistry<T = any> {
    #registry = new Map<T, MappingEntry<T>>();
    #mappingLookup = new Map<T, RouteHandlerMethod>();
    #pathLookup = new MultiValueMap<string, T>();
    #nameLookup = new MultiValueMap<string, RouteHandlerMethod>();

    get [Symbol.toStringTag](): string {
        return 'MappingRegistry';
    }

    get mappings(): Map<T, RouteHandlerMethod> {
        return this.#mappingLookup;
    }

    getMappingsByPath(path: string): T[] {
        return this.#pathLookup.get(path);
    }

    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[] {
        return this.#nameLookup.get(name);
    }

    register(mapping: T, handlerMethod: RouteHandlerMethod) {
        this.#mappingLookup.set(mapping, handlerMethod);
        let name: string;

        this.#registry.set(mapping, new MappingEntry(mapping, handlerMethod, name));
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
 * @class module:dispatcher~Match
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
         * @member {T} module:dispatcher~Match#mapping
         */
        defineProperty(this, 'mapping', {
            value: mapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        /**
         * @member {module:dispatcher.HandlerMethod} module:dispatcher~Match#handlerMethod
         */
        defineProperty(this, 'handlerMethod', {
            value: handlerMethod,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * @function module:dispatcher~Match#toString
     * @returns {external:string}
     */
    toString(): string {
        return this.mapping.toString();
    }
}

/**
 * @class module:dispatcher~MatchComparator
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
     * @function module:dispatcher~MatchComparator#compare
     * @param {module:dispatcher~Match} match1
     * @param {module:dispatcher~Match} match2
     * @returns {external:number}
     */
    compare(match1: Match<T>, match2: Match<T>): number {
        return this.comparator.compare(match1.mapping, match2.mapping);
    }
}

export abstract class AbstractHandlerMapping
    extends AsNameAware(AsApplicationContextAware(Null))
    implements RouteHandlerMapping
{
    applicationContext: ApplicationContext;
    defaultHandler;
    interceptors: RouteHandlerInterceptor[];
    pathMatcher: PathMatcher;

    get [Symbol.toStringTag](): string {
        return 'HandlerMapping';
    }

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

    getHandler(route: Route): RouteHandlerExecutionChain {
        let handler: any | string | RouteHandlerExecutionChain = this._getHandler(route);

        if (!handler) {
            handler = this.defaultHandler;
        }
        if (!handler) {
            return null;
        }

        handler = resolveHandlerWithContext(this.applicationContext)(handler);

        return this._getHandlerExecutionChain(handler, route);
    }

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

    protected abstract _getHandler(route: Route): RouteHandlerExecutionChain;
}

export abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping implements Initializable {
    namingStrategy: RouteHandlerMethodMappingNamingStrategy<T>;

    readonly mappingRegistry: MappingRegistry<T>;

    constructor() {
        super();
        defineProperty(this, 'mappingRegistry', {
            value: new MappingRegistry<T>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    init(): void {
        const { applicationContext } = this;
        keys(applicationContext).forEach((name) => {
            const value = applicationContext.getValue(name);
            this._isHandler(value) && this._detectHandlerMethods(value);
        });
    }

    getHandlerMethods(): Map<T, RouteHandlerMethod> {
        return this.mappingRegistry.mappings;
    }

    getHandlerMethodsForMappingName(name: string): RouteHandlerMethod[] {
        return this.mappingRegistry.getHandlerMethodsByMappingName(name);
    }

    registerMapping(mapping: T, handler: MaybeHandler, method: string): void {
        this.mappingRegistry.register(mapping, this._createRequestHandlerMethod(handler, method));
    }

    unregisterMapping(mapping: T): void {
        this.mappingRegistry.unregister(mapping);
    }

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
     * @see {@link module:dispatcher.AbstractHandlerMethodMapping#_getMappingForMethod}
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

    protected _getHandler(route: Route): any {
        const { path } = route;
        return this._lookupHandlerMethod(path, route);
    }

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
            const comparator = new MatchComparator(this._getMappingComparator(route));
            matches.sort(comparator.compare);
            const bestMatch = matches[0];
            if (matches.length > 1) {
                const nextMatch = matches[1];
                if (comparator.compare(bestMatch, nextMatch) === 0) {
                    const m1 = bestMatch.handlerMethod.method,
                        m2 = nextMatch.handlerMethod.method;
                    throw new Error(`Ambiguous handler methods mapped for "${path}": { ${m1}, ${m2} }`);
                }
            }
            this._handleMatch(bestMatch.mapping, path, route);
            return bestMatch.handlerMethod;
        }

        return null;
    }

    protected _handleMatch(mapping: T, path: string, route: Route): void {
        // TODO Put this in a categorized spot?
        route[kindOf(this)] = path;
    }

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

export abstract class AbstractPathHandlerMapping extends AbstractHandlerMapping implements MatchableHandlerMapping {
    rootHandler: object;
    useTrailingSlashMatch: boolean;

    readonly #handlers: Map<string, MaybeHandler>;

    constructor() {
        super();
        this.rootHandler = null;
        this.useTrailingSlashMatch = false;
        this.#handlers = new Map<string, MaybeHandler>();
    }

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
                    throw new Error(`Could not find handler for pattern "${bestMatch}"`);
                }
            }

            handler = resolveHandlerWithContext(this.applicationContext)(handler);

            return new RouteHandlerExecutionChain(handler);
        }

        return null;
    }

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
                    throw new Error(
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

export abstract class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        this._detectHandlers();
    }

    protected _detectHandlers(): void {
        const names = keys(this.applicationContext);
        names.forEach((name) => {
            const paths = this._determinePathsForHandler(name);
            paths.length && this._registerHandler(paths, name);
        });
    }

    protected abstract _determinePathsForHandler(name: string): string[];
}

/**
 * Abstract base class for {@linkcode module:router.RouteHandlerMapping|HandlerMapping} implementations.
 * @abstract
 * @class module:dispatcher.AbstractHandlerMapping
 * @implements module:router.RouteHandlerMapping
 */

/**
 * @member {module:core.ApplicationContext} module:dispatcher.AbstractHandlerMapping#context
 */

/**
 * @member {*} module:dispatcher.AbstractHandlerMapping#defaultHandler
 */

/**
 * Look up a handler for the given route, returning null if no specific one is found.
 * @protected
 * @abstract
 * @function module:dispatcher.AbstractHandlerMapping#_getHandler
 * @param {module:dispatcher.Request} route The current route
 * @returns {module:dispatcher.HandlerExecutionChain}
 */

/**
 * Abstract base class for path-mapped {@linkcode module:router.RouteHandlerMapping|HandlerMapping} implementations. Provides infrastructure for mapping handlers to paths.
 * @abstract
 * @class module:dispatcher.AbstractPathHandlerMapping
 * @extends module:dispatcher.AbstractHandlerMapping
 * @implements module:dispatcher.MatchableHandlerMapping
 */

/**
 * Abstract implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface, detecting path mappings for handlers.
 * @abstract
 * @class module:dispatcher.AbstractDetectingPathHandlerMapping
 * @extends module:dispatcher.AbstractPathHandlerMapping
 */

/**
 * Register all handlers found in the current Context.
 * The actual path determination for a handler is up to the {@linkcode module:dispatcher.AbstractDetectingPathHandlerMapping#_determinePathsForHandler|_determinePathsForHandler} implementation.
 * @protected
 * @function module:dispatcher.AbstractDetectingPathHandlerMapping#_detectHandlers
 */

/**
 * Determine the paths for the given handler.
 * @protected
 * @abstract
 * @function module:dispatcher.AbstractDetectingPathHandlerMapping#_determinePathsForHandler
 * @param {external:string} name
 * @returns {external:Array<external:string>} The paths determined for the handler or an empty array if none found
 */

/**
 * Implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface that map from paths to handlers with names that start with slash ("/").
 * <p>This is the default implementation used by {@link module:dispatcher.Dispatcher|the dispatcher} along with {@linkcode module:dispatcher.MetadataHandlerMapping|MetadataHandlerMapping}.
 * <p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
 * <p>Supports direct matches and wildcard matches.
 * @class module:dispatcher.NamePathHandlerMapping
 * @extends module:dispatcher.AbstractDetectingPathHandlerMapping
 */
export class NamePathHandlerMapping extends AbstractDetectingPathHandlerMapping {
    get [Symbol.toStringTag](): string {
        return 'NamePathHandlerMapping';
    }

    protected _determinePathsForHandler(name: string): string[] {
        const paths: string[] = [];
        name.startsWith('/') && paths.push(...name.split(' '));
        return paths;
    }
}

/**
 * Creates {@linkcode module:dispatcher.RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@linkcode module:dispatcher.RequestMapping|@RequestHandler} and {@linkcode module:dispatcher.RequestMapping|@RequestMapping} decorators.
 * @class module:dispatcher.MetadataHandlerMapping
 * @extends module:dispatcher.AbstractHandlerMethodMapping<module:dispatcher.RequestMappingInfo>
 * @implements module:dispatcher.MatchableHandlerMapping
 */
export class MetadataHandlerMapping
    extends AbstractHandlerMethodMapping<RouteMappingInfo>
    implements MatchableHandlerMapping
{
    get [Symbol.toStringTag](): string {
        return 'MetadataHandlerMapping';
    }

    match(route: Route, pattern: string): RouteMatchResult {
        const info: RouteMappingInfo = new RouteMappingInfo(pattern),
            matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value, route.path);
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

    protected _handleMatch(mapping: RouteMappingInfo, path: string, route: Route) {
        super._handleMatch(mapping, path, route);

        let bestPattern: string;

        const patterns = mapping.patternsCondition.patterns;

        if (!patterns.size) {
            bestPattern = path;
        } else {
            bestPattern = patterns[Symbol.iterator]().next().value;
        }

        defineProperty(route, 'pattern', {
            value: bestPattern,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    protected _handleNoMatch(mappings, path: string, route: Route): RouteHandlerMethod {
        return null;
    }

    protected _isHandler(value: any): boolean {
        return hasRouteMapping(value) || ('constructor' in value && hasRouteMapping(value.constructor));
    }
}

/**
 * @class module:router.RouteMatchResult
 */
export class RouteMatchResult {
    readonly pattern: string;
    readonly path: string;

    get [Symbol.toStringTag](): string {
        return 'RouteMatchResult';
    }

    constructor(pattern: string, path: string) {
        /**
         * @member {external:string} module:router.RouteMatchResult#pattern
         */
        defineProperty(this, 'pattern', {
            value: pattern,
            configurable: true,
            enumerable: true,
            writable: false,
        });
        /**
         * @member {external:string} module:router.RouteMatchResult#path
         */
        defineProperty(this, 'path', {
            value: path,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    toJSON(): JSONValue {
        const json = createNull();
        json.pattern = this.pattern;
        json.path = this.path;
        return json;
    }
}

/**
 * Implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface to map from paths to handlers.
 * @class module:dispatcher.SimplePathHandlerMapping
 * @extends module:dispatcher.AbstractPathHandlerMapping
 * @param {module:core.ApplicationContext} [context]
 * @param {external:Map<external:string, module:dispatcher.MaybeHandler>} [mappings]
 */
export class SimplePathHandlerMapping extends AbstractPathHandlerMapping {
    mappings: Map<string, MaybeHandler>;

    get [Symbol.toStringTag](): string {
        return 'SimplePathHandlerMapping';
    }

    constructor() {
        super();
        /**
         * @member {external:Map<external:string,module:dispatcher.MaybeHandler>} module:dispatcher.SimplePathHandlerMapping#mappings
         */
        this.mappings = new Map<string, MaybeHandler>();
    }

    /**
     * @function module:dispatcher.SimplePathHandlerMapping#setApplicationContext
     * @param {module:core.ApplicationContext} context The application context to be set.
     */
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        const mappings = this.mappings;
        this.registerHandlers(mappings);
    }

    /**
     * Map paths to handlers or handler names, merging it into the existing mappings if any.
     * @function module:dispatcher.SimplePathHandlerMapping#setMappings
     * @param {external:Object} mappings The path mappings
     */
    setMappings(mappings: { [path: string]: MaybeHandler }): void {
        keys(mappings).forEach((path: string) => this.mappings.set(path, mappings[path]));
    }

    /**
     * @function module:dispatcher.SimplePathHandlerMapping#registerHandlers
     * @param {external:Map<external:string,module:dispatcher.MaybeHandler>} mappings
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
