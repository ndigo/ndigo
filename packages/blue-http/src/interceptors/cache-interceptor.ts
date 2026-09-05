import { HTTP, RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';

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

        if (this.#shouldBypassCache(request)) {
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
     * @returns The response.
     */
    async postResponse(response: Response, settings: any): Promise<Response | void> {
        if (response.status !== 200) {
            return response;
        }

        const request = new Request(response.url, {
            method: response.headers.get('X-HTTP-Method') || 'GET',
        });

        if (this.#shouldBypassCache(request)) {
            return response;
        }

        const cacheKey = this.#generateCacheKey(request);
        const ttl = this.#config.defaultTtl ?? 300000;

        this.#cache.set(cacheKey, {
            response: response.clone(),
            expiry: Date.now() + ttl,
            lastAccessed: Date.now(),
        });

        this.#enforceCacheSize(cacheKey);

        return response;
    }

    #shouldBypassCache(request: Request): boolean {
        const bustingHeaders = this.#config.cacheBustingHeaders ?? ['Cache-Control: no-cache'];
        for (const header of bustingHeaders) {
            const [name, value] = header.split(':').map((s) => s.trim());
            if (request.headers.get(name) === value) {
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
