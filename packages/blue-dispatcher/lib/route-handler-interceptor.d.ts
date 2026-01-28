/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { PathMatcher, Null } from '@blue/core';
import { Route } from '@blue/router';
export interface RouteHandlerInterceptor {
    completeHandle(route: Route, handler: any, error: Error): void;
    postHandle(route: Route, handler: any, modelAndView: ModelAndView): void;
    preHandle(route: Route, handler: any): boolean;
}
declare const MappedHandlerInterceptor_base: import("@blue/core").Constructable<import("@blue/core").PathMatcherFilter> & typeof Null;
/**
 * Workflow interface that allows for customized handler execution chains.
 * Applications can register any number of existing or custom interceptors
 * for certain groups of handlers, to add common preprocessing behavior
 * without needing to modify each handler implementation.
 *
 * A `RouteHandlerInterceptor` gets called before the appropriate `RouteHandlerAdapter`
 * triggers the execution of the handler itself. This mechanism can be used
 * for a large field of preprocessing aspects, e.g. for authorization checks,
 * or common handler behavior like locale or theme changes. Its main purpose
 * is to allow for factoring out repetitive handler code.
 *
 */
/**
 * Callback after completion of route processing, that is, after rendering the view. Will be called on any outcome of handler execution, thus allows for proper resource cleanup.
 */
/**
 * Intercept the execution of a handler. Called after RouteHandlerAdapter actually invoked the handler, but before the Dispatcher renders the view.
 */
/**
 * Intercept the execution of a handler. Called after HandlerMapping determined
 * an appropriate handler object, but before RouteHandlerAdapter invokes the handler.
 */
/**
 * @implements module:router.RouteHandlerInterceptor
 */
export declare class MappedHandlerInterceptor extends MappedHandlerInterceptor_base implements RouteHandlerInterceptor {
    #private;
    pathMatcher: PathMatcher;
    get interceptor(): RouteHandlerInterceptor;
    constructor(interceptor: RouteHandlerInterceptor, includePatterns: string[], excludePatterns?: string[]);
    completeHandle(route: Route, handler: any, error?: Error): void;
    postHandle(route: Route, handler: any, modelAndView: ModelAndView): void;
    preHandle(route: Route, handler: any): boolean;
}
export {};
/**
 * * Developers Notes
 * ? Should we rename pre-, post-, and complete- handle? before-, after-, complete-?
 */
//# sourceMappingURL=route-handler-interceptor.d.ts.map