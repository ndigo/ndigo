/**
 * @author Jeff Rose
 */
import { createNull, MediaType } from '@blue/core';
import { AsyncDestroyable } from '@blue/factory';
import {
    HTTPInit,
    HTTPInterceptor,
    ContentTypeInit,
    DataParameterInit,
    ResponseTypeInit,
    IfModifiedInit,
    TimeoutInit,
    DataParameterInterceptor,
    ContentTypeInterceptor,
    ResponseTypeInterceptor,
    TimeoutInterceptor,
    IfModifiedInterceptor,
} from '@blue/http';

export type ServiceInit = HTTPInit &
    ContentTypeInit &
    DataParameterInit &
    ResponseTypeInit &
    IfModifiedInit &
    TimeoutInit & {};

export interface CompletionAwareServiceInterceptor {
    postRequest(request: Request): void;
}

export interface ErrorAwareServiceInterceptor {
    postFailure(error: Error, request: Request): void;
}

export interface InitializationAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    preInit(url: URL, settings: T): boolean;
}

export interface RequestAwareServiceInterceptor {
    preRequest(request: Request): Promise<Request | void>;
}

export interface ResponseAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    postSuccess(response: Response, settings: T): Promise<void>;
}

type ServiceInterceptor =
    | CompletionAwareServiceInterceptor
    | ErrorAwareServiceInterceptor
    | InitializationAwareServiceInterceptor
    | RequestAwareServiceInterceptor
    | ResponseAwareServiceInterceptor;

/**
 */

/**
 * @param {Request} request
 */

/**
 */

/**
 * @param {Error} error
 * @param {Request} request
 */

/**
 */

/**
 * @param {URL} url
 * @param {module:service.ServiceInit} settings
 * @returns {boolean}
 */

/**
 */

/**
 * @param {Request} request
 * @returns {Promise<external:Request|void>}
 */

/**
 */

/**
 * @param {module:http.HTTPResult} result
 * @param {module:service.ServiceInit} settings
 * @returns {Promise<void>}
 */

/**
 * @typedef {module:service.CompletionAwareServiceInterceptor|module:service.ErrorAwareServiceInterceptor|module:service.InitializationAwareServiceInterceptor|module:service.RequestAwareServiceInterceptor|module:service.ResultAwareServiceInterceptor} module:service.ServiceInterceptor
 */

const { defineProperty } = Reflect,
    defaults = {},
    httpInterceptors: HTTPInterceptor[] = [
        new ContentTypeInterceptor(),
        new DataParameterInterceptor(),
        new ResponseTypeInterceptor(),
        new IfModifiedInterceptor(),
        new TimeoutInterceptor(5000),
    ];

let serviceId = 0;

/**
 * @returns {number} The next service id
 */
function nextServiceId(): number {
    return ++serviceId;
}

export class MappedServiceInterceptor {
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: ServiceInterceptor;

    get interceptor(): ServiceInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: ServiceInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    matches(path: string, matcher?): boolean {
        return true;
    }

    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

/**
 */
class ServiceExecutionChain {
    #interceptors: ServiceInterceptor[];

    service: Service;
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'ServiceExecutionChain';
    }

    get interceptors(): ServiceInterceptor[] {
        return this.#interceptors;
    }

    constructor(service: Service | ServiceExecutionChain, interceptors: ServiceInterceptor[] = null) {
        this.#interceptors = null;

        if (service instanceof ServiceExecutionChain) {
            const chain = service;
            this.service = chain.service;
            interceptors && this.addInterceptors(chain.interceptors);
        } else {
            this.service = service;
            interceptors && this.addInterceptors(interceptors);
        }

        this.interceptorIndex = -1;
    }

    /**
         * @param {module:service.ServiceInterceptor} interceptor
     */
    addInterceptor(interceptor: ServiceInterceptor): void {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this.#interceptors.push(interceptor);
        }
    }

    /**
         * @param {Array<module:service.ServiceInterceptor>} interceptors
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

class Service implements AsyncDestroyable {
    #interceptors;
    #serviceCalls;

    id: number;
    name: string;
    destroyed: boolean;

    get [Symbol.toStringTag](): string {
        return `Service:${this.name}`;
    }

    set serviceCalls(newServiceCalls) {}

    constructor(name: string, init: ServiceInit) {
        this.#serviceCalls = createNull();

        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'id', {
            value: nextServiceId(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    destroy(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    addServiceCall(name, settings) {
        this.#serviceCalls[name] = createNull();
        this[name] = (data, init) => {
            /*const
                settings = Object.assign( {}, defaults, init ),
                chain = this._getServiceExecutionChain( this, input ),
                url = new URL( input );
*/
        };
    }

    protected _getServiceExecutionChain(service: Service | ServiceExecutionChain, url: string): ServiceExecutionChain {
        const chain = service instanceof ServiceExecutionChain ? service : new ServiceExecutionChain(service),
            interceptors = this.#interceptors,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedServiceInterceptor) {
                    if (interceptor.matches(url)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                } else {
                    chain.addInterceptor(interceptor);
                }
            }
        }

        return chain;
    }
}
