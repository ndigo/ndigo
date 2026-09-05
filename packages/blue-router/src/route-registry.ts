/**
 *
 * Scans `routeMapping` decorator metadata from registered beans and builds
 * a nested tree of type-safe {@link RouteDefinition} instances.
 *
 * The registry is constructed during application boot and registered as a
 * singleton entry in the application context.
 *
 * @see RouteDefinition
 */
import { type Registry } from '@blue/factory';
import { URLGlobPathMatcher } from '@blue/core';
import { RouteDefinition } from './route-definition';

/** Shared path matcher for merging class and method paths. */
const pathMatcher = new URLGlobPathMatcher();

/**
 * Key derivation for route patterns.
 *
 * @param path - The route pattern (e.g. "/users", "/{id}", "/").
 * @param name - Optional explicit name from `@routeMapping({ name: '...' })`.
 * @returns The derived key (e.g. "users", "byId", "index").
 */
export function deriveKey(path: string, name?: string): string {
    if (name) return name;
    if (path === '/' || path === '') return 'index';

    const segment = path.replace(/^\//, '').split('/').pop()!;

    if (segment.startsWith('{') && segment.endsWith('}')) {
        const param = segment.slice(1, -1);
        return `by${param.charAt(0).toUpperCase()}${param.slice(1)}`;
    }

    return segment;
}

/** Internal type for route mapping metadata stored by the `routeMapping` decorator. */
interface RouteMappingMeta {
    value: string;
    name?: string;
    private?: boolean;
    queryParams?: string;
    matrixParams?: string;
}

/**
 * Read `routeMapping` metadata from a class constructor's `Symbol.metadata`.
 * This mirrors the logic in `@blue/dispatcher`'s `getRouteMapping` without
 * requiring a dependency on that package.
 */
function getRouteMapping(target: unknown, propertyKey?: string | symbol): RouteMappingMeta | undefined {
    const metadata = (target as { [Symbol.metadata]?: Record<string, unknown> } | undefined)?.[Symbol.metadata] ?? {};
    if (propertyKey) {
        return metadata[`route:mapping:${String(propertyKey)}`] as RouteMappingMeta | undefined;
    }
    return metadata['route:mapping'] as RouteMappingMeta | undefined;
}

/**
 * Read metadata keys from a class constructor's `Symbol.metadata`.
 * Returns all keys that start with the route mapping prefix.
 */
function getRouteMappingMethodKeys(target: unknown): string[] {
    const metadata = (target as { [Symbol.metadata]?: Record<string, unknown> } | undefined)?.[Symbol.metadata] ?? {};
    const prefix = 'route:mapping:';
    return Object.keys(metadata)
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length));
}

/**
 * Registry of type-safe route definitions.
 *
 * Created by scanning `routeMapping` decorator metadata from registered
 * source classes. Provides a nested tree of {@link RouteDefinition} instances
 * for URL generation, navigation, and route matching.
 */
export class RouteRegistry {
    readonly #defs: Map<string, RouteDefinition>;

    constructor() {
        this.#defs = new Map();
    }

    /**
     * Scan source classes for `routeMapping` metadata and populate the registry.
     *
     * @param sources - The source/configuration classes to scan.
     * @param context - The application context for resolving the Router.
     */
    scanSources(sources: Iterable<Function>, context: Registry): void {
        for (const source of sources) {
            this.#scanClass(source, context);
        }
    }

    /**
     * Register a single route definition.
     */
    #addDef(mergedPath: string, dottedKey: string, context: Registry): void {
        const def = new RouteDefinition(mergedPath, context);
        this.#defs.set(dottedKey, def);
    }

    /**
     * Scan a single class for `routeMapping` metadata.
     */
    #scanClass(source: Function, context: Registry): void {
        const classMeta = getRouteMapping(source);
        const classPath = classMeta?.value ?? '/';
        const classKey = deriveKey(classPath, classMeta?.name);

        // If this class has a route mapping but no method-level routes,
        // register it as a leaf (class-level only, e.g. @routeMapping('/login'))
        const methodKeys = getRouteMappingMethodKeys(source);
        if (methodKeys.length === 0 && classMeta) {
            this.#addDef(classPath, classKey, context);
            return;
        }

        // Scan method-level route mappings
        for (const methodKey of methodKeys) {
            const methodMeta = getRouteMapping(source, methodKey);
            if (!methodMeta) continue;

            const methodPath = methodMeta.value;
            const mergedPath = pathMatcher.merge(classPath, methodPath);
            const key = deriveKey(methodPath, methodMeta.name);
            const dottedKey = classKey === 'index' ? key : `${classKey}.${key}`;

            this.#addDef(mergedPath, dottedKey, context);
        }
    }

    /**
     * Access a route definition by dotted path.
     */
    get<T extends string>(path: string): RouteDefinition<T> | undefined {
        return this.#defs.get(path) as RouteDefinition<T> | undefined;
    }

    /**
     * Returns all registered route definition keys.
     */
    keys(): IterableIterator<string> {
        return this.#defs.keys();
    }

    /**
     * Returns the flat definition map entries.
     */
    entries(): IterableIterator<[string, RouteDefinition]> {
        return this.#defs.entries();
    }
}
