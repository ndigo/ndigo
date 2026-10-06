/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTP, HTTPInit, RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';

/**
 * Configuration options for the CacheInterceptor.
 */
export interface CacheInterceptorConfig {
    /**
     * The default time-to-live for cached responses in milliseconds.
     * @default 300000 (5 minutes)
     */
    defaultTtl?: number;
    /**
     * The maximum number of responses to store in the cache.
     * @default 100
     */
    maxCacheSize?: number;
    /**
     * Headers that, if present in the request, will bypass the cache.
     * @default ['Cache-Control: no-cache']
     */
    cacheBustingHeaders?: string[];
}

interface CacheEntry {
    response: Response;
    expiry: number;
    lastAccessed: number;
}

/**
 * HTTP interceptor that provides in-memory response caching.
 *
 * This interceptor can return a cached response in `preRequest` to avoid
 * unnecessary network calls, and stores successful responses in `postResponse`.
 *
 * Only 200 OK responses to GET/HEAD requests are cached, keyed by
 * `method:url`. Credentialed requests — those carrying an `Authorization`
 * or `Cookie` header — are never cached and never served from cache, so one
 * user's authenticated response can never leak to another user through the
 * shared in-memory cache.
 */
export class CacheInterceptor implements RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor {
    #config: CacheInterceptorConfig;
    #cache: Map<string, CacheEntry> = new Map();

    /**
     * Creates a new cache interceptor.
     *
     * @param config - Cache interceptor configuration.
     */
    constructor(config: CacheInterceptorConfig = {}) {
        this.#config = config;
    }

    /**
     * Checks the cache for a matching response before the request is sent.
     *
     * @param request - The request to check.
     * @param http - The HTTP client executing the request.
     * @returns A cached Response if available and not expired, otherwise void.
     */
    async preRequest(request: Request, http: HTTP): Promise<Response | void> {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return;
        }

        if (this.#hasCredentials(request.headers) || this.#shouldBypassCache(request.headers)) {
            return;
        }

        const cacheKey = this.#generateCacheKey(request);
        const entry = this.#cache.get(cacheKey);

        if (entry) {
            if (Date.now() < entry.expiry) {
                entry.lastAccessed = Date.now();
                // Return a clone of the response as Response bodies can only be read once
                return entry.response.clone();
            } else {
                this.#cache.delete(cacheKey);
            }
        }
    }

    /**
     * Stores a successful response in the cache.
     *
     * @param response - The response to cache.
     * @param settings - The request settings used for the call.
     * @param request - The final request that was sent, when the execution
     * chain supplies it. Request-time interceptors may attach an
     * `Authorization` or `Cookie` header after `settings` is frozen, so the
     * credential and bypass gates read the sent request rather than the
     * settings snapshot.
     * @returns The response.
     */
    async postResponse(response: Response, settings: HTTPInit, request?: Request): Promise<Response | void> {
        // A response without a URL (stubbed/mock responses, some in-process
        // sources) cannot be keyed — and `new Request('')` throws. Skip
        // caching rather than breaking the caller.
        if (response.status !== 200 || !response.url) {
            return response;
        }

        const sentRequest = request ?? new Request(response.url, { method: settings.method ?? 'GET' });

        const requestHeaders = request
            ? request.headers
            : settings.headers instanceof Headers
              ? settings.headers
              : new Headers(settings.headers || {});

        // Only idempotent GET/HEAD responses are cached, and credentialed
        // responses never enter the shared cache (see the class docs).
        if ((sentRequest.method !== 'GET' && sentRequest.method !== 'HEAD') || this.#hasCredentials(requestHeaders)) {
            return response;
        }

        if (this.#shouldBypassCache(requestHeaders)) {
            return response;
        }

        const cacheKey = this.#generateCacheKey(sentRequest);
        const ttl = this.#config.defaultTtl ?? 300000;

        this.#cache.set(cacheKey, {
            response: response.clone(),
            expiry: Date.now() + ttl,
            lastAccessed: Date.now(),
        });

        this.#enforceCacheSize(cacheKey);

        return response;
    }

    /**
     * Tests whether the request carries credentials that must not be cached.
     */
    #hasCredentials(headers: Headers): boolean {
        return headers.get('authorization') !== null || headers.get('cookie') !== null;
    }

    #shouldBypassCache(headers: Headers): boolean {
        const bustingHeaders = this.#config.cacheBustingHeaders ?? ['Cache-Control: no-cache'];
        for (const header of bustingHeaders) {
            const [name, value] = header.split(':').map((s) => s.trim());
            if (headers.get(name) === value) {
                return true;
            }
        }
        return false;
    }

    #generateCacheKey(request: Request): string {
        return `${request.method}:${request.url}`;
    }

    #enforceCacheSize(newKey?: string): void {
        const maxSize = this.#config.maxCacheSize ?? 100;
        if (this.#cache.size > maxSize) {
            let oldestKey: string | null = null;
            let oldestTime = Infinity;

            for (const [key, entry] of this.#cache.entries()) {
                if (key === newKey) continue;
                if (entry.lastAccessed <= oldestTime) {
                    oldestTime = entry.lastAccessed;
                    oldestKey = key;
                }
            }

            if (oldestKey) {
                this.#cache.delete(oldestKey);
            }
        }
    }
}
