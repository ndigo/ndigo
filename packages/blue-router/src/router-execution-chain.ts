/**
 * @author Jeff Rose
 */

import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';

export default class RouterExecutionChain {
    #interceptors: RouterInterceptor[];

    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'RouterExecutionChain';
    }

    get interceptors(): RouterInterceptor[] {
        return this.#interceptors;
    }

    constructor(chain: RouterExecutionChain | RouterInterceptor[] | null = null) {
        this.#interceptors = [];

        if (chain instanceof RouterExecutionChain) {
            chain && this.addInterceptors(chain.interceptors);
        } else {
            chain && this.addInterceptors(chain);
        }

        this.interceptorIndex = -1;
    }

    /**
     * @param {module:router.RouterInterceptor} interceptor
     */
    addInterceptor(interceptor: RouterInterceptor): void {
        if (interceptor) {
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * @param {Array<module:router.RouterInterceptor>} interceptors
     */
    addInterceptors(interceptors: RouterInterceptor[]): void {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }

    /**
     * @param {module:router.Route} route
     */
    async applyPostHandle(route: Route): Promise<void> {
        const interceptors = this.#interceptors;
        const length = interceptors.length;
        if (length) {
            // If interceptorIndex wasn't set by applyPreHandle, process all interceptors
            if (this.interceptorIndex < 0) {
                this.interceptorIndex = length - 1;
            }
            for (let index = this.interceptorIndex; index >= 0; index--) {
                await interceptors[index].postHandle?.(route);
            }
        }
    }

    /**
     * @param {module:router.Route} route
     */
    async applyAfterCompletion(route: Route): Promise<void> {
        const interceptors = this.#interceptors;
        const length = interceptors.length;
        if (length) {
            // If interceptorIndex wasn't set by applyPreHandle, process all interceptors
            if (this.interceptorIndex < 0) {
                this.interceptorIndex = length - 1;
            }
            for (let index = this.interceptorIndex; index >= 0; index--) {
                await interceptors[index].afterCompletion?.(route);
            }
        }
    }

    /**
     * @param {module:router.Route} route
     */
    async applyPreHandle(route: Route): Promise<boolean> {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                if ((await interceptors[index].preHandle?.(route)) === false) {
                    this.interceptorIndex = index - 1;
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
}
