/**
 * Token-version revocation tracking for the JWT adapter.
 */
import type { UserStore } from '@ndigo/auth-core';
import { JWTTokenError } from './jwt-adapter-types.js';

/** Cap on the revocation `tokenVersion` cache. */
const MAX_REVOCATION_CACHE_ENTRIES = 10_000;

/**
 * Reads and caches account `tokenVersion` values for revocation.
 *
 * The cache is a throughput optimization only: evicting a live entry costs
 * one `UserStore.findById`, never a wrong auth decision.
 */
export class JWTRevocationTracker {
    readonly #userStore: UserStore | undefined;
    readonly #ttlMs: number;
    readonly #versionCache = new Map<string, { version: number; expiresAt: number }>();

    constructor(userStore: UserStore | undefined, ttlMs: number) {
        this.#userStore = userStore;
        this.#ttlMs = ttlMs;
    }

    /** Returns the user store, throwing when the flow requires one. */
    requireStore(flow: string): UserStore {
        if (!this.#userStore) {
            throw new JWTTokenError(`${flow} requires a userStore — revocation is user-record token versioning`);
        }
        return this.#userStore;
    }

    /**
     * Reads the account's current `tokenVersion` for the `ver` check,
     * honoring the short-TTL cache when configured. Returns `null` for an
     * unknown or disabled/deleted account, failing validation closed.
     */
    async currentVersion(sub: string): Promise<number | null> {
        const ttl = this.#ttlMs;
        if (ttl > 0) {
            const hit = this.#versionCache.get(sub);
            if (hit && hit.expiresAt > Date.now()) return hit.version;
        }
        const store = this.#userStore;
        if (store === undefined) return null;
        const user = await store.findById(sub);
        const version = user === null || user.disabled === true ? null : (user.tokenVersion ?? 0);
        if (ttl > 0 && version !== null) {
            this.#prune();
            this.#versionCache.set(sub, { version, expiresAt: Date.now() + ttl });
        }
        return version;
    }

    /** Caches a freshly advanced version. */
    cacheVersion(sub: string, version: number): void {
        if (this.#ttlMs > 0) {
            this.#prune();
            this.#versionCache.set(sub, { version, expiresAt: Date.now() + this.#ttlMs });
        }
    }

    /**
     * Bounds the cache: no-op below the cap; at the cap, delete-on-sight sweep
     * of expired entries, then oldest-first eviction until the insert fits.
     */
    #prune(): void {
        if (this.#versionCache.size < MAX_REVOCATION_CACHE_ENTRIES) return;
        const now = Date.now();
        for (const [key, entry] of this.#versionCache) {
            if (entry.expiresAt <= now) {
                this.#versionCache.delete(key);
            }
        }
        while (this.#versionCache.size >= MAX_REVOCATION_CACHE_ENTRIES) {
            const oldest = this.#versionCache.keys().next();
            if (oldest.done) break;
            this.#versionCache.delete(oldest.value);
        }
    }
}
