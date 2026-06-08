/**
 * @author Jeff Rose
 */

import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';

/**
 * @implements module:core.Serializable
 */
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
    async applyPostRoute(route: Route): Promise<void> {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                await interceptors[index].postRoute?.(route);
            }
        }
    }

    /**
     * @param {module:router.Route} route
     */
    async applyPreRoute(route: Route): Promise<boolean> {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                if ((await interceptors[index].preRoute?.(route)) === false) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
}
