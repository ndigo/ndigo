/**
 * @author Jeff Rose
 */
import { JSONValue, Null, PathMatcher, Comparator } from '@blue/core';
import { Initializable } from '@blue/factory';
import { ApplicationContext } from '@blue/context';
import { Route } from '@blue/router';
import { RouteHandlerInterceptor } from './route-handler-interceptor';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { RouteHandlerMethod, RouteHandlerMethodMappingNamingStrategy } from './route-handler-method';
import { RouteMappingInfo } from './route-mapping-info';
export type Maybe<T> = string | T;
export type MaybeHandler = Maybe<object>;
export interface RouteHandlerMapping {
    getHandler(route: Route): RouteHandlerExecutionChain;
}
export interface MatchableHandlerMapping extends RouteHandlerMapping {
    match(route: Route, pattern: string): RouteMatchResult;
}
/**
 * A registry that maintains all mappings to handler methods, exposing methods to perform lookups.
 */
declare class MappingRegistry<T = any> {
    #private;
    get [Symbol.toStringTag](): string;
    get mappings(): Map<T, RouteHandlerMethod>;
    getMappingsByPath(path: string): T[];
    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[];
    register(mapping: T, handlerMethod: RouteHandlerMethod): void;
    unregister(mapping: T): void;
    private _removeMappingName;
}
declare const AbstractHandlerMapping_base: (new (...args: any[]) => import("@blue/factory").NameAware) & import("@blue/core").Constructable<import("@blue/context").ApplicationContextAware> & typeof Null;
export declare abstract class AbstractHandlerMapping extends AbstractHandlerMapping_base implements RouteHandlerMapping {
    applicationContext: ApplicationContext;
    defaultHandler: any;
    interceptors: RouteHandlerInterceptor[];
    pathMatcher: PathMatcher;
    get [Symbol.toStringTag](): string;
    constructor();
    getHandler(route: Route): RouteHandlerExecutionChain;
    protected _getHandlerExecutionChain(handler: any | RouteHandlerExecutionChain, route: Route): RouteHandlerExecutionChain;
    protected abstract _getHandler(route: Route): RouteHandlerExecutionChain;
}
export declare abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping implements Initializable {
    namingStrategy: RouteHandlerMethodMappingNamingStrategy<T>;
    readonly mappingRegistry: MappingRegistry<T>;
    constructor();
    init(): void;
    getHandlerMethods(): Map<T, RouteHandlerMethod>;
    getHandlerMethodsForMappingName(name: string): RouteHandlerMethod[];
    registerMapping(mapping: T, handler: MaybeHandler, method: string): void;
    unregisterMapping(mapping: T): void;
    protected _createRequestHandlerMethod(handler: MaybeHandler, method: string): RouteHandlerMethod;
    /**
     * Look for methods in the specified handler.
     * @param {*} handler Either a name or an actual handler instance.
     * @see {@link AbstractHandlerMethodMapping#_getMappingForMethod}
     */
    protected _detectHandlerMethods(handler: MaybeHandler): void;
    protected _getHandler(route: Route): any;
    protected _lookupHandlerMethod(path: string, route: Route): RouteHandlerMethod;
    protected _handleMatch(mapping: T, path: string, route: Route): void;
    protected _registerHandlerMethod(handler: MaybeHandler, method: string, mapping: T): void;
    private _addMatchingMappings;
    protected abstract _isHandler(value: any): boolean;
    protected abstract _getMappingComparator(route: Route): Comparator<T>;
    protected abstract _getMappingForMethod(method: string, handler: any): T;
    protected abstract _getMatchingMapping(mapping: T, route: Route): T;
}
export declare abstract class AbstractPathHandlerMapping extends AbstractHandlerMapping implements MatchableHandlerMapping {
    #private;
    rootHandler: object;
    useTrailingSlashMatch: boolean;
    constructor();
    lookUpHandler(path: string, route: Route): RouteHandlerExecutionChain;
    match(route: Route, pattern: string): RouteMatchResult;
    protected _getHandler(route: Route): RouteHandlerExecutionChain;
    protected _registerHandler(path: string | string[], handler: MaybeHandler): void;
}
export declare abstract class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    setApplicationContext(context: ApplicationContext): void;
    protected _detectHandlers(): void;
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
 * <p>This is the default implementation used by {@link Dispatcher|the dispatcher} along with {@link MetadataHandlerMapping|MetadataHandlerMapping}.
 * <p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
 * <p>Supports direct matches and wildcard matches.
 * @extends module:dispatcher.AbstractDetectingPathHandlerMapping
 */
export declare class NamePathHandlerMapping extends AbstractDetectingPathHandlerMapping {
    get [Symbol.toStringTag](): string;
    protected _determinePathsForHandler(name: string): string[];
}
/**
 * Creates {@link RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@link RequestMapping|@RequestHandler} and {@link RequestMapping|@RequestMapping} decorators.
 * @extends module:dispatcher.AbstractHandlerMethodMapping<module:dispatcher.RequestMappingInfo>
 * @implements module:dispatcher.MatchableHandlerMapping
 */
export declare class MetadataHandlerMapping extends AbstractHandlerMethodMapping<RouteMappingInfo> implements MatchableHandlerMapping {
    get [Symbol.toStringTag](): string;
    match(route: Route, pattern: string): RouteMatchResult;
    protected _getMappingForMethod(method: string, handler: any): RouteMappingInfo;
    protected _getMappingComparator(route: Route): Comparator<RouteMappingInfo>;
    protected _getMatchingMapping(mapping: RouteMappingInfo, route: Route): RouteMappingInfo;
    protected _handleMatch(mapping: RouteMappingInfo, path: string, route: Route): void;
    protected _handleNoMatch(mappings: any, path: string, route: Route): RouteHandlerMethod;
    protected _isHandler(value: any): boolean;
}
/**
 */
export declare class RouteMatchResult {
    readonly pattern: string;
    readonly path: string;
    get [Symbol.toStringTag](): string;
    constructor(pattern: string, path: string);
    toJSON(): JSONValue;
}
/**
 * Implementation of the {@link RouteHandlerMapping|HandlerMapping} interface to map from paths to handlers.
 * @extends module:dispatcher.AbstractPathHandlerMapping
 * @param {module:core.ApplicationContext} [context]
 * @param {Map<external:string, module:dispatcher.MaybeHandler>} [mappings]
 */
export declare class SimplePathHandlerMapping extends AbstractPathHandlerMapping {
    mappings: Map<string, MaybeHandler>;
    get [Symbol.toStringTag](): string;
    constructor();
    /**
     * @param {module:core.ApplicationContext} context The application context to be set.
     */
    setApplicationContext(context: ApplicationContext): void;
    /**
     * Map paths to handlers or handler names, merging it into the existing mappings if any.
     * @param {Object} mappings The path mappings
     */
    setMappings(mappings: {
        [path: string]: MaybeHandler;
    }): void;
    /**
     * @param {Map<external:string,module:dispatcher.MaybeHandler>} mappings
     */
    registerHandlers(mappings: Map<string, MaybeHandler>): void;
}
export {};
//# sourceMappingURL=route-handler-mapping.d.ts.map