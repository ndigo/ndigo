import { Route } from './route';
import { PathMatcher, Null, PathMatcherFilter } from '@blue/core';
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
declare const MappedRouterInterceptor_base: import("@blue/core").Constructable<PathMatcherFilter> & typeof Null;
/**
 * @implements module:router.RouterInterceptor
 */
export declare class MappedRouterInterceptor extends MappedRouterInterceptor_base implements RouterInterceptor, PathMatcherFilter {
    #private;
    pathMatcher: PathMatcher;
    get interceptor(): RouterInterceptor;
    constructor(interceptor: RouterInterceptor, includePatterns: string[], excludePatterns?: string[]);
    postRoute(route: Route): void;
    preRoute(route: Route): boolean;
}
export {};
//# sourceMappingURL=router-interceptor.d.ts.map