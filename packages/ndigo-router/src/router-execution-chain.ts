/**
 * Interceptor execution chain for route navigation.
 */
import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';

/**
 * Runs a router's interceptors around one navigation: tracks the current
 * interceptor index so a pre-handle outcome can short-circuit, and drives the
 * post/complete hooks for whichever navigation actually ran.
 */
export default class RouterExecutionChain {
    #interceptors: RouterInterceptor[];

    /** Index of the last interceptor whose `preHandle` ran. */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'RouterExecutionChain';
    }

    /** The chain's interceptors, in registration order. */
    get interceptors(): RouterInterceptor[] {
        return this.#interceptors;
    }

    constructor(chain: RouterExecutionChain | RouterInterceptor[] | null = null) {
        this.#interceptors = [];

        if (chain instanceof RouterExecutionChain) {
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: copy interceptors only when present
            chain && this.addInterceptors(chain.interceptors);
        } else {
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: copy interceptors only when present
            chain && this.addInterceptors(chain);
        }

        this.interceptorIndex = -1;
    }

    /**
     * Adds one interceptor.
     *
     * @param interceptor - The interceptor to add.
     */
    addInterceptor(interceptor: RouterInterceptor): void {
        if (interceptor) {
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * Adds several interceptors.
     *
     * @param interceptors - The interceptors to add.
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
     * Runs `postHandle` in reverse registration order.
     *
     * @param route - The route to process.
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
                // eslint-disable-next-line no-await-in-loop -- ordering-sensitive: postHandle must unwind in reverse registration order
                await interceptors[index].postHandle?.(route);
            }
        }
    }

    /**
     * Runs `afterCompletion` in reverse registration order.
     *
     * @param route - The route to process.
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
                // eslint-disable-next-line no-await-in-loop -- ordering-sensitive: afterCompletion must unwind in reverse registration order
                await interceptors[index].afterCompletion?.(route);
            }
        }
    }

    /**
     * Runs `preHandle` in registration order until one rejects.
     *
     * @param route - The route to process.
     * @returns Whether navigation may proceed.
     */
    async applyPreHandle(route: Route): Promise<boolean> {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                // eslint-disable-next-line no-await-in-loop -- sequential dispatch: preHandle short-circuits on false and tracks interceptorIndex
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
