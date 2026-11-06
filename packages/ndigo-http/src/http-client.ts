/**
 * HTTP client with interceptor support and convenience verb helpers.
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
     *   - `baseURL` - Base URL for resolving relative URLs
     *   - `params` - Default query parameters to include in all requests
     *   - `interceptors` - Optional HTTP interceptors
     *   - `fetch` - Optional custom fetch implementation (defaults to globalThis.fetch)
     *
     * @returns A configured HTTP client instance
     *
     * @example
     * ```ts
     * // Direct construction (recommended for standalone use)
     * const api = HTTP.create({
     *     baseURL: 'https://api.example.com/',
     *     headers: { 'Authorization': 'Bearer token123' },
     *     params: { 'version': 'v2' }
     * });
     * ```
     *
     * @example
     * ```ts
     * // With interceptors
     * const api = HTTP.create({
     *     baseURL: 'https://api.example.com/',
     *     interceptors: [
     *         new TimeoutInterceptor(5000),
     *         new LoggingInterceptor()
     *     ]
     * });
     * ```
     *
     * @see the constructor for dependency injection scenarios
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
     * ```ts
     * // Dependency injection pattern (AsHTTPStrategy)
     * class Consumer {
     *   getHTTP(fetch: Fetch = globalThis.fetch): HTTP {
     *     const { httpInterceptors, httpSettings } = this;
     *     return new HTTP(httpInterceptors, httpSettings, fetch);
     *   }
     * }
     * ```
     *
     * @example
     * ```ts
     * // Direct construction (when DI is not used)
     * const http = new HTTP(
     *     [new TimeoutInterceptor(5000)],
     *     { baseURL: 'https://api.example.com/' }
     * );
     * ```
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
                const cancelled = new Response(null, settings);
                this.#completeCancelled(chain, url, settings, cancelled);
                return cancelled;
            }

            freeze(settings);

            let request = new Request(url.toString(), settings);

            try {
                const preRequestResult = await chain.applyPreRequest(request, this, settings);
                if (likeResponse(preRequestResult)) {
                    // A short-circuit (e.g. a cache hit) is still a response
                    // the pipeline must observe: run the postResponse
                    // transforms so hits and misses agree (HTT-REV-002).
                    response = await chain.applyPostResponse(preRequestResult, settings, request);
                } else {
                    request = preRequestResult as Request;
                    response = await this.#fetch(request);
                    response = await chain.applyPostResponse(response as Response, settings, request);
                }
            } catch (error) {
                // Failures raised before fetch (e.g. by a request transform)
                // follow the same error/completion contract as transport ones.
                try {
                    response = await chain.applyPostError(error as Error, request, this, settings);
                } catch (postErrorFailure) {
                    // A throwing error-aware interceptor must not strand
                    // per-request resources (e.g. the timeout timer): complete
                    // the request before propagating the failure (HTT-REV-009).
                    chain.applyPostComplete(request, new ResponseError(undefined, postErrorFailure as Error), settings);
                    throw postErrorFailure;
                }

                if (!likeResponse(response)) {
                    response = likeResponse(error)
                        ? error
                        : error instanceof ResponseError
                          ? error
                          : new ResponseError(undefined, error as Error);
                }
            } finally {
                if (response) {
                    chain.applyPostComplete(request, response as Response, settings);
                }
            }
        }

        return response;
    }

    /**
     * Runs completion hooks for a request cancelled before fetch executes.
     *
     * A pre-init cancellation never reaches the normal completion path, so
     * per-request resources (e.g. the timeout interceptor's timer) would
     * otherwise outlive the request (HTT-REV-009). The request is rebuilt from
     * the settings purely so completion hooks have a subject.
     *
     * @param chain - The execution chain to notify.
     * @param url - The resolved request URL.
     * @param settings - The per-request settings.
     * @param response - The cancellation response returned to the caller.
     */
    #completeCancelled(chain: HTTPExecutionChain, url: URL, settings: HTTPInit, response: Response): void {
        try {
            chain.applyPostComplete(new Request(url.toString(), settings), response, settings);
        } catch {
            // A body-bearing settings object can make Request construction
            // throw; the cancellation itself must still succeed. Completion
            // cleanup is best-effort here.
        }
    }

    async connect(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'CONNECT';
        return this.request(input, init);
    }

    async delete(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'DELETE';
        return this.request(input, init);
    }

    async get(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'GET';
        return this.request(input, init);
    }

    async head(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'HEAD';
        return this.request(input, init);
    }

    async options(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'OPTIONS';
        return this.request(input, init);
    }

    async patch(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PATCH';
        return this.request(input, init);
    }

    async post(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'POST';
        return this.request(input, init);
    }

    async put(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PUT';
        return this.request(input, init);
    }

    async trace(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'TRACE';
        return this.request(input, init);
    }

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
