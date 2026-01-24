/**
 * @author Jeff Rose
 */

import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';

/**
 * @class module:router.RouterExecutionChain
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

    constructor(chain: RouterExecutionChain | RouterInterceptor[] = null) {
        this.#interceptors = null;

        if (chain instanceof RouterExecutionChain) {
            chain && this.addInterceptors(chain.interceptors);
        } else {
            chain && this.addInterceptors(chain);
        }

        this.interceptorIndex = -1;
    }

    /**
     * @function module:router.RouterExecutionChain#addInterceptor
     * @param {module:router.RouterInterceptor} interceptor
     */
    addInterceptor(interceptor: RouterInterceptor): void {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * @function module:router.RouterExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouterInterceptor>} interceptors
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
     * @function module:router.RouterExecutionChain#applyPostRoute
     * @param {module:router.Route} route
     */
    applyPostRoute(route: Route): void {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                interceptors[index].postRoute(route);
            }
        }
    }

    /**
     * @function module:router.RouterExecutionChain#applyPreRoute
     * @param {module:router.Route} route
     */
    applyPreRoute(route: Route): boolean {
        const interceptors = this.#interceptors,
            length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                if (interceptors[index].preRoute(route) === false) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
}
