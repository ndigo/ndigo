/**
 * The shared-cache route: one value per key, held by the cache adapter both
 * instances point at, with the counter and the producing instance id carried
 * inside the entry — so the same `GET /cache/:key` on node B shows the entry
 * node A created, and the count both of them have driven up.
 * @module blue-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import { randomUUID } from 'node:crypto';
import '@tsmetadata/polyfill';
import { CacheMiss } from '@blue/cache';
import { getMapping, parameters, pathVariable, queryValue, requestMapping } from '@blue/dispatcher';
import { FANOUT_CACHE_NAME } from './board-message';
import { CACHE_TTL_MS, type FanoutBackend } from './fanout-backend';

/** The stored entry: the value plus who produced it and how often it was read. */
export interface CacheValue {
    /** The shared value. */
    readonly value: string;
    /** Reads so far, whichever instance served them. */
    readonly hits: number;
    /** The instance id that created the entry. */
    readonly producer: string;
    /** First-write time (ISO 8601 UTC). */
    readonly createdAt: string;
    /** Last-read time (ISO 8601 UTC). */
    readonly updatedAt: string;
}

/**
 * `GET /cache/:key` — read (and count) a value held by the shared cache.
 */
@requestMapping('/cache')
export class CacheController {
    readonly #backend: FanoutBackend;

    /**
     * @param backend - The backend owning the cache adapter.
     */
    constructor(backend: FanoutBackend) {
        this.#backend = backend;
    }

    /**
     * Returns the entry for `key`, creating it on a miss and incrementing its
     * counter on a hit.
     *
     * `?value=` seeds the value the first time the key is created; later reads
     * ignore it, so two instances cannot fight over the shared value. The
     * read-modify-write is deliberately **not** atomic: this is a demo counter,
     * and the point is that both instances observe the same entry with the same
     * TTL, not that they serialize on it.
     *
     * @param key - The cache key (the `:key` path variable).
     * @param value - Optional seed value, honoured only on the first write.
     * @returns The entry, plus where this read was served and against which
     *   backend.
     */
    @getMapping('/:key')
    @parameters({ key: pathVariable('key'), value: queryValue('value') })
    async get(key: string, value: string | undefined) {
        const cache = this.#backend.cacheManager.getCache<CacheValue>(FANOUT_CACHE_NAME);
        const now = new Date().toISOString();
        const stored = await cache.get(key);
        // `instanceof` — not `isCacheMiss(...)` nor `=== CacheMiss.INSTANCE` — is
        // the comparison TypeScript narrows for an *object* payload: `CacheMiss`
        // is an empty class, so every object constituent is assignable to it and
        // the type guard's negative branch collapses to `never`. The sentinel is
        // the class's only instance (private constructor), so this check is exact.
        const entry: CacheValue =
            stored instanceof CacheMiss
                ? {
                      value: value ?? `value-for-${key}-${randomUUID().slice(0, 8)}`,
                      hits: 1,
                      producer: this.#backend.instanceId,
                      createdAt: now,
                      updatedAt: now,
                  }
                : { ...stored, hits: stored.hits + 1, updatedAt: now };
        await cache.set(key, entry);
        return {
            ...entry,
            key,
            servedBy: this.#backend.instanceId,
            mode: this.#backend.mode,
            cache: FANOUT_CACHE_NAME,
            namespace: this.#backend.namespace,
            ttlMs: CACHE_TTL_MS,
        };
    }
}
