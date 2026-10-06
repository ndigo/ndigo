/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import type { Fetch, HTTPConfig, HTTPInit, HTTPInterceptor } from './http-types';
import { assign, defaults, freeze } from './http-shared';
import { TransformInterceptor } from './interceptors/transform-interceptor';
import ResponseError from './response-error';
import { likeResponse } from './like-response';
import { isMappedHTTPInterceptor } from './http-mapped-interceptor';
import { HTTPExecutionChain, isHTTPExecutionChain } from './http-execution-chain';

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

        return new HTTP(resolvedInterceptors, init, fetch);
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

        const candidateBase =
            settings.baseURL || (typeof location !== 'undefined' ? location.href : 'http://localhost/');
        // A relative base (e.g. '/') makes `new URL(input, base)` throw in
        // Node's parser even for absolute inputs — only absolute bases are
        // trusted, otherwise the platform default applies.
        const baseURL =
            candidateBase && /^[a-z][a-z\d+.-]*:\/\//i.test(candidateBase)
                ? candidateBase
                : typeof location !== 'undefined'
                  ? location.href
                  : 'http://localhost/';
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
                    response = await chain.applyPostResponse(response as Response, settings, request);
                } catch (error) {
                    response = await chain.applyPostError(error as Error, request, this);

                    if (!likeResponse(response)) {
                        response = likeResponse(error)
                            ? error
                            : error instanceof ResponseError
                              ? error
                              : new ResponseError(undefined, error as Error);
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
