/**
 * @author Jeff Rose
 */
/// <reference lib="dom" />

import { PatternMatcher, WildcardExp } from '@blue/core';
import { Aware } from '@blue/factory';
import ResponseError from './response-error';
import { anyPass } from '@blue/util/logic';
import { is, like } from '@blue/util/types';
import { likeResponse } from './like-response';

export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
/**
 * Extended RequestInit with HTTP-specific options.
 * @property {HTTPMethod} [method] - The HTTP request method
 * @property {string} [baseURL] - Base URL for resolving relative URLs.
 *   If provided, relative URLs will be resolved against this base.
 *   Absolute URLs ignore this option.
 *   **Important**: Must include trailing slash if using path segments.
 * @example
 * // Correct - with trailing slash
 * { baseURL: 'https://api.github.com/' }
 * { baseURL: 'https://api.github.com/v3/' }
 *
 * // Incorrect - will drop last segment
 * { baseURL: 'https://api.github.com/v3' }  // 'users' → '/users' not '/v3/users'
 */
export type HTTPInit = RequestInit & {
    method?: HTTPMethod;
    baseURL?: string; // ← ADDED
    headers?: HeadersInit;
    params?: URLSearchParams | string[][] | Record<string, string> | string;
};

/**
 * Configuration options for creating an HTTP client instance via HTTP.create().
 * This interface extends HTTPInit with additional factory-specific options.
 * @property {HTTPInterceptor[]} [interceptors] - Optional HTTP interceptors to apply to all requests
 * @property {Fetch} [fetch] - Optional custom fetch implementation (defaults to globalThis.fetch)
 */
export interface HTTPConfig extends HTTPInit {
    /**
     * Optional HTTP interceptors to apply to all requests.
     */
    interceptors?: HTTPInterceptor[];

    /**
     * Optional custom fetch implementation.
     * Defaults to globalThis.fetch if not provided.
     */
    fetch?: Fetch;
}

export type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export interface CompletionAwareHTTPInterceptor {
    postComplete(request: Request, response: Response | ResponseError): void;
}

export interface ErrorAwareHTTPInterceptor {
    postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>;
}

export interface InitializationAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    preInit(url: URL, settings: T): boolean;
}

export interface RequestAwareHTTPInterceptor {
    preRequest(request: Request, http: HTTP): Promise<Request | void>;
}

export interface ResponseAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    postResponse(response: Response, settings: T): Promise<void>;
}

export type HTTPInterceptor =
    | CompletionAwareHTTPInterceptor
    | ErrorAwareHTTPInterceptor
    | InitializationAwareHTTPInterceptor
    | RequestAwareHTTPInterceptor
    | ResponseAwareHTTPInterceptor;

export interface HTTPAware extends Aware {
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
 *      console.log( `Completed request ${ request.url }` );
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
 * Interface that allows for the execution of custom behavior after an HTTP request fails. If `postError` returns a `Response`, it will be the return value of the request.
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
 * 1. `preInit`
 * 2. `preRequest`
 * 3. `postResponse` or `postError`
 * 5. `postComplete`
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
    isRequest = is(Request) as (value) => value is Request;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link CompletionAwareHTTPInterceptor}.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function }) as (
    value
) => value is CompletionAwareHTTPInterceptor;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link ErrorAwareHTTPInterceptor}.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function }) as (
    value
) => value is ErrorAwareHTTPInterceptor;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link InitializationAwareHTTPInterceptor}.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function }) as (
    value
) => value is InitializationAwareHTTPInterceptor;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link RequestAwareHTTPInterceptor}.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function }) as (
    value
) => value is RequestAwareHTTPInterceptor;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function }) as (
    value
) => value is ResponseAwareHTTPInterceptor;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link HTTPInterceptor}.
 */
export const likeHTTPInterceptor = anyPass([
    likeCompletionAwareHTTPInterceptor,
    likeErrorAwareHTTPInterceptor,
    likeInitializationAwareHTTPInterceptor,
    likeRequestAwareHTTPInterceptor,
    likeResponseAwareHTTPInterceptor,
]) as (value) => value is ResponseAwareHTTPInterceptor;

export class WildcardMatcher implements PatternMatcher<string, string> {
    match(pattern: string, value: string): boolean {
        let wcex: WildcardExp;

        if (patternCache.has(pattern)) {
            wcex = patternCache.get(pattern);
        } else {
            wcex = new WildcardExp(pattern);
            patternCache.set(pattern, wcex);
        }

        return wcex.test(value);
    }
}

/**
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.RequestAwareHTTPInterceptor
 * @implements external:ResponseAwareHTTPInterceptor
 */
