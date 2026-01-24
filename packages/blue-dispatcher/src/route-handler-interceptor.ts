/**
 * @author Jeff Rose
 */

import { ModelAndView } from './model-and-view';
import { PathMatcher, AsPathMatcherFilter, Null } from '@blue/core';
import { Route } from '@blue/router';

export interface RouteHandlerInterceptor {
    completeHandle(route: Route, handler, error: Error): void;
    postHandle(route: Route, handler, modelAndView: ModelAndView): void;
    preHandle(route: Route, handler): boolean;
}

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
 * @interface module:router.RouteHandlerInterceptor
 */

/**
 * Callback after completion of route processing, that is, after rendering the view. Will be called on any outcome of handler execution, thus allows for proper resource cleanup.
 * @function module:router.RouteHandlerInterceptor#completeHandle
 */

/**
 * Intercept the execution of a handler. Called after RouteHandlerAdapter actually invoked the handler, but before the Dispatcher renders the view.
 * @function module:router.RouteHandlerInterceptor#postHandle
 */

/**
 * Intercept the execution of a handler. Called after HandlerMapping determined
 * an appropriate handler object, but before RouteHandlerAdapter invokes the handler.
 * @function module:router.RouteHandlerInterceptor#preHandle
 */

/**
 * @class module:dispatcher.MappedHandlerInterceptor
 * @implements module:router.RouteHandlerInterceptor
 */
export class MappedHandlerInterceptor extends AsPathMatcherFilter(Null) implements RouteHandlerInterceptor {
    #interceptor: RouteHandlerInterceptor;

    pathMatcher: PathMatcher;

    get interceptor(): RouteHandlerInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: RouteHandlerInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        super();
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    completeHandle(route: Route, handler, error: Error = null): void {
        this.#interceptor.completeHandle(route, handler, error);
    }

    postHandle(route: Route, handler, modelAndView: ModelAndView): void {
        this.#interceptor.postHandle(route, handler, modelAndView);
    }

    preHandle(route: Route, handler): boolean {
        return this.#interceptor.preHandle(route, handler);
    }
}

/**
 * * Developers Notes
 * ? Should we rename pre-, post-, and complete- handle? before-, after-, complete-?
 */
