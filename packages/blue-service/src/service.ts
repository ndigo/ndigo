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

/**
 * Initializes a service call with HTTP, content, caching, and timeout options.
 */
export type ServiceInit = HTTPInit &
    ContentTypeInit &
    DataParameterInit &
    ResponseTypeInit &
    IfModifiedInit &
    TimeoutInit & {};

/**
 * Handles completion callbacks after a service request succeeds.
 */
export interface CompletionAwareServiceInterceptor {
    /**
     * Runs after the request has completed successfully.
     *
     * @param request - The request that just completed.
     */
    postRequest(request: Request): void;
}

/**
 * Handles failure callbacks when a service request throws.
 */
export interface ErrorAwareServiceInterceptor {
    /**
     * Runs after a request fails.
     *
     * @param error - The error that was raised.
     * @param request - The request associated with the failure.
     */
    postFailure(error: Error, request: Request): void;
}

/**
 * Handles pre-initialization checks before a service request is created.
 */
export interface InitializationAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    /**
     * Decides whether the interceptor should participate in the request.
     *
     * @param url - The request URL being initialized.
     * @param settings - The resolved service settings.
     * @returns `true` when the interceptor should run.
     */
    preInit(url: URL, settings: T): boolean;
}

/**
 * Handles request mutation before a service request is sent.
 */
export interface RequestAwareServiceInterceptor {
    /**
     * Runs before the request is sent.
     *
     * @param request - The request to inspect or replace.
     * @returns A replacement request, or void to keep the original.
     */
    preRequest(request: Request): Promise<Request | void>;
}

/**
 * Handles response processing after a service request succeeds.
 */
export interface ResponseAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    /**
     * Runs after the request succeeds.
     *
     * @param response - The response returned by the service.
     * @param settings - The resolved service settings.
     * @returns A promise that resolves when post-processing completes.
     */
    postSuccess(response: Response, settings: T): Promise<void>;
}

/**
 * Union of all supported service interceptor shapes.
 */
export type ServiceInterceptor =
    | CompletionAwareServiceInterceptor
    | ErrorAwareServiceInterceptor
    | InitializationAwareServiceInterceptor
    | RequestAwareServiceInterceptor
    | ResponseAwareServiceInterceptor;

/**
 * Tests whether a value provides completion-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements completion handling.
 */
export const likeCompletionAwareServiceInterceptor = like({
    postRequest: Function,
}) as (value: unknown) => value is CompletionAwareServiceInterceptor;

/**
 * Tests whether a value provides failure-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements failure handling.
 */
export const likeErrorAwareServiceInterceptor = like({
    postFailure: Function,
}) as (value: unknown) => value is ErrorAwareServiceInterceptor;

/**
 * Tests whether a value provides initialization-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements initialization handling.
 */
export const likeInitializationAwareServiceInterceptor = like({
    preInit: Function,
}) as (value: unknown) => value is InitializationAwareServiceInterceptor;

/**
 * Tests whether a value provides request-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements request handling.
 */
export const likeRequestAwareServiceInterceptor = like({
    preRequest: Function,
}) as (value: unknown) => value is RequestAwareServiceInterceptor;

/**
 * Tests whether a value provides response-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements response handling.
 */
export const likeResponseAwareServiceInterceptor = like({
    postSuccess: Function,
}) as (value: unknown) => value is ResponseAwareServiceInterceptor;

/**
 * Tests whether a value behaves like any supported service interceptor.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value matches one interceptor shape.
 */
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

/**
 * Wraps an interceptor so it only applies to matching request paths.
 */
export class MappedServiceInterceptor {
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: ServiceInterceptor;

    get interceptor(): ServiceInterceptor {
        return this.#interceptor;
    }

    /**
     * Creates a path-mapped interceptor.
     *
     * @param interceptor - Interceptor to wrap.
     * @param includePatterns - Glob patterns that opt the interceptor in.
     * @param excludePatterns - Glob patterns that opt the interceptor out.
     */
    constructor(interceptor: ServiceInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    /**
     * Checks whether a path matches the configured include and exclude patterns.
     *
     * @param path - Request path to evaluate.
     * @param matcher - Optional pattern matcher used for comparisons.
     * @returns `true` when the path should use the wrapped interceptor.
     */
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

    /**
     * Replaces the exclude pattern list.
     *
     * @param excludePatterns - Glob patterns to skip.
     */
    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    /**
     * Replaces the include pattern list.
     *
     * @param includePatterns - Glob patterns to accept.
     */
    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

/**
 * Builds and advances the interceptor chain for a service call.
 */
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

    /**
     * Creates a chain from a service or an existing chain.
     *
     * @param service - Service or chain to wrap.
     * @param interceptors - Additional interceptors to append.
     */
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
     * Adds a single interceptor to the chain.
     *
     * @param interceptor - Interceptor to append.
     * @throws {IllegalStateError} When the value does not look like a service interceptor.
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
