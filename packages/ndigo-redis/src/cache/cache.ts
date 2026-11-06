/**
 */
import { CacheMiss, type Cache } from '@ndigo/cache';
import { RedisConnection } from '../connection';
import { encode, decode } from './_codec';

/** Redis-only policy: TTL, not memory's per-store LRU/FIFO or maxSize. */
export interface RedisCacheOptions {
    /** Application/environment namespace; required and encoded independently of cacheName. */
    namespace: string;
    /** Required cache name; shared across independently constructed handles. */
    cacheName: string;
    /** Positive finite milliseconds, rounded upward to Redis millisecond precision. */
    defaultTtl?: number;
}

/** Convert JS UTF-16 units losslessly; lone surrogates must not alias replacement characters. */
function component(value: string): string {
    let result = '';
    for (let i = 0; i < value.length; i++) result += value.charCodeAt(i).toString(16).padStart(4, '0');
    return result;
}

/**
 * Standalone Redis cache. All I/O is through an explicitly connected foundation.
 * Closing that connection invalidates all its handles. clear()/size() scan only
 * this namespace; stop concurrent writers for a stable clear/count. No FLUSHDB,
 * keyspace-wide KEYS command, cluster guarantee or per-cache eviction simulation.
 */
export class RedisCache<V = unknown> implements Cache<V> {
    readonly #connection: RedisConnection;
    readonly #prefix: string;
    readonly #defaultTtl: number | undefined;

    constructor(connection: RedisConnection, options: RedisCacheOptions) {
        if (
            typeof options.namespace !== 'string' ||
            options.namespace.length === 0 ||
            typeof options.cacheName !== 'string' ||
            options.cacheName.length === 0
        ) {
            throw new TypeError('RedisCache: namespace and cacheName must be non-empty strings');
        }
        if ('maxSize' in options || 'eviction' in options) {
            throw new TypeError('RedisCache: maxSize and eviction are not supported');
        }
        this.#defaultTtl = options.defaultTtl === undefined ? undefined : this.#ttl(options.defaultTtl);
        this.#connection = connection;
        this.#prefix = `ndigo:cache:v1:${component(options.namespace)}:${component(options.cacheName)}:`;
    }

    #key(key: string): string {
        if (typeof key !== 'string') throw new TypeError('RedisCache: key must be a string');
        return this.#prefix + component(key);
    }

    #ttl(ttl: number): number {
        if (!Number.isFinite(ttl) || ttl <= 0 || !Number.isSafeInteger(Math.ceil(ttl))) {
            throw new TypeError('RedisCache: TTL must be positive finite safe milliseconds');
        }
        return Math.ceil(ttl);
    }

    async get(key: string): Promise<V | CacheMiss> {
        const encodedKey = this.#key(key);
        return this.#connection.run(async (client) => {
            const value = await client.get(encodedKey);
            return value === null ? CacheMiss.INSTANCE : (decode(value) as V);
        });
    }

    async set(key: string, value: V, ttl?: number): Promise<void> {
        const encodedKey = this.#key(key);
        const payload = encode(value);
        const ttlMs = ttl === undefined ? this.#defaultTtl : this.#ttl(ttl);
        await this.#connection.run(async (client) => {
            await client.set(
                encodedKey,
                payload,
                ttlMs === undefined ? undefined : { expiration: { type: 'PX', value: ttlMs } }
            );
        });
    }

    async has(key: string): Promise<boolean> {
        // Decode as get does: corruption is a failure, not an apparent valid hit.
        return (await this.get(key)) !== CacheMiss.INSTANCE;
    }

    async delete(key: string): Promise<boolean> {
        const encodedKey = this.#key(key);
        return this.#connection.run(async (client) => (await client.del(encodedKey)) !== 0);
    }

    /** Bounded DEL batches; Redis SCAN COUNT is a hint, not a hard page limit. */
    async clear(): Promise<void> {
        await this.#connection.run(async (client) => {
            for await (const keys of client.scanIterator({ MATCH: this.#prefix + '*', COUNT: 128 })) {
                for (let start = 0; start < keys.length; start += 128) {
                    // eslint-disable-next-line no-await-in-loop -- serialize chunks to bound queued Redis commands
                    await client.del(keys.slice(start, start + 128));
                }
            }
        });
    }

    /** Deduplicates SCAN results and checks server-side expiry; not an atomic snapshot. */
    async size(): Promise<number> {
        return this.#connection.run(async (client) => {
            const seen = new Set<string>();
            let count = 0;
            for await (const keys of client.scanIterator({ MATCH: this.#prefix + '*', COUNT: 128 })) {
                const fresh = keys.filter((key) => {
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                for (let start = 0; start < fresh.length; start += 128) {
                    // eslint-disable-next-line no-await-in-loop -- bound queued Redis commands and accumulate each chunk once
                    count += await client.exists(fresh.slice(start, start + 128));
                }
            }
            return count;
        });
    }
}
