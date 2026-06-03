import { Route } from './route';
import { PathMatcher, AsPathMatcherFilter, Null, PathMatcherFilter, URLGlobPathMatcher } from '@blue/core';

/**
 * A function signature for a router middleware, which can optionally prevent further processing.
 * @param route - The `Route` object being processed.
 * @returns `true` to continue processing, `false` to stop, or `void` to continue by default.
 * @since 1.0.0
 */
export type RouterMiddleware = (route: Route) => boolean | void | Promise<boolean | void>;

/**
 * Defines an interface for intercepting route processing at different stages.
 * Interceptors can perform actions before (`preRoute`) or after (`postRoute`) a route is handled.
 * @since 1.0.0
 */
export interface RouterInterceptor {
    postRoute?(route: Route): void | Promise<void>;
    preRoute?(route: Route): boolean | Promise<boolean>;
}

/**
 */

/**
 * @param {module:router.Route} route
 */

/**
 * @param {module:router.Route} route
 */

/**
 * Defines the interface for a registry that manages `RouterInterceptor` instances.
 * It provides methods to add interceptors and middleware, with support for path-based matching.
 * @since 1.0.0
 */
export interface RouterInterceptorRegistry {
    addInterceptor(interceptor: RouterInterceptor): void;
    use(interceptor: RouterInterceptor | RouterMiddleware): void;
    use(includePattern: string, interceptor: RouterInterceptor | RouterMiddleware): void;
    use(includePatterns: string[], interceptor: RouterInterceptor | RouterMiddleware, excludePatterns?: string[]): void;
}

/**
 * A `RouterInterceptor` that applies a wrapped interceptor only when the route matches specified include and exclude patterns.
 * It extends `AsPathMatcherFilter` to leverage path matching capabilities.
 * @since 1.0.0
 */
export class MappedRouterInterceptor extends AsPathMatcherFilter(Null) implements RouterInterceptor, PathMatcherFilter {
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: RouterInterceptor;

    pathMatcher: PathMatcher;

    /**
     * Gets the underlying `RouterInterceptor` that this mapped interceptor wraps.
     * @returns The wrapped `RouterInterceptor` instance.
     * @since 1.0.0
     */
    get interceptor(): RouterInterceptor {
        return this.#interceptor;
    }

    /**
     * Gets the array of patterns that, if matched, will prevent the interceptor from being applied.
     * @returns An array of exclusion patterns.
     * @since 1.0.0
     */
    get excludePatterns(): string[] {
        return this.#excludePatterns;
    }

    /**
     * Gets the array of patterns that, if matched, will allow the interceptor to be applied.
     * If no include patterns are specified, the interceptor applies to all routes (unless excluded).
     * @returns An array of inclusion patterns.
     * @since 1.0.0
     */
    get includePatterns(): string[] {
        return this.#includePatterns;
    }

    /**
     * Creates an instance of `MappedRouterInterceptor`.
     * @param interceptor - The `RouterInterceptor` to wrap and conditionally apply.
     * @param includePatterns - An array of patterns that define when the interceptor should be active.
     * @param excludePatterns - An optional array of patterns that define when the interceptor should be inactive, overriding include patterns.
     * @since 1.0.0
     */
    constructor(interceptor: RouterInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        super();
        this.#interceptor = interceptor;
        this.#includePatterns = includePatterns ?? [];
        this.#excludePatterns = excludePatterns ?? [];
        this.pathMatcher = new URLGlobPathMatcher();
        this.setIncludePatterns(this.#includePatterns);
        this.setExcludePatterns(this.#excludePatterns);
    }

    /**
     * Determines if the given route matches the configured include and exclude patterns.
     * Exclusion patterns take precedence over inclusion patterns.
     * @param route - The `Route` object to check.
     * @returns `true` if the route matches the patterns and should be intercepted, `false` otherwise.
     * @since 1.0.0
     */
    matchesRoute(route: Route): boolean {
        const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`;

        for (const pattern of this.#excludePatterns) {
            if (this._matchesPattern(route, routePath, pattern)) {
                return false;
            }
        }

        if (!this.#includePatterns.length) {
            return true;
        }

        for (const pattern of this.#includePatterns) {
            if (this._matchesPattern(route, routePath, pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolves route parameters from the given route based on the include patterns.
     * This method attempts to extract parameters if the route matches a named pattern.
     * @param route - The `Route` object from which to resolve parameters.
     * @returns An object containing resolved parameters, or `null` if no parameters are resolved or no matching named pattern is found.
     * @since 1.0.0
     */
    resolveRouteParams(route: Route): Record<string, string> | null {
        for (const pattern of this.#includePatterns) {
            if (this._isNamedRoutePattern(pattern) && typeof (route as any).resolveParams === 'function') {
                const params = (route as any).resolveParams(pattern);
                if (params) {
                    return params;
                }
            }
        }

        return null;
    }

    /**
     * Executes the `postRoute` method of the wrapped interceptor, if it exists.
     * This method is called after a route has been handled.
     * @param route - The `Route` object that was processed.
     * @returns A promise that resolves when the `postRoute` operation is complete.
     * @since 1.0.0
     */
    async postRoute(route: Route): Promise<void> {
        await this.#interceptor.postRoute?.(route);
    }

    /**
     * Executes the `preRoute` method of the wrapped interceptor, if it exists.
     * This method is called before a route is handled and can prevent further processing.
     * @param route - The `Route` object to be processed.
     * @returns A promise that resolves to `true` to continue processing, or `false` to stop.
     * @since 1.0.0
     */
    async preRoute(route: Route): Promise<boolean> {
        return (await this.#interceptor.preRoute?.(route)) !== false;
    }

    /**
     * Checks if a given pattern string contains named route parameters (e.g., `:id` or `{id}`).
     * @param pattern - The pattern string to check.
     * @returns `true` if the pattern contains named parameters, `false` otherwise.
     * @private
     * @since 1.0.0
     */
    private _isNamedRoutePattern(pattern: string): boolean {
        return /(^|\/):[A-Za-z_][A-Za-z0-9_]*|\{[A-Za-z_][A-Za-z0-9_]*\}/.test(pattern);
    }

    /**
     * Checks if a given route matches a single pattern, considering both named route parameters and glob patterns.
     * @param route - The `Route` object to match.
     * @param routePath - The path string of the route.
     * @param pattern - The pattern string to match against.
     * @returns `true` if the route matches the pattern, `false` otherwise.
     * @private
     * @since 1.0.0
     */
    private _matchesPattern(route: Route, routePath: string, pattern: string): boolean {
        if (this._isNamedRoutePattern(pattern) && typeof (route as any).matches === 'function') {
            return (route as any).matches(pattern);
        }

        return this.pathMatcher.match(pattern, routePath);
    }
}
