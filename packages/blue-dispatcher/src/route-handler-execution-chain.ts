/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';

/**
 */
export default class RouteHandlerExecutionChain {
    #interceptors: RouteHandlerInterceptor[];

    handler: object;
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'HandlerExecutionChain';
    }

    get interceptors(): RouteHandlerInterceptor[] {
        return this.#interceptors;
    }

    constructor(handler: object | RouteHandlerExecutionChain, interceptors: RouteHandlerInterceptor[] = null) {
        this.#interceptors = null;

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
    applyPostHandle(route: Route, mv: ModelAndView): void {
        const interceptors = this.#interceptors,
            length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                interceptors[index].postHandle(route, this.handler, mv);
            }
        }
    }

    /**
         * @param {module:router.Route} route
     */
    applyPreHandle(route: Route): boolean {
        const interceptors = this.#interceptors,
            length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                if (interceptors[index].preHandle(route, this.handler) === false) {
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
    triggerCompleteHandle(route: Route, error: Error = null): void {
        const interceptors = this.#interceptors,
            length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                try {
                    interceptors[index].completeHandle(route, this.handler, error);
                } catch (e) {
                    // Handle this
                }
            }
        }
    }
}
