/**
 * Route-handler interceptor contracts.
 */

import { ModelAndView } from './model-and-view';
import { PathMatcher, AsPathMatcherFilter, Null } from '@ndigo/core';
import { Route } from '@ndigo/router';
import type { InterceptorDenial } from './route-handler-denial';

/**
 * The outcome of a `preHandle` invocation: `true` allows the request,
 * `false` is the default denial, and an explicit {@link InterceptorDenial}
 * carries the finalized status/body/redirect for the platform adapter.
 */
export type PreHandleOutcome = boolean | InterceptorDenial;

/**
 * Around-handler hooks, run in chain order: `preHandle` before the handler
 * (its outcome may short-circuit the chain), `postHandle` after a successful
 * return, and `completeHandle` once the request is done — including the error
 * path. Every hook may be async; the chain awaits each in turn.
 */
export interface RouteHandlerInterceptor {
    /**
     * Callback after the request completes, including the error path.
     *
     * @param route - The completed route.
     * @param handler - The handler instance, when known.
     * @param error - The error raised during handling, if any.
     */
    completeHandle(route: Route, handler: object | undefined, error: Error): void | Promise<void>;
    /**
     * Callback after the handler returns successfully but before the view renders.
     *
     * @param route - The resolved route.
     * @param handler - The handler instance, when known.
     * @param modelAndView - The handler's result.
     */
    postHandle(route: Route, handler: object | undefined, modelAndView: ModelAndView): void | Promise<void>;
    /**
     * Callback after the handler is resolved but before it is invoked.
     *
     * @param route - The resolved route.
     * @param handler - The handler instance, when known.
     * @returns `true` to continue, or a denial outcome.
     */
    preHandle(route: Route, handler: object | undefined): PreHandleOutcome | Promise<PreHandleOutcome>;
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
 */
export class MappedHandlerInterceptor extends AsPathMatcherFilter(Null) implements RouteHandlerInterceptor {
    #interceptor: RouteHandlerInterceptor;

    /** The matcher used to filter requests by path. */
    pathMatcher!: PathMatcher;

    /** The wrapped interceptor. */
    get interceptor(): RouteHandlerInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: RouteHandlerInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        super();
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns ?? []);
        this.setIncludePatterns(includePatterns);
    }

    /**
     * Delegates the completion callback to the wrapped interceptor.
     *
     * @param route - The completed route.
     * @param handler - The handler instance, when known.
     * @param error - The error raised during handling, if any.
     * @returns A promise that resolves when the wrapped callback completes.
     */
    async completeHandle(route: Route, handler: object | undefined, error: Error | null = null): Promise<void> {
        await this.#interceptor.completeHandle(route, handler, error as Error);
    }

    /**
     * Delegates the post-handle callback to the wrapped interceptor.
     *
     * @param route - The resolved route.
     * @param handler - The handler instance, when known.
     * @param modelAndView - The handler's result.
     * @returns A promise that resolves when the wrapped callback completes.
     */
    async postHandle(route: Route, handler: object | undefined, modelAndView: ModelAndView): Promise<void> {
        await this.#interceptor.postHandle(route, handler, modelAndView);
    }

    /**
     * Delegates the pre-handle callback to the wrapped interceptor.
     *
     * @param route - The resolved route.
     * @param handler - The handler instance, when known.
     * @returns The wrapped interceptor's outcome.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<PreHandleOutcome> {
        // Include/exclude filtering happens when the execution chain is built
        // (`AbstractHandlerMapping._getHandlerExecutionChain` calls `matches`
        // with the mapping's path matcher and unwraps this decorator), so the
        // decorator itself always delegates. A guard here was dead — and wrong:
        // `route.path` was matched against itself as a glob.
        return await this.#interceptor.preHandle(route, handler);
    }
}
