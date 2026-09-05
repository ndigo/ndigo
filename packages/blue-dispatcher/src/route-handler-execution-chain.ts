/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { resolvePreHandleOutcome } from './route-handler-denial';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';

/**
 * Executes a handler through a chain of route interceptors.
 */
export default class RouteHandlerExecutionChain {
    /**
     * Interceptors to invoke around handler execution.
     */
    #interceptors!: RouteHandlerInterceptor[];

    /**
     * The resolved handler instance.
     */
    handler: object | undefined;

    /**
     * Index of the last interceptor that completed pre-handle processing.
     */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'HandlerExecutionChain';
    }

    /**
     * Return the configured interceptors in execution order.
     *
     * @returns The interceptor list, or `null` when none were configured.
     */
    get interceptors(): RouteHandlerInterceptor[] {
        return this.#interceptors;
    }

    /**
     * Create a new execution chain for a handler or copy an existing chain.
     *
     * @param handler - A handler instance or an existing execution chain.
     * @param interceptors - Optional interceptors to append to the chain.
     */
    constructor(handler: object | RouteHandlerExecutionChain, interceptors: RouteHandlerInterceptor[] = []) {
        this.#interceptors = [];

        if (handler instanceof RouteHandlerExecutionChain) {
            const chain = handler;
            this.handler = chain.handler;
            interceptors && this.addInterceptors(chain.interceptors);
        } else {
            this.handler = handler;
            interceptors && this.addInterceptors(interceptors);
        }

        this.interceptorIndex = -1;
    }

    /**
     * @param {module:router.RouteHandlerInterceptor} interceptor
     */
    /**
     * Add a single interceptor to the chain.
     *
     * @param interceptor - The interceptor to add.
     */
    addInterceptor(interceptor: RouteHandlerInterceptor): void {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * @param {Array<module:router.RouteHandlerInterceptor>} interceptors
     */
    /**
     * Add multiple interceptors to the chain.
     *
     * @param interceptors - The interceptors to add.
     */
    addInterceptors(interceptors: RouteHandlerInterceptor[]): void {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }

    /**
     * @param {module:router.Route} route
     * @param {module:dispatcher.ModelAndView} mv
     */
    /**
     * Run post-handle callbacks in registration order.
     *
     * @param route - The current route.
     * @param mv - The model and view produced by the handler.
     */
    async applyPostHandle(route: Route, mv: ModelAndView): Promise<void> {
        const interceptors = this.#interceptors,
            length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                await interceptors[index].postHandle(route, this.handler, mv);
            }
        }
    }

    /**
     * Run pre-handle callbacks until one denies. Denial outcomes (bare
     * `false` or an explicit {@link InterceptorDenial}) are recorded on the
     * route via `resolvePreHandleOutcome`.
     *
     * @param route - The current route.
     * @returns `true` when all interceptors allow processing to continue.
     */
    async applyPreHandle(route: Route): Promise<boolean> {
        const interceptors = this.#interceptors,
            length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                const outcome = await interceptors[index].preHandle(route, this.handler);
                if (!resolvePreHandleOutcome(route, outcome)) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }

    /**
     * @param {module:router.Route} route
     * @param {Error} error
     */
    /**
     * Run completion callbacks in reverse order.
     *
     * @param route - The current route.
     * @param error - The error that terminated execution, if any.
     */
    async triggerCompleteHandle(route: Route, error: Error | null = null): Promise<void> {
        const interceptors = this.#interceptors;
        let index = this.interceptorIndex;
        if (interceptors && index >= 0) {
            for (; index >= 0; index--) {
                await interceptors[index].completeHandle(route, this.handler, error as Error);
            }
        }
    }
}