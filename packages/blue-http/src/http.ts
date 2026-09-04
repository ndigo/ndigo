/**
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix

import { PatternMatcher, WildcardExp } from '@blue/core';
import { Aware } from '@blue/factory';
import ResponseError from './response-error';
import { TransformInterceptor } from './interceptors/transform-interceptor';
import type { Transform } from './transformers/http-transformer';
import { is, like } from '@blue/util/types';
import { likeResponse } from './like-response';

/**
 * Represents a valid HTTP method.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'QUERY' | 'TRACE';
/**
 * Base request settings shared by HTTP client methods and interceptor hooks.
 *
 * This extends `RequestInit` with BlueJS-specific options such as `baseURL`
 * and query parameter merging.
 */
export type HTTPInit = RequestInit & {
    method?: HTTPMethod;
    baseURL?: string; // ← ADDED
    headers?: HeadersInit;
    params?: URLSearchParams | string[][] | Record<string, string> | string;
};

/**
 * Configuration options for creating an HTTP client instance via {@link HTTP.create}.
 *
 * This extends {@link HTTPInit} with factory-specific options that are only
 * relevant when constructing a client through the convenience API.
 */
export interface HTTPConfig extends HTTPInit {
    /**
     * Optional HTTP interceptors to apply to all requests.
     */
    interceptors?: HTTPInterceptor[];

    /**
     * Optional request body transforms applied in interceptor pipeline.
     */
    requestTransforms?: Transform[];

    /**
     * Optional response body transforms applied in interceptor pipeline.
     */
    responseTransforms?: Transform[];

    /**
     * Optional custom fetch implementation.
     * Defaults to globalThis.fetch if not provided.
     */
    fetch?: Fetch;
}

/**
 * Fetch implementation signature used by {@link HTTP}.
 */
export type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Runs after a request finishes, whether it succeeded or failed.
 */
export interface CompletionAwareHTTPInterceptor {
    /**
     * Observes the final request/response pair after all other hooks complete.
     *
     * @param request - The original request.
     * @param response - The final response or error wrapper.
     */
    postComplete(request: Request, response: Response | ResponseError): void;
}

/**
 * Handles failures that occur while executing a request.
 */
export interface ErrorAwareHTTPInterceptor {
    /**
     * Recovers from a transport or interceptor error.
     *
     * @param error - The failure that interrupted request execution.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @returns A replacement response, or `undefined` to keep the failure.
     */
    postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>;
}

/**
 * Allows a request to be rejected before it is initialized.
 */
export interface InitializationAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    /**
     * Decides whether the request should continue after URL and settings resolution.
     *
     * @param url - The resolved request URL.
     * @param settings - The request settings being prepared.
     * @returns `false` to stop the request before it is created.
     */
    preInit(url: URL, settings: T): boolean;
}

/**
 * Allows a request object to be replaced before fetch executes.
 */
export interface RequestAwareHTTPInterceptor {
    /**
     * Transforms the request before it is passed to fetch.
     *
     * @param request - The request to inspect or replace.
     * @param http - The HTTP client executing the request.
     * @returns A replacement request, a cached response, or `void` to keep the original.
     */
    preRequest(request: Request, http: HTTP): Promise<Request | Response | void>;
}

/**
 * Allows a response to be replaced after fetch completes.
 */
export interface ResponseAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    /**
     * Transforms the response after fetch succeeds and before completion hooks run.
     *
     * @param response - The response returned by fetch.
     * @param settings - The request settings used for the call.
     * @returns A replacement response, or `void` to keep the original.
     */
    postResponse(response: Response, settings: T): Promise<Response | void>;
}

/**
 * Supported HTTP interceptors recognized by {@link HTTP}.
 */
export type HTTPInterceptor =
    | CompletionAwareHTTPInterceptor
    | ErrorAwareHTTPInterceptor
    | InitializationAwareHTTPInterceptor
    | RequestAwareHTTPInterceptor
    | ResponseAwareHTTPInterceptor;

/**
 * Describes objects that can receive an {@link HTTP} instance.
 */
export interface HTTPAware extends Aware {
    /**
     * Injects the HTTP client used by the receiver.
     *
     * @param http - The HTTP client to store.
     */
    setHTTP(http: HTTP): void;
}

/**
 * HTTP request Methods
 * @typedef {string} module:http.HTTPMethod
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */

/**
 * @typedef {RequestInit} module:http.HTTPInit
 * @property {module:http.HTTPMethod} [method] The HTTP request method
 */

/**
 * Interface that allows for the execution of custom behavior after an HTTP request is completed. It executes whether the request was successful or not.
 * @example
 * class LogInterceptor implements CompletionAwareHTTPInterceptor {
 *  postComplete( request, response ){
 *      console.log( \`Completed request \${ request.url }\` );
 *  }
 * }
 *
 * const http = new HTTP( [ new LogInterceptor() ] );
 *
 * await const response = http.request( 'https://www.chase.com/' );
 * //=> "Completed request https://www.chase.com/"
 */

/**
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response
 */

/**
 * Interface that allows for the execution of custom behavior after an HTTP request fails. If \`postError\` returns a \`Response\`, it will be the return value of the request.
 * @example
 * class RetryInterceptor implements ErrorAwareHTTPInterceptor {
 *  postError( error, request, http ){
 *      return http.request( request.url );
 *  }
 * }
 *
 * const http = new HTTP( [ new RetryInterceptor() ] );
 *
 * await const response = http.request( 'https://www.chase123.com/' );
 */

/**
 * @param {Error} error
 * @param {Request} request
 * @param {module:http.HTTP} http
 * @returns {Promise<external:Response | external:undefined>} An optional response
 */

/**
 * Interface that allows for the execution of custom behavior before an HTTP request is initialized.
 */

/**
 * @param {URL} url
 * @param {module:http.HTTPInit} settings
 * @returns {boolean}
 */

/**
 * Interface that allows for the execution of custom behavior before an HTTP request is executed.
 */

/**
 * @param {Request} request
 * @param {module:http.HTTP} http
 * @returns {Promise<external:Request|void>}
 */

/**
 * Interface that allows for the execution of custom behavior after a response is successfully returned.
 */

/**
 * @param {Response} response
 * @param {module:http.HTTPInit} settings
 * @returns {Promise<void>}
 */

/**
 * Interfaces that allow for customized HTTP execution chains. Any number of inteceptors can be registered to inject behavior at various points in the HTTP request lifecycle.
 * The full set of lifecycle methods and their standard order is:
 * 1. \`preInit\`
 * 2. \`preRequest\`
 * 3. \`postResponse\` or \`postError\`
 * 5. \`postComplete\`
 * @typedef {module:http.CompletionAwareHTTPInterceptor|module:http.ErrorAwareHTTPInterceptor|module:http.InitializationAwareHTTPInterceptor|module:http.RequestAwareHTTPInterceptor|external:ResponseAwareHTTPInterceptor} module:http.HTTPInterceptor
 * @see {@link CompletionAwareHTTPInterceptor}
 * @see {@link ErrorAwareHTTPInterceptor}
 * @see {@link InitializationAwareHTTPInterceptor}
 * @see {@link RequestAwareHTTPInterceptor}
 * @see {@link ResponseAwareHTTPInterceptor}
 */

/**
 * @extends module:factory.Aware
 */

/**
 * @param {module:http.HTTP} http
 */

/**
 * Shared \`Object\` helpers used to clone and freeze request settings.
 */
/**
 * Clones request settings and locks them before fetch executes.
 */
export const { assign, freeze } = Object,
    { defineProperty } = Reflect,
    defaults: HTTPInit = {
        cache: 'default',
        credentials: 'same-origin',
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
    },
    patternCache = new Map<string, WildcardExp>(),
    isRequest = is(Request) as (value: any) => value is Request;

/**
 * Tests whether a value exposes \`postComplete()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is completion-aware.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function }) as (
    value: any
) => value is CompletionAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`postError()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is error-aware.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function }) as (
    value: any
) => value is ErrorAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`preInit()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is initialization-aware.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function }) as (
    value: any
) => value is InitializationAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`preRequest()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is request-aware.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function }) as (
    value: any
) => value is RequestAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`postResponse()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is response-aware.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function }) as (
    value: any
) => value is ResponseAwareHTTPInterceptor;

/**
 * Tests whether a value behaves like any supported HTTP interceptor.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value matches at least one interceptor role.
 */
export const likeHTTPInterceptor = (value: any): value is ResponseAwareHTTPInterceptor =>
    likeCompletionAwareHTTPInterceptor(value) ||
    likeErrorAwareHTTPInterceptor(value) ||
    likeInitializationAwareHTTPInterceptor(value) ||
    likeRequestAwareHTTPInterceptor(value) ||
    likeResponseAwareHTTPInterceptor(value);

