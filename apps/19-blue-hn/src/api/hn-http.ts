/**
 * The `@blue/http` client this app drives the HN API with, and the interceptor
 * chain that carries the client story:
 *
 *  - {@link RetryOnOfflineInterceptor} queues a request made while offline and
 *    replays it through the same client when the browser reconnects.
 *  - {@link CacheInterceptor} serves a stored response inside a TTL, so a
 *    repeat visit to a feed costs no network round trip.
 *
 * The client also wraps its `fetch` in a counter so the caller can tell a
 * cache hit from a network hit: a request that completes without the counter
 * moving was answered by the response cache, not the wire.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { CacheInterceptor, HTTP, type Fetch } from '@blue/http';
import { RetryOnOfflineInterceptor } from '@blue/platform-web';

/** Default time-to-live for a cached HN response (five minutes). */
export const DEFAULT_CACHE_TTL = 300_000;

/** A configured HN client plus the instrumentation the app reads. */
export interface HNHTTP {
    /** The interceptor-wired client. */
    readonly http: HTTP;
    /** Count of requests that actually reached the network layer. */
    networkCalls(): number;
}

/** Options for {@link createHnHttp}. */
export interface CreateHNHTTPOptions {
    /** Absolute API base; relative inputs resolve against it. */
    base: string;
    /** Response-cache TTL in milliseconds (`CacheInterceptor`). */
    cacheTtl?: number;
    /** Offline retry cadence in milliseconds (`RetryOnOfflineInterceptor`). */
    retryInterval?: number;
    /** Custom Fetch (tests); defaults to `globalThis.fetch`. */
    fetch?: Fetch;
}

/**
 * Builds the HN HTTP client with its cache + offline-replay chain.
 *
 * @param options - Base URL, TTLs, and an optional Fetch.
 * @returns The client and its network-call counter.
 */
export function createHnHttp(options: CreateHNHTTPOptions): HNHTTP {
    let calls = 0;
    const baseFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    const countingFetch: Fetch = (input, init) => {
        calls += 1;
        return baseFetch(input, init);
    };

    const http = HTTP.create({
        baseURL: options.base,
        headers: { Accept: 'application/json' },
        fetch: countingFetch,
        // Offline first: while offline the request is queued and never reaches
        // the cache; when online the cache answers before the wire.
        interceptors: [
            new RetryOnOfflineInterceptor({ retryInterval: options.retryInterval }),
            new CacheInterceptor({ defaultTtl: options.cacheTtl ?? DEFAULT_CACHE_TTL }),
        ],
    });

    return { http, networkCalls: () => calls };
}
