/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import { type PatternMatcher, WildcardExp } from '@blue/core';
import type { HTTP } from './http-client';
import type { HTTPInit, HTTPInterceptor } from './http-types';
import type {
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
    InitializationAwareHTTPInterceptor,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
} from './http-types';
import {
    likeCompletionAwareHTTPInterceptor,
    likeErrorAwareHTTPInterceptor,
    likeInitializationAwareHTTPInterceptor,
    likeRequestAwareHTTPInterceptor,
    likeResponseAwareHTTPInterceptor,
} from './http-interceptor-guards';
import type ResponseError from './response-error';
import { patternCache } from './http-shared';
import { is } from '@blue/util/types';

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
     * @param request - The final request that was sent, when available.
     * @returns A replacement response, or \`void\` to keep the original.
     */
    async postResponse(response: Response, settings: HTTPInit, request?: Request): Promise<Response | void> {
        const interceptor = this.#interceptor;
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postResponse(response, settings, request);
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

/**
 * @internal
 */
export const isMappedHTTPInterceptor = is(MappedHTTPInterceptor) as (value: unknown) => value is MappedHTTPInterceptor;
