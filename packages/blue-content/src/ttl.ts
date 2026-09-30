/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContentSource } from './content';

/**
 * An async loader function that resolves content for a given key and language.
 */
export type ContentLoader = (key: string, language: string) => Promise<string>;

/**
 * Content source that wraps a loader with a TTL-based in-memory cache.
 *
 * `getContent` is async by contract; the loader runs once per key+language
 * pair and the result is cached until it expires.
 */
export class TtlContentSource implements ContentSource {
    #loader: ContentLoader;
    #ttl: number;
    #cache: Map<string, { value: string; expiresAt: number }>;

    /**
     * Creates a TTL content source.
     *
     * @param loader - Async function that loads content by key and language.
     * @param ttl - Cache lifetime in milliseconds. Defaults to 60 000 ms.
     */
    constructor(loader: ContentLoader, ttl = 60_000) {
        this.#loader = loader;
        this.#ttl = ttl;
        this.#cache = new Map();
    }

    /**
     * Loads content via the loader when no unexpired cached value exists,
     * stores it, and returns it.
     *
     * @param key - The content key to resolve.
     * @param language - The requested language code.
     * @returns The resolved content value.
     */
    async getContent(key: string, language: string): Promise<string> {
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
