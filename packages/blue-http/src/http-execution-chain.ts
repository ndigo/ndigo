/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import type { HTTP } from './http-client';
import type { HTTPInit, HTTPInterceptor } from './http-types';
import {
    likeCompletionAwareHTTPInterceptor,
    likeErrorAwareHTTPInterceptor,
    likeInitializationAwareHTTPInterceptor,
    likeRequestAwareHTTPInterceptor,
    likeResponseAwareHTTPInterceptor,
} from './http-interceptor-guards';
import ResponseError from './response-error';
import { isRequest } from './http-shared';
import { likeResponse } from './like-response';
import { is } from '@blue/util/types';

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
            if (chain.interceptors?.length) {
                this.addInterceptors(chain.interceptors);
            }
        } else {
            this.http = http;
            if (interceptors?.length) {
                this.addInterceptors(interceptors);
            }
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
     * Runs the error-aware interceptors in order, accumulating a recovery.
     *
     * Interceptors that return `undefined` (they do not handle the error) let
     * later interceptors run. An interceptor that returns a response recovers
     * the request — and that recovery becomes the error context handed to the
     * remaining interceptors (as a {@link ResponseError}), so a chain like
     * `[Timeout, Retry]` can retry a timeout produced by an earlier
     * interceptor, while `[Retry, Timeout]` still translates an abort into a
     * 408. Interceptors that decline leave the most recent recovery in place.
     *
     * @param error - The request failure.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @returns The most recent replacement response, or \`undefined\` when no interceptor handles the error.
     */
    async applyPostError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        if (this.#hasErrorAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let currentError: Error = error;
            let recovered: Response | undefined;

            if (length) {
                for (let index = 0; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeErrorAwareHTTPInterceptor(interceptor)) {
                        // oxlint-disable-next-line no-await-in-loop
                        const result = await interceptor.postError(currentError, request, http);
                        if (result !== undefined) {
                            recovered = result;
                            currentError = new ResponseError(result, result.statusText);
                        }
                    }
                }
            }

            return recovered;
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
                        // Each response transform consumes the previous result; pipeline is sequential.
                        // oxlint-disable-next-line no-await-in-loop
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
                        // Pre-request interceptors run in order and can short-circuit the chain.
                        // Response-shaped results return early above; build defensively for anything else.
                        // oxlint-disable-next-line no-await-in-loop
                        const result = await interceptor.preRequest(
                            currentRequest instanceof Request
                                ? currentRequest
                                : new Request(currentRequest as unknown as RequestInfo),
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

/**
 * @internal
 */
export const isHTTPExecutionChain = is(HTTPExecutionChain) as (value: unknown) => value is HTTPExecutionChain;
