import { Route } from './route';
import { PathMatcher, AsPathMatcherFilter, Null, PathMatcherFilter } from '@blue/core';

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
}

/**
 * @implements module:router.RouterInterceptor
 */
export class MappedRouterInterceptor extends AsPathMatcherFilter(Null) implements RouterInterceptor, PathMatcherFilter {
    #interceptor: RouterInterceptor;

    pathMatcher: PathMatcher;

    get interceptor(): RouterInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: RouterInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        super();
        this.#interceptor = interceptor;
        // TODO TYPESCRIPT DOESN'T LIKE THIS FOR SOME REASON
        //this.setExcludePatterns( excludePatterns );
        //this.setIncludePatterns( includePatterns );
    }

    postRoute(route: Route): void {
        this.#interceptor.postRoute(route);
    }

    preRoute(route: Route): boolean {
        return this.#interceptor.preRoute(route);
    }
}
