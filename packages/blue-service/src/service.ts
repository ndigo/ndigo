/**
 * @author Jeff Rose
 */
import { FrameworkError, IllegalStateError, createNull } from '@blue/core';
import { AsyncDestroyable } from '@blue/factory';
import {
    HTTPInit,
    ContentTypeInit,
    DataParameterInit,
    ResponseTypeInit,
    IfModifiedInit,
    TimeoutInit,
} from '@blue/http';
import { like } from '@blue/util';

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

export type ServiceInterceptor =
    | CompletionAwareServiceInterceptor
    | ErrorAwareServiceInterceptor
    | InitializationAwareServiceInterceptor
    | RequestAwareServiceInterceptor
    | ResponseAwareServiceInterceptor;

export const likeCompletionAwareServiceInterceptor = like({
    postRequest: Function,
}) as (value: unknown) => value is CompletionAwareServiceInterceptor;

export const likeErrorAwareServiceInterceptor = like({
    postFailure: Function,
}) as (value: unknown) => value is ErrorAwareServiceInterceptor;

export const likeInitializationAwareServiceInterceptor = like({
    preInit: Function,
}) as (value: unknown) => value is InitializationAwareServiceInterceptor;

export const likeRequestAwareServiceInterceptor = like({
    preRequest: Function,
}) as (value: unknown) => value is RequestAwareServiceInterceptor;

export const likeResponseAwareServiceInterceptor = like({
    postSuccess: Function,
}) as (value: unknown) => value is ResponseAwareServiceInterceptor;

export const likeServiceInterceptor = (value: unknown): value is ServiceInterceptor => {
    return (
        likeCompletionAwareServiceInterceptor(value) ||
        likeErrorAwareServiceInterceptor(value) ||
        likeInitializationAwareServiceInterceptor(value) ||
        likeRequestAwareServiceInterceptor(value) ||
        likeResponseAwareServiceInterceptor(value)
    );
};

const { defineProperty } = Reflect;

let serviceId = 0;

/**
 * @returns {number} The next service id
 */
function nextServiceId(): number {
    return ++serviceId;
}

function globToRegExp(globPattern: string): RegExp {
    const escapedPattern = globPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const placeholder = '__DOUBLE_STAR__';
    const regexPattern = escapedPattern
        .replace(/\*\*/g, placeholder)
        .replace(/\*/g, '[^/]*')
        .replace(new RegExp(placeholder, 'g'), '.*');

    return new RegExp(`^${regexPattern}$`);
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

    matches(path: string, matcher: (path: string, pattern: string) => boolean = null): boolean {
        const patternMatcher = matcher || ((value, pattern) => globToRegExp(pattern).test(value));
        const includePatterns = this.#includePatterns || [];
        const excludePatterns = this.#excludePatterns || [];

        const isIncluded = includePatterns.length
            ? includePatterns.some((pattern) => patternMatcher(path, pattern))
            : true;
        const isExcluded = excludePatterns.some((pattern) => patternMatcher(path, pattern));

        return isIncluded && !isExcluded;
    }

    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

export class ServiceExecutionChain {
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
            chain.interceptors && this.addInterceptors(chain.interceptors);
            interceptors && this.addInterceptors(interceptors);
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
        throw new FrameworkError('Method not implemented.');
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
