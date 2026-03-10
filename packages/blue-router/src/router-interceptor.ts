import { Route } from './route';
import { PathMatcher, AsPathMatcherFilter, Null, PathMatcherFilter, GlobPathMatcher } from '@blue/core';

export type RouterMiddleware = (route: Route) => boolean | void;

export interface RouterInterceptor {
    postRoute?(route: Route): void;
    preRoute?(route: Route): boolean;
}

/**
 */

/**
 * @param {module:router.Route} route
 */

/**
 * @param {module:router.Route} route
 */

export interface RouterInterceptorRegistry {
    addInterceptor(interceptor: RouterInterceptor): void;
    use(interceptor: RouterInterceptor | RouterMiddleware): void;
    use(includePattern: string, interceptor: RouterInterceptor | RouterMiddleware): void;
    use(includePatterns: string[], interceptor: RouterInterceptor | RouterMiddleware, excludePatterns?: string[]): void;
}

/**
 * @implements module:router.RouterInterceptor
 */
export class MappedRouterInterceptor extends AsPathMatcherFilter(Null) implements RouterInterceptor, PathMatcherFilter {
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: RouterInterceptor;

    pathMatcher: PathMatcher;

    get interceptor(): RouterInterceptor {
        return this.#interceptor;
    }

    get excludePatterns(): string[] {
        return this.#excludePatterns;
    }

    get includePatterns(): string[] {
        return this.#includePatterns;
    }

    constructor(interceptor: RouterInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        super();
        this.#interceptor = interceptor;
        this.#includePatterns = includePatterns ?? [];
        this.#excludePatterns = excludePatterns ?? [];
        this.pathMatcher = new GlobPathMatcher();
        this.setIncludePatterns(this.#includePatterns);
        this.setExcludePatterns(this.#excludePatterns);
    }

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

    postRoute(route: Route): void {
        this.#interceptor.postRoute?.(route);
    }

    preRoute(route: Route): boolean {
        return this.#interceptor.preRoute?.(route) !== false;
    }

    private _isNamedRoutePattern(pattern: string): boolean {
        return /(^|\/):[A-Za-z_][A-Za-z0-9_]*|\{[A-Za-z_][A-Za-z0-9_]*\}/.test(pattern);
    }

    private _matchesPattern(route: Route, routePath: string, pattern: string): boolean {
        if (this._isNamedRoutePattern(pattern) && typeof (route as any).matches === 'function') {
            return (route as any).matches(pattern);
        }

        return this.pathMatcher.match(pattern, routePath);
    }
}