export class MappedHTTPInterceptor
    implements
        CompletionAwareHTTPInterceptor,
        ErrorAwareHTTPInterceptor,
        InitializationAwareHTTPInterceptor,
        RequestAwareHTTPInterceptor,
        ResponseAwareHTTPInterceptor
{
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: HTTPInterceptor;

    urlMatcher: WildcardMatcher;

    get interceptor(): HTTPInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: HTTPInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.urlMatcher = new WildcardMatcher();
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

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

    async postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        const interceptor = this.#interceptor;
        if (likeErrorAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postError(error, request, http);
        }
    }

    postComplete(request: Request, response: Response | ResponseError): void {
        const interceptor = this.#interceptor;
        if (likeCompletionAwareHTTPInterceptor(interceptor)) {
            interceptor.postComplete(request, response);
        }
    }

    async postResponse(response: Response, settings: HTTPInit): Promise<void> {
        const interceptor = this.#interceptor;
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            await interceptor.postResponse(response, settings);
        }
    }

    preInit(url: URL, settings: HTTPInit): boolean {
        const interceptor = this.#interceptor;
        if (likeInitializationAwareHTTPInterceptor(interceptor)) {
            return interceptor.preInit(url, settings);
        }
        return true;
    }

    async preRequest(request: Request, http: HTTP): Promise<Request | void> {
        const interceptor = this.#interceptor;
        if (likeRequestAwareHTTPInterceptor(interceptor)) {
            return interceptor.preRequest(request, http);
        }
        return request;
    }

    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

const isMappedHTTPInterceptor = is(MappedHTTPInterceptor) as (value) => value is MappedHTTPInterceptor;

/**
 */
export class HTTPExecutionChain {
    #interceptors: HTTPInterceptor[];

    #hasCompletionAwareInterceptors: boolean;
    #hasErrorAwareInterceptors: boolean;
    #hasInitializationAwareInterceptors: boolean;
    #hasRequestAwareInterceptors: boolean;
    #hasResponseAwareInterceptors: boolean;

    /**
     */
    http: HTTP;

    /**
     */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'HTTPExecutionChain';
    }

    /**
     */
    get interceptors(): HTTPInterceptor[] {
        return this.#interceptors;
    }

    constructor(http: HTTP | HTTPExecutionChain, interceptors: HTTPInterceptor[] = null) {
        this.#hasCompletionAwareInterceptors = false;
        this.#hasErrorAwareInterceptors = false;
        this.#hasInitializationAwareInterceptors = false;
        this.#hasRequestAwareInterceptors = false;
        this.#hasResponseAwareInterceptors = false;

        this.#interceptors = null;

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
     * @param {module:http.HttpInterceptor} interceptor
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
     * @param {Array<module:http.HttpInterceptor>} interceptors
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
     */
    async applyPostResponse(response: Response, settings: HTTPInit): Promise<void> {
        if (this.#hasResponseAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeResponseAwareHTTPInterceptor(interceptor)) {
                        await interceptor.postResponse(response, settings);
                    }
                }
            }
        }
    }

    /**
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
     */
    async applyPreRequest(request: Request, http: HTTP): Promise<Request> {
        if (this.#hasRequestAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                let currentRequest = request;
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeRequestAwareHTTPInterceptor(interceptor)) {
                        const newRequest = await interceptor.preRequest(currentRequest, http);
                        if (isRequest(newRequest)) {
                            currentRequest = newRequest;
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

const isHTTPExecutionChain = is(HTTPExecutionChain) as (value) => value is HTTPExecutionChain;

/**
 * @param {Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {fetch} [fetch]
 */
export class HTTP {
    #fetch: Fetch;
    #interceptors: HTTPInterceptor[];
    settings: HTTPInit;

    get [Symbol.toStringTag](): string {
        return 'HTTP';
    }

    /**
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
        const { interceptors = [], fetch, ...init } = config;
        return new HTTP(interceptors, init, fetch);
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
    async request(input: string, init: HTTPInit = null): Promise<Response> {
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

        let response: Response | ResponseError;

        // No interceptors, so simplify execution
        if (!this.#interceptors.length) {
            freeze(settings);

            const request = new Request(url.toString(), settings);
            try {
                response = await this.#fetch(request);
            } catch (error) {
                response = new ResponseError(null, error);
            }

            // One or more interceptors, so complex execution
        } else {
            const chain = this._getHTTPExecutionChain(this, url.href);

            if (chain.applyPreInit(url, settings) === false) {
                return new Response(null, settings);
            }

            freeze(settings);

            const request = await chain.applyPreRequest(new Request(url.toString(), settings), this);
            try {
                response = await this.#fetch(request);
                await chain.applyPostResponse(response, settings);
            } catch (error) {
                response = await chain.applyPostError(error, request, this);

                if (!likeResponse(response)) {
                    response = likeResponse(error) ? error : new ResponseError(null, error);
                }
            } finally {
                chain.applyPostComplete(request, response);
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
