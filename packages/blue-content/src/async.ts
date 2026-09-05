/**
 * @author Jeff Rose
 */

import { ContentSource } from './content';

/**
 * An async loader function that resolves content for a given key and language.
 */
export type AsyncContentLoader = (key: string, language: string) => Promise<string>;

/**
 * Extends ContentSource with asynchronous content loading.
 */
export interface AsyncContentSource extends ContentSource {
    /**
     * Asynchronously resolves content for the requested key and language.
     */
    getContentAsync(key: string, language: string): Promise<string>;
}

/**
 * Content source that wraps an async loader with a TTL-based in-memory cache.
 *
 * Synchronous `getContent` returns the cached value when available, or the key
 * itself as a fallback until the first async load completes.
 */
export class TtlContentSource implements AsyncContentSource {
    #loader: AsyncContentLoader;
    #ttl: number;
    #cache: Map<string, { value: string; expiresAt: number }>;

    /**
     * Creates a TTL content source.
     *
     * @param loader - Async function that loads content by key and language.
     * @param ttl - Cache lifetime in milliseconds. Defaults to 60 000 ms.
     */
    constructor(loader: AsyncContentLoader, ttl = 60_000) {
        this.#loader = loader;
        this.#ttl = ttl;
        this.#cache = new Map();
    }

    /**
     * Returns the cached content for the key+language pair, or the key itself
     * when no cached value is present.
     */
    getContent(key: string, language: string): string {
        const cacheKey = `${key}:${language}`;
        const entry = this.#cache.get(cacheKey);

        if (entry && Date.now() < entry.expiresAt) {
            return entry.value;
        }

        return key;
    }

    /**
     * Loads content via the async loader, stores it in the cache, and returns it.
     * Uses the cached value when it has not yet expired.
     */
    async getContentAsync(key: string, language: string): Promise<string> {
        const cacheKey = `${key}:${language}`;
        const entry = this.#cache.get(cacheKey);

        if (entry && Date.now() < entry.expiresAt) {
            return entry.value;
        }

        const value = await this.#loader(key, language);

        this.#cache.set(cacheKey, {
            value,
            expiresAt: Date.now() + this.#ttl,
        });

        return value;
    }

    /**
     * Evicts all cached entries, forcing the next load to call the loader.
     */
    invalidate(): void {
        this.#cache.clear();
    }

    /**
     * Evicts the cache entry for a specific key+language pair.
     */
    invalidateEntry(key: string, language: string): void {
        this.#cache.delete(`${key}:${language}`);
    }
}
