/**
 */
import { HTTP, HTTPInit, RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';

/**
 * Configuration options for the CacheInterceptor.
 */
export interface CacheInterceptorConfig {
    /**
     * The default time-to-live for cached responses in milliseconds.
     * @defaultValue 300000 (5 minutes)
     */
    defaultTtl?: number;
    /**
     * The maximum number of responses to store in the cache.
     * @defaultValue 100
     */
    maxCacheSize?: number;
    /**
     * Headers that, if present in the request, will bypass the cache.
     * @defaultValue ['Cache-Control: no-cache']
     */
    cacheBustingHeaders?: string[];
}

interface CacheEntry {
    response: Response;
    expiry: number;
    lastAccessed: number;
    /** Lower-cased `Vary` field names declared by the stored response. */
    vary: string[];
    /** Request header values for each `Vary` field at store time. */
    varyValues: Record<string, string>;
}

/** Response directives that forbid storing a response in a shared cache. */
const UNCACHEABLE_RESPONSE_DIRECTIVES: Record<string, true> = {
    'no-store': true,
    'no-cache': true,
    private: true,
};

/** Request directives that forbid using or storing a cached response. */
const UNCACHEABLE_REQUEST_DIRECTIVES: Record<string, true> = {
    'no-store': true,
    'no-cache': true,
};

/** Splits a `Cache-Control` header into lower-cased directive tokens. */
function cacheControlTokens(headers: Headers): string[] {
    const value = headers.get('cache-control');
    if (value === null) {
        return [];
    }
    return value.split(',').map((token) => token.trim().toLowerCase());
}

/** Reports whether any directive name in `directives` appears in `Cache-Control`. */
function hasCacheDirective(headers: Headers, directives: Record<string, true>): boolean {
    return cacheControlTokens(headers).some((token) => {
        // A directive may carry a value (`no-cache="set-cookie"`, `max-age=0`).
        const name = token.split('=')[0];
        return directives[name] === true;
    });
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
 * shared in-memory cache. Responses that forbid shared caching (`Set-Cookie`,
 * `Cache-Control: private`/`no-store`/`no-cache`, `Vary: *`) are never stored,
 * and a stored response is only replayed when its `Vary` request headers match.
 */
export class CacheInterceptor implements RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor {
    #config: CacheInterceptorConfig;
    #cache: Map<string, CacheEntry> = new Map();
    /**
     * Responses handed out by `preRequest` so the same interceptor's
     * `postResponse` does not re-store them (and reset their TTL) when the
     * pipeline runs post-response hooks for a cache hit (HTT-REV-002).
     */
    #hits = new WeakSet<Response>();

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

        if (
            this.#hasCredentials(request.headers) ||
            this.#shouldBypassCache(request.headers) ||
            hasCacheDirective(request.headers, UNCACHEABLE_REQUEST_DIRECTIVES)
        ) {
            return;
        }

        const cacheKey = this.#generateCacheKey(request);
        const entry = this.#cache.get(cacheKey);

        if (entry) {
            if (Date.now() < entry.expiry && this.#matchesVary(entry, request)) {
                entry.lastAccessed = Date.now();
                // Return a clone of the response as Response bodies can only be read once
                const cached = entry.response.clone();
                this.#hits.add(cached);
                return cached;
            }
            if (Date.now() >= entry.expiry) {
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

        // A cache hit re-enters the post-response pipeline (HTT-REV-002);
        // storing it again would needlessly reset its TTL.
        if (this.#hits.has(response)) {
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

        if (
            this.#shouldBypassCache(requestHeaders) ||
            hasCacheDirective(requestHeaders, UNCACHEABLE_REQUEST_DIRECTIVES) ||
            this.#responseDisallowsCache(response)
        ) {
            return response;
        }

        const vary = this.#varyFields(response);
        if (vary === null) {
            // `Vary: *` — the response can never be matched to a later request.
            return response;
        }

        const varyValues: Record<string, string> = {};
        for (const name of vary) {
            varyValues[name] = sentRequest.headers.get(name) ?? '';
        }

        const cacheKey = this.#generateCacheKey(sentRequest);
        const ttl = this.#config.defaultTtl ?? 300000;

        this.#cache.set(cacheKey, {
            response: response.clone(),
            expiry: Date.now() + ttl,
            lastAccessed: Date.now(),
            vary,
            varyValues,
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

    /**
     * Tests whether a response forbids shared caching: `Set-Cookie` credentials,
     * `Cache-Control: private`/`no-store`/`no-cache`, or `Vary: *` (HTT-REV-004/005).
     */
    #responseDisallowsCache(response: Response): boolean {
        return (
            response.headers.get('set-cookie') !== null ||
            hasCacheDirective(response.headers, UNCACHEABLE_RESPONSE_DIRECTIVES)
        );
    }

    /**
     * Reads the response's `Vary` field names.
     *
     * @returns The lower-cased field names, or `null` when `Vary: *` makes the
     * response unmatchable.
     */
    #varyFields(response: Response): string[] | null {
        const value = response.headers.get('vary');
        if (value === null) {
            return [];
        }
        const fields = value
            .split(',')
            .map((field) => field.trim().toLowerCase())
            .filter((field) => field.length > 0);
        return fields.includes('*') ? null : fields;
    }

    /** Tests whether the request's `Vary` headers match the stored entry. */
    #matchesVary(entry: CacheEntry, request: Request): boolean {
        for (const name of entry.vary) {
            if ((request.headers.get(name) ?? '') !== (entry.varyValues[name] ?? '')) {
                return false;
            }
        }
        return true;
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
