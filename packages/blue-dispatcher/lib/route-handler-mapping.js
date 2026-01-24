/**
 * @author Jeff Rose
 */
import { createNull, Null, MultiValueMap, GlobPathMatcher, } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { AsApplicationContextAware } from '@blue/context';
import { complement, isFunction, isString, when, startsWith, trim } from '@blue/util';
import { MappedHandlerInterceptor } from './route-handler-interceptor';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { RouteHandlerMethod } from './route-handler-method';
import { RouteMappingInfo, PatternsRouteCondition } from './route-mapping-info';
import { hasRouteMapping, getRouteMapping } from './route-mapping';
import { hasMethodParameter, getMethodParameter } from './route-parameter';
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
const { from, isArray } = Array, { defineProperty, getPrototypeOf } = Reflect, { keys } = Object, { toString } = Object.prototype, doesNotStartWithSlash = complement(startsWith('/')), kind = /^\[object (.+)\]$/, kindOf = (value) => kind.exec(toString.call(value))[1], resolveHandlerWithContext = (context) => (handler) => when(isString, (key) => context.getValue(key))(handler);
/**
 * @class module:dispatcher~MappingEntry
 */
class MappingEntry {
    mapping;
    handlerMethod;
    directPaths;
    mappingName;
    get [Symbol.toStringTag]() {
        return 'MappingEntry';
    }
    constructor(mapping, handlerMethod, mappingName, directPaths = []) {
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
class MappingRegistry {
    #registry = new Map();
    #mappingLookup = new Map();
    #pathLookup = new MultiValueMap();
    #nameLookup = new MultiValueMap();
    get [Symbol.toStringTag]() {
        return 'MappingRegistry';
    }
    get mappings() {
        return this.#mappingLookup;
    }
    getMappingsByPath(path) {
        return this.#pathLookup.get(path);
    }
    getHandlerMethodsByMappingName(name) {
        return this.#nameLookup.get(name);
    }
    register(mapping, handlerMethod) {
        this.#mappingLookup.set(mapping, handlerMethod);
        let name;
        this.#registry.set(mapping, new MappingEntry(mapping, handlerMethod, name));
    }
    unregister(mapping) {
        if (!this.#registry.has(mapping)) {
            return;
        }
        else {
            const entry = this.#registry.get(mapping), { directPaths } = entry, length = directPaths.length;
            this.#registry.delete(mapping);
            this.#mappingLookup.delete(entry.mapping);
            for (let index = 0; index < length; index++) {
                const path = directPaths[index];
                if (this.#pathLookup.has(path)) {
                    const list = this.#pathLookup.get(path), index = list.indexOf(entry.mapping);
                    index !== -1 && list.splice(index, 1);
                }
            }
            this._removeMappingName(entry);
        }
    }
    _removeMappingName({ mappingName, handlerMethod }) {
        if (!mappingName) {
            return;
        }
        const _nameLookup = this.#nameLookup, oldList = _nameLookup.get(mappingName);
        if (!oldList) {
            return;
        }
        if (oldList.length <= 1) {
            _nameLookup.delete(mappingName);
            return;
        }
        const newList = oldList.filter((hm) => hm !== handlerMethod);
        _nameLookup.set(mappingName, newList);
    }
}
/**
 * @class module:dispatcher~Match
 * @implements module:core.Serializable
 */
class Match {
    mapping;
    handlerMethod;
    get [Symbol.toStringTag]() {
        return 'Match';
    }
    constructor(mapping, handlerMethod) {
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
    toString() {
        return this.mapping.toString();
    }
}
/**
 * @class module:dispatcher~MatchComparator
 * @implements module:core.Comparator<module:dispatcher~Match>
 */
class MatchComparator {
    comparator;
    get [Symbol.toStringTag]() {
        return 'MatchComparator';
    }
    constructor(comparator) {
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
    compare(match1, match2) {
        return this.comparator.compare(match1.mapping, match2.mapping);
    }
}
export class AbstractHandlerMapping extends AsNameAware(AsApplicationContextAware(Null)) {
    applicationContext;
    defaultHandler;
    interceptors;
    pathMatcher;
    get [Symbol.toStringTag]() {
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
    getHandler(route) {
        let handler = this._getHandler(route);
        if (!handler) {
            handler = this.defaultHandler;
        }
        if (!handler) {
            return null;
        }
        handler = resolveHandlerWithContext(this.applicationContext)(handler);
        return this._getHandlerExecutionChain(handler, route);
    }
    _getHandlerExecutionChain(handler, route) {
        const chain = handler instanceof RouteHandlerExecutionChain ? handler : new RouteHandlerExecutionChain(handler), { interceptors, pathMatcher } = this, length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedHandlerInterceptor) {
                    if (interceptor.matches(route.path, pathMatcher)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                }
                else {
                    chain.addInterceptor(interceptor);
                }
            }
        }
        return chain;
    }
}
export class AbstractHandlerMethodMapping extends AbstractHandlerMapping {
    namingStrategy;
    mappingRegistry;
    constructor() {
        super();
        defineProperty(this, 'mappingRegistry', {
            value: new MappingRegistry(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    init() {
        const { applicationContext } = this;
        keys(applicationContext).forEach((name) => {
            const value = applicationContext.getValue(name);
            this._isHandler(value) && this._detectHandlerMethods(value);
        });
    }
    getHandlerMethods() {
        return this.mappingRegistry.mappings;
    }
    getHandlerMethodsForMappingName(name) {
        return this.mappingRegistry.getHandlerMethodsByMappingName(name);
    }
    registerMapping(mapping, handler, method) {
        this.mappingRegistry.register(mapping, this._createRequestHandlerMethod(handler, method));
    }
    unregisterMapping(mapping) {
        this.mappingRegistry.unregister(mapping);
    }
    _createRequestHandlerMethod(handler, method) {
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
    _detectHandlerMethods(handler) {
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
    _getHandler(route) {
        const { path } = route;
        return this._lookupHandlerMethod(path, route);
    }
    _lookupHandlerMethod(path, route) {
        const { mappingRegistry } = this, matches = [], directPathMatches = mappingRegistry.getMappingsByPath(path);
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
                    const m1 = bestMatch.handlerMethod.method, m2 = nextMatch.handlerMethod.method;
                    throw new Error(`Ambiguous handler methods mapped for "${path}": { ${m1}, ${m2} }`);
                }
            }
            this._handleMatch(bestMatch.mapping, path, route);
            return bestMatch.handlerMethod;
        }
        return null;
    }
    _handleMatch(mapping, path, route) {
        // TODO Put this in a categorized spot?
        route[kindOf(this)] = path;
    }
    _registerHandlerMethod(handler, method, mapping) {
        this.registerMapping(mapping, handler, method);
    }
    _addMatchingMappings(mappings, matches, route) {
        const length = mappings.length;
        for (let index = 0; index < length; index++) {
            const match = this._getMatchingMapping(mappings[index], route);
            if (match) {
                matches.push(new Match(match, this.mappingRegistry.mappings.get(mappings[index])));
            }
        }
    }
}
export class AbstractPathHandlerMapping extends AbstractHandlerMapping {
    rootHandler;
    useTrailingSlashMatch;
    #handlers;
    constructor() {
        super();
        this.rootHandler = null;
        this.useTrailingSlashMatch = false;
        this.#handlers = new Map();
    }
    lookUpHandler(path, route) {
        const { applicationContext, pathMatcher, useTrailingSlashMatch } = this, _handlers = this.#handlers;
        let handler;
        if (_handlers.has(path)) {
            handler = _handlers.get(path);
            handler = resolveHandlerWithContext(applicationContext)(handler);
            return new RouteHandlerExecutionChain(handler);
        }
        const matchingPatterns = [];
        for (let pattern of _handlers.keys()) {
            if (pathMatcher.match(pattern, path)) {
                matchingPatterns.push(pattern);
            }
            else if (useTrailingSlashMatch) {
                if (!pattern.endsWith('/') && pathMatcher.match(`${pattern}/`, path)) {
                    matchingPatterns.push(`${pattern}/`);
                }
            }
        }
        let bestMatch = null;
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
    match(route, pattern) {
        const { pathMatcher, useTrailingSlashMatch } = this, path = route.path;
        if (pathMatcher.match(pattern, path)) {
            return new RouteMatchResult(pattern, path);
        }
        else if (useTrailingSlashMatch) {
            const patternSlash = `${pattern}/`;
            if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                return new RouteMatchResult(patternSlash, path);
            }
        }
        return null;
    }
    _getHandler(route) {
        let path = route.path, handler = this.lookUpHandler(path, route);
        if (!handler) {
            let rawHandler = null;
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
    _registerHandler(path, handler) {
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
            const mappedHandler = this.#handlers.get(p);
            if (mappedHandler) {
                if (mappedHandler !== resolvedHandler) {
                    throw new Error(`Cannot map handler ${handler} to path "${p}". There is already ${mappedHandler} mapped.`);
                }
            }
            else {
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
export class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    setApplicationContext(context) {
        super.setApplicationContext(context);
        this._detectHandlers();
    }
    _detectHandlers() {
        const names = keys(this.applicationContext);
        names.forEach((name) => {
            const paths = this._determinePathsForHandler(name);
            paths.length && this._registerHandler(paths, name);
        });
    }
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
    get [Symbol.toStringTag]() {
        return 'NamePathHandlerMapping';
    }
    _determinePathsForHandler(name) {
        const paths = [];
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
export class MetadataHandlerMapping extends AbstractHandlerMethodMapping {
    get [Symbol.toStringTag]() {
        return 'MetadataHandlerMapping';
    }
    match(route, pattern) {
        const info = new RouteMappingInfo(pattern), matchingInfo = info.getMatchingCondition(route);
        if (!matchingInfo) {
            return null;
        }
        const patterns = matchingInfo.patternsCondition.patterns;
        return new RouteMatchResult(patterns[Symbol.iterator]().next().value, route.path);
    }
    _getMappingForMethod(method, handler) {
        const methodMapping = getRouteMapping(handler, method);
        let methodInfo;
        if (methodMapping) {
            methodInfo = new RouteMappingInfo(methodMapping.value, new PatternsRouteCondition(methodMapping.value));
            const handlerMapping = getRouteMapping(handler.constructor);
            if (handlerMapping) {
                const handlerInfo = new RouteMappingInfo(handlerMapping.value, new PatternsRouteCondition(handlerMapping.value));
                methodInfo = handlerInfo.merge(methodInfo);
            }
        }
        return methodInfo;
    }
    _getMappingComparator(route) {
        return {
            compare: (info1, info2) => info1.compareTo(info2, route),
        };
    }
    _getMatchingMapping(mapping, route) {
        return mapping.getMatchingCondition(route);
    }
    _handleMatch(mapping, path, route) {
        super._handleMatch(mapping, path, route);
        let bestPattern;
        const patterns = mapping.patternsCondition.patterns;
        if (!patterns.size) {
            bestPattern = path;
        }
        else {
            bestPattern = patterns[Symbol.iterator]().next().value;
        }
        defineProperty(route, 'pattern', {
            value: bestPattern,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    _handleNoMatch(mappings, path, route) {
        return null;
    }
    _isHandler(value) {
        return hasRouteMapping(value) || ('constructor' in value && hasRouteMapping(value.constructor));
    }
}
/**
 * @class module:router.RouteMatchResult
 */
export class RouteMatchResult {
    pattern;
    path;
    get [Symbol.toStringTag]() {
        return 'RouteMatchResult';
    }
    constructor(pattern, path) {
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
    toJSON() {
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
    mappings;
    get [Symbol.toStringTag]() {
        return 'SimplePathHandlerMapping';
    }
    constructor() {
        super();
        /**
         * @member {external:Map<external:string,module:dispatcher.MaybeHandler>} module:dispatcher.SimplePathHandlerMapping#mappings
         */
        this.mappings = new Map();
    }
    /**
     * @function module:dispatcher.SimplePathHandlerMapping#setApplicationContext
     * @param {module:core.ApplicationContext} context The application context to be set.
     */
    setApplicationContext(context) {
        super.setApplicationContext(context);
        const mappings = this.mappings;
        this.registerHandlers(mappings);
    }
    /**
     * Map paths to handlers or handler names, merging it into the existing mappings if any.
     * @function module:dispatcher.SimplePathHandlerMapping#setMappings
     * @param {external:Object} mappings The path mappings
     */
    setMappings(mappings) {
        keys(mappings).forEach((path) => this.mappings.set(path, mappings[path]));
    }
    /**
     * @function module:dispatcher.SimplePathHandlerMapping#registerHandlers
     * @param {external:Map<external:string,module:dispatcher.MaybeHandler>} mappings
     */
    registerHandlers(mappings) {
        mappings &&
            mappings.size &&
            mappings.forEach((handler, path) => {
                path = when(doesNotStartWithSlash, (p) => `/${p}`)(path);
                handler = when(isString, trim)(handler);
                this._registerHandler(path, handler);
            });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWhhbmRsZXItbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFDSCxVQUFVLEVBRVYsSUFBSSxFQUNKLGFBQWEsRUFFYixlQUFlLEdBR2xCLE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxXQUFXLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQzNELE9BQU8sRUFBc0IseUJBQXlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RGLE9BQU8sRUFBMkIsd0JBQXdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNoRyxPQUFPLDBCQUEwQixNQUFNLGlDQUFpQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBMkMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNoRixPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBYzNFOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7R0FNRztBQUVILE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxFQUMzQixFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVDLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUNqQixFQUFFLFFBQVEsRUFB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