/**
 * Ordered interceptor execution for a service call.
 */
import { IllegalStateError } from '@ndigo/core';
import type { Service } from './service.js';
import { likeServiceInterceptor } from './service-types.js';
import type { ServiceInterceptor } from './service-types.js';

/**
 * Builds and advances the interceptor chain for a service call.
 *
 * @example
 * ```ts
 * const chain = new ServiceExecutionChain(service, interceptors);
 * ```
 */
export class ServiceExecutionChain {
    #interceptors: ServiceInterceptor[];

    /** The service this chain executes. */
    service: Service;
    /** Index of the interceptor currently executing. */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'ServiceExecutionChain';
    }

    /** The interceptors in this chain, in execution order. */
    get interceptors(): ServiceInterceptor[] {
        return this.#interceptors;
    }

    /**
     * Creates a chain from a service or an existing chain.
     *
     * @param service - Service or chain to wrap.
     * @param interceptors - Additional interceptors to append.
     */
    constructor(service: Service | ServiceExecutionChain, interceptors: ServiceInterceptor[] | null = null) {
        this.#interceptors = [];

        if (service instanceof ServiceExecutionChain) {
            const chain = service;
            this.service = chain.service;
            if (chain.interceptors) {
                this.addInterceptors(chain.interceptors);
            }
            if (interceptors) {
                this.addInterceptors(interceptors);
            }
        } else {
            this.service = service;
            if (interceptors) {
                this.addInterceptors(interceptors);
            }
        }

        this.interceptorIndex = -1;
    }

    /**
     * Adds a single interceptor to the chain.
     *
     * @param interceptor - Interceptor to append.
     * @throws When the value does not look like a service interceptor.
     */
    addInterceptor(interceptor: ServiceInterceptor): void {
        if (!interceptor) {
            return;
        }

        if (!likeServiceInterceptor(interceptor)) {
            throw new IllegalStateError('Invalid interceptor: expected a service interceptor implementation.');
        }

        if (!this.#interceptors) {
            this.#interceptors = [];
        }
        this.#interceptors.push(interceptor);
    }

    /**
     * Adds multiple interceptors to the chain in order.
     *
     * @param interceptors - Interceptors to append.
     */
    addInterceptors(interceptors: ServiceInterceptor[]): void {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }
}