/**
 * Pattern matcher that uses wildcard expressions and caches compiled patterns.
 */
export class WildcardMatcher implements PatternMatcher<string, string> {
    /**
     * Tests whether a value matches a wildcard pattern.
     *
     * @param pattern - The wildcard pattern to compile and cache.
     * @param value - The value to test.
     * @returns \`true\` when the pattern matches the value.
     */
    match(pattern: string, value: string): boolean {
        let wcex: WildcardExp;

        if (patternCache.has(pattern)) {
            const cached = patternCache.get(pattern);
            if (cached) {
                wcex = cached;
            } else {
                wcex = new WildcardExp(pattern);
                patternCache.set(pattern, wcex);
            }
        } else {
            wcex = new WildcardExp(pattern);
            patternCache.set(pattern, wcex);
        }

        return wcex.test(value);
    }
}

export class MappedHTTPInterceptor
    implements
        CompletionAwareHTTPInterceptor,
        ErrorAwareHTTPInterceptor,
        InitializationAwareHTTPInterceptor,
        RequestAwareHTTPInterceptor,
        ResponseAwareHTTPInterceptor
{
    #excludePatterns!: string[];
    #includePatterns!: string[];
    #interceptor: HTTPInterceptor;

    /**
     * URL matcher used to evaluate include/exclude patterns.
     */
    urlMatcher: WildcardMatcher;

    /**
     * The wrapped interceptor that will run when the URL matches.
     */
    get interceptor(): HTTPInterceptor {
        return this.#interceptor;
    }

    /**
     * Creates a URL-scoped interceptor wrapper.
     *
     * @param interceptor - The interceptor to delegate to when a pattern matches.
     * @param includePatterns - URL patterns that enable the interceptor.
     * @param excludePatterns - URL patterns that disable the interceptor.
     */
    constructor(interceptor: HTTPInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.urlMatcher = new WildcardMatcher();
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    /**
     * Tests whether the supplied URL is included and not excluded.
     *
     * @param url - The URL to evaluate.
     * @param matcher - Optional matcher to reuse for pattern checks.
     * @returns \`true\` when the URL should receive the wrapped interceptor.
     */
    matches(url: string, matcher?: WildcardMatcher): boolean {
        const urlMatcher = matcher || this.urlMatcher;

        if (urlMatcher) {
            const excludePatterns = this.#excludePatterns ?? [],
                includePatterns = this.#includePatterns ?? [];
            let index: number, length: number;

            if (excludePatterns.length) {
                length = excludePatterns.length;
                for (index = 0; index < length; index++) {
                    if (urlMatcher.match(excludePatterns[index], url)) {
                        return false;
                    }
                }
            }

            if (!includePatterns.length) {
                return true;
            }

            length = includePatterns.length;
            for (index = 0; index < length; index++) {
                if (urlMatcher.match(includePatterns[index], url)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Delegates post-error handling to the wrapped interceptor when supported.
     *
     * @param error - The request failure.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @returns A replacement response, or \`undefined\` if the interceptor does not handle errors.
     */
    async postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        const interceptor = this.#interceptor;
        if (likeErrorAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postError(error, request, http);
        }
    }

    /**
     * Delegates completion handling to the wrapped interceptor when supported.
     *
     * @param request - The request that completed.
     * @param response - The final response or error wrapper.
     */
    postComplete(request: Request, response: Response | ResponseError): void {
        const interceptor = this.#interceptor;
        if (likeCompletionAwareHTTPInterceptor(interceptor)) {
            interceptor.postComplete(request, response);
        }
    }

    /**
     * Delegates response handling to the wrapped interceptor when supported.
     *
     * @param response - The response returned by fetch.
     * @param settings - The request settings used for the call.
     * @returns A replacement response, or \`void\` to keep the original.
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        const interceptor = this.#interceptor;
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postResponse(response, settings);
        }
    }

    /**
     * Delegates initialization handling to the wrapped interceptor when supported.
     *
     * @param url - The resolved request URL.
     * @param settings - The request settings being prepared.
     * @returns \`false\` when the wrapped interceptor rejects the request.
     */
    preInit(url: URL, settings: HTTPInit): boolean {
        const interceptor = this.#interceptor;
        if (likeInitializationAwareHTTPInterceptor(interceptor)) {
            return interceptor.preInit(url, settings);
        }
        return true;
    }

    /**
     * Delegates request handling to the wrapped interceptor when supported.
     *
     * @param request - The request to inspect or replace.
     * @param http - The HTTP client executing the request.
     * @returns A replacement request, or the original request when unsupported.
     */
    async preRequest(request: Request, http: HTTP): Promise<Request | Response | void> {
        const interceptor = this.#interceptor;
        if (likeRequestAwareHTTPInterceptor(interceptor)) {
            return interceptor.preRequest(request, http);
        }
        return request;
    }

    /**
     * Replaces the patterns that block the wrapped interceptor.
     *
     * @param excludePatterns - URL patterns that disable the interceptor.
     */
    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    /**
     * Replaces the patterns that enable the wrapped interceptor.
     *
     * @param includePatterns - URL patterns that enable the interceptor.
     */
    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

const isMappedHTTPInterceptor = is(MappedHTTPInterceptor) as (value: any) => value is MappedHTTPInterceptor;

/**
 * Executes registered interceptors in lifecycle order for a single request.
 */
export class HTTPExecutionChain {
    #interceptors: HTTPInterceptor[];

    #hasCompletionAwareInterceptors: boolean;
    #hasErrorAwareInterceptors: boolean;
    #hasInitializationAwareInterceptors: boolean;
    #hasRequestAwareInterceptors: boolean;
    #hasResponseAwareInterceptors: boolean;

    /**
     * The HTTP client that owns this execution chain.
     */
    http: HTTP;

    /**
     * The index of the most recent initialization-aware interceptor.
     */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'HTTPExecutionChain';
    }

    /**
     * The interceptors registered with this execution chain.
     */
    get interceptors(): HTTPInterceptor[] {
        return this.#interceptors;
    }

    /**
     * Creates a chain for the given HTTP client and optional interceptor list.
     *
     * @param http - The owning HTTP client or an existing execution chain.
     * @param interceptors - Interceptors to seed the chain with.
     */
    constructor(http: HTTP | HTTPExecutionChain, interceptors: HTTPInterceptor[] | null = null) {
        this.#hasCompletionAwareInterceptors = false;
        this.#hasErrorAwareInterceptors = false;
        this.#hasInitializationAwareInterceptors = false;
        this.#hasRequestAwareInterceptors = false;
        this.#hasResponseAwareInterceptors = false;

        this.#interceptors = [] as HTTPInterceptor[];

        if (isHTTPExecutionChain(http)) {
            const chain = http;
            this.http = chain.http;
            chain.interceptors?.length && this.addInterceptors(chain.interceptors);
        } else {
            this.http = http;
            interceptors?.length && this.addInterceptors(interceptors);
        }

        this.interceptorIndex = -1;
    }

    /**
     * Adds a single interceptor to the chain.
     *
     * @param interceptor - The interceptor to append.
     */
    addInterceptor(interceptor: HTTPInterceptor): void {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this._checkInterceptorType(interceptor);
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * Adds multiple interceptors to the chain in order.
     *
     * @param interceptors - Interceptors to append.
     */
    addInterceptors(interceptors: HTTPInterceptor[]): void {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }

    /**
     * Runs the first error-aware interceptor that can recover from a failure.
     *
     * @param error - The request failure.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @returns A replacement response, or \`undefined\` when no interceptor handles the error.
     */
    async applyPostError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        if (this.#hasErrorAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeErrorAwareHTTPInterceptor(interceptor)) {
                        return await interceptor.postError(error, request, http);
                    }
                }
            }
        }
    }

    /**
     * Runs all completion-aware interceptors after the request settles.
     *
     * @param request - The request that completed.
     * @param response - The final response or error wrapper.
     */
    applyPostComplete(request: Request, response: Response | ResponseError): void {
        if (this.#hasCompletionAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeCompletionAwareHTTPInterceptor(interceptor)) {
                        interceptor.postComplete(request, response);
                    }
                }
            }
        }
    }

    /**
     * Runs response-aware interceptors and returns the final response.
     *
     * @param response - The response returned by fetch.
     * @param settings - The request settings used for the call.
     * @returns The transformed response, or the original response when no transformer applies.
     */
    async applyPostResponse(response: Response, settings: HTTPInit): Promise<Response> {
        if (this.#hasResponseAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            let currentResponse: Response = response;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeResponseAwareHTTPInterceptor(interceptor)) {
                        const transformed = await interceptor.postResponse(currentResponse, settings);
                        if (likeResponse(transformed)) {
                            currentResponse = transformed;
                        }
                    }
                }
            }

            return currentResponse;
        }

        return response;
    }

    /**
     * Runs initialization-aware interceptors before the request object is created.
     *
     * @param url - The resolved request URL.
     * @param settings - The request settings being prepared.
     * @returns \`false\` when an interceptor cancels the request.
     */
    applyPreInit(url: URL, settings: HTTPInit): boolean {
        if (this.#hasInitializationAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeInitializationAwareHTTPInterceptor(interceptor)) {
                        if (interceptor.preInit(url, settings) === false) {
                            return false;
                        }
                        this.interceptorIndex = index;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Runs request-aware interceptors before fetch executes.
     *
     * @param request - The request to inspect or replace.
     * @param http - The HTTP client executing the request.
     * @returns The transformed request, or the original request when unsupported.
     */
    async applyPreRequest(request: Request, http: HTTP): Promise<Request | Response> {
        if (this.#hasRequestAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            if (length) {
                let currentRequest: Request | Response = request;
                for (let index = 0; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeRequestAwareHTTPInterceptor(interceptor)) {
                        const result = await interceptor.preRequest(
                            currentRequest instanceof Request ? currentRequest : new Request(currentRequest as any), 
                            http
                        );
                        if (isRequest(result) || likeResponse(result)) {
                            currentRequest = result;
                        }
                        if (likeResponse(currentRequest)) {
                            return currentRequest;
                        }
                    }
                }
                return currentRequest;
            }
        }
        return request;
    }

    /**
     * @protected
     * @param {module:http.HttpInterceptor} interceptor
     */
    _checkInterceptorType(interceptor: HTTPInterceptor): void {
        if (!this.#hasCompletionAwareInterceptors) {
            this.#hasCompletionAwareInterceptors = likeCompletionAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasErrorAwareInterceptors) {
            this.#hasErrorAwareInterceptors = likeErrorAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasInitializationAwareInterceptors) {
            this.#hasInitializationAwareInterceptors = likeInitializationAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasRequestAwareInterceptors) {
            this.#hasRequestAwareInterceptors = likeRequestAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasResponseAwareInterceptors) {
            this.#hasResponseAwareInterceptors = likeResponseAwareHTTPInterceptor(interceptor);
        }
    }
}

const isHTTPExecutionChain = is(HTTPExecutionChain) as (value: any) => value is HTTPExecutionChain;

/**
 * HTTP client with interceptor support and convenience verb helpers.
 */
export class HTTP {
    #fetch: Fetch;
    #interceptors: HTTPInterceptor[];

    /**
     * The default request settings used as the base for each request.
     */
    settings: HTTPInit;

    get [Symbol.toStringTag](): string {
        return 'HTTP';
    }

    /**
     * The interceptors configured for this client instance.
     */
    get interceptors(): HTTPInterceptor[] {
        return this.#interceptors;
    }

    /**
     * Create a new HTTP client instance with optional configuration.
     *
     * This is the recommended way to create HTTP clients for direct use.
     * For dependency injection scenarios (e.g., with ApplicationContext),
     * use the constructor directly.
     *
     * @param config - Configuration options for the HTTP client
     * @param config.baseURL - Base URL for resolving relative URLs
     * @param config.headers - Default headers to include in all requests
     * @param config.params - Default query parameters to include in all requests
     * @param config.interceptors - Optional HTTP interceptors
     * @param config.fetch - Optional custom fetch implementation (defaults to globalThis.fetch)
     *
     * @returns A configured HTTP client instance
     *
     * @example
     * // Direct construction (recommended for standalone use)
     * const api = HTTP.create({
     *     baseURL: 'https://api.example.com/',
     *     headers: { 'Authorization': 'Bearer token123' },
     *     params: { 'version': 'v2' }
     * });
     *
     * @example
     * // With interceptors
     * const api = HTTP.create({
     *     baseURL: 'https://api.example.com/',
     *     interceptors: [
     *         new TimeoutInterceptor(5000),
     *         new LoggingInterceptor()
     *     ]
     * });
     *
     * @see {@link HTTP.constructor} for dependency injection scenarios
     */
    static create(config: HTTPConfig = {}): HTTP {
        const { interceptors = [], fetch, requestTransforms = [], responseTransforms = [], ...init } = config;

        const resolvedInterceptors: HTTPInterceptor[] = [...interceptors];

        if (requestTransforms.length || responseTransforms.length) {
            resolvedInterceptors.push(new TransformInterceptor(requestTransforms, responseTransforms));
        }

        return new HTTP(resolvedInterceptors, init, fetch as any);
    }

    /**
     * Create a new HTTP client instance.
     *
     * This constructor is designed for dependency injection scenarios where
     * interceptors, settings, and fetch implementation are managed by a
     * container (e.g., ApplicationContext with AsHTTPStrategy).
     *
     * For direct construction, prefer using the static factory method HTTP.create().
     *
     * @param interceptors - Array of HTTP interceptors to apply
     * @param init - Initial configuration settings
     * @param fetch - Fetch implementation (defaults to globalThis.fetch)
     *
     * @example
     * // Dependency injection pattern (AsHTTPStrategy)
     * getHTTP(fetch: Fetch = globalThis.fetch): HTTP {
     *     const { httpInterceptors, httpSettings } = this;
     *     return new HTTP(httpInterceptors, httpSettings, fetch);
     * }
     *
     * @example
     * // Direct construction (when DI is not used)
     * const http = new HTTP(
     *     [new TimeoutInterceptor(5000)],
     *     { baseURL: 'https://api.example.com/' }
     * );
     *
     * @see {@link HTTP.create} for a cleaner API when not using DI
     */
    constructor(
        interceptors: HTTPInterceptor[] = [],
        init: HTTPInit = defaults,
        fetch = globalThis.fetch.bind(globalThis)
    ) {
        this.#interceptors = interceptors;
        this.#fetch = fetch;
        this.settings = init === defaults ? assign({}, init) : assign({}, defaults, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async request(input: string, init: HTTPInit | null = null): Promise<Response> {
        const settings = init === null ? assign({}, this.settings) : assign({}, this.settings, init);

        const instanceHeaders = new Headers(this.settings.headers || {});
        const requestHeaders = new Headers(settings.headers || {});

        requestHeaders.forEach((value, key) => {
            instanceHeaders.set(key, value);
        });
        settings.headers = instanceHeaders;

        const baseURL = settings.baseURL || (typeof location !== 'undefined' ? location.href : 'http://localhost/');
        const url = new URL(input, baseURL);

        // Merge instance and request query parameters
        const mergedParams = new URLSearchParams(this.settings.params || {});
        if (settings.params) {
            new URLSearchParams(settings.params).forEach((value, key) => {
                mergedParams.set(key, value);
            });
        }

        // Append merged params to the URL
        mergedParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        let response: Response | ResponseError | undefined;

        // No interceptors, so simplify execution
        if (!this.#interceptors.length) {
            freeze(settings);

            const request = new Request(url.toString(), settings);
            try {
                response = await this.#fetch(request);
            } catch (error) {
                response = new ResponseError(undefined, error as Error);
            }
        } else {
            const chain = this._getHTTPExecutionChain(this, url.href);

            if (chain.applyPreInit(url, settings) === false) {
                return new Response(null, settings);
            }

            freeze(settings);

            const preRequestResult = await chain.applyPreRequest(new Request(url.toString(), settings), this);
            if (likeResponse(preRequestResult)) {
                response = preRequestResult;
            } else {
                const request = preRequestResult as Request;
                try {
                    response = await this.#fetch(request);
                    response = await chain.applyPostResponse(response as Response, settings);
                } catch (error) {
                    response = await chain.applyPostError(error as Error, request, this);

                    if (!likeResponse(response)) {
                        response = likeResponse(error) ? error : error instanceof ResponseError ? error : new ResponseError(undefined, error as Error);
                    }
                } finally {
                    if (response) {
                        chain.applyPostComplete(request, response as Response);
                    }
                }
            }
        }

        return response;
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async connect(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'CONNECT';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async delete(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'DELETE';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async get(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'GET';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async head(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'HEAD';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async options(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'OPTIONS';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async patch(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PATCH';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async post(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'POST';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async put(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PUT';
        return this.request(input, init);
    }

    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async trace(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'TRACE';
        return this.request(input, init);
    }

    /**
     * @protected
     * @param {module:http.HTTP|module:http.HTTPExecutionChain} http
     * @param {string} url
     * @returns {module:http.HTTPExecutionChain}
     */
    protected _getHTTPExecutionChain(http: HTTP | HTTPExecutionChain, url: string): HTTPExecutionChain {
        const chain = isHTTPExecutionChain(http) ? http : new HTTPExecutionChain(http),
            interceptors = this.#interceptors,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (isMappedHTTPInterceptor(interceptor)) {
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
