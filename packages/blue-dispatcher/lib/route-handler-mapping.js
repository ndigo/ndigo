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
const { from, isArray } = Array, { defineProperty, getPrototypeOf } = Reflect, { keys } = Object, { toString } = Object.prototype, doesNotStartWithSlash = complement(startsWith('/')), kind = /^\[object (.+)\]$/, kindOf = (value) => kind.exec(toString.call(value))[1], resolveHandlerWithContext = (context) => (handler) => when(isString, (key) => context.getValue(key))(handler);
/**
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
 * A registry that maintains all mappings to handler methods, exposing methods to perform lookups.
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
    toString() {
        return this.mapping.toString();
    }
}
/**
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
     * @param {module:dispatcher~Match} match1
     * @param {module:dispatcher~Match} match2
     * @returns {number}
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
     * @see {@link AbstractHandlerMethodMapping#_getMappingForMethod}
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
 * Creates {@link RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@link RequestMapping|@RequestHandler} and {@link RequestMapping|@RequestMapping} decorators.
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
 */
export class RouteMatchResult {
    pattern;
    path;
    get [Symbol.toStringTag]() {
        return 'RouteMatchResult';
    }
    constructor(pattern, path) {
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
    toJSON() {
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
export class SimplePathHandlerMapping extends AbstractPathHandlerMapping {
    mappings;
    get [Symbol.toStringTag]() {
        return 'SimplePathHandlerMapping';
    }
    constructor() {
        super();
        /**
         */
        this.mappings = new Map();
    }
    /**
     * @param {module:core.ApplicationContext} context The application context to be set.
     */
    setApplicationContext(context) {
        super.setApplicationContext(context);
        const mappings = this.mappings;
        this.registerHandlers(mappings);
    }
    /**
     * Map paths to handlers or handler names, merging it into the existing mappings if any.
     * @param {Object} mappings The path mappings
     */
    setMappings(mappings) {
        keys(mappings).forEach((path) => this.mappings.set(path, mappings[path]));
    }
    /**
     * @param {Map<external:string,module:dispatcher.MaybeHandler>} mappings
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWhhbmRsZXItbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFDSCxVQUFVLEVBRVYsSUFBSSxFQUNKLGFBQWEsRUFFYixlQUFlLEdBR2xCLE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxXQUFXLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQzNELE9BQU8sRUFBc0IseUJBQXlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RGLE9BQU8sRUFBMkIsd0JBQXdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNoRyxPQUFPLDBCQUEwQixNQUFNLGlDQUFpQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBMkMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNoRixPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBYzNFOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUgsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQzNCLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ2pCLEVBQUUsUUFBUSxFQUFFLEdB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