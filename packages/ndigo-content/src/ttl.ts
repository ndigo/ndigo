/**
 */
import { ContentSource } from './content';
import { LanguageCode } from './language-code';

/**
 * An async loader function that resolves content for a given key and language.
 */
export type ContentLoader = (key: string, language: string | LanguageCode) => Promise<string>;

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
     * The number of entries currently held (expired entries are swept on
     * write, so this reflects live-plus-not-yet-swept entries).
     */
    get size(): number {
        return this.#cache.size;
    }

    /**
     * Loads content via the loader when no unexpired cached value exists,
     * stores it, and returns it.
     *
     * Expired entries are swept on every write so dynamic keys cannot retain
     * memory indefinitely (PWB-REV-017).
     *
     * @param key - The content key to resolve.
     * @param language - The requested language code.
     * @returns The resolved content value.
     */
    async getContent(key: string, language: string | LanguageCode): Promise<string> {
        const lang = String(language);
        const cacheKey = `${key}:${lang}`;
        const entry = this.#cache.get(cacheKey);

        if (entry && Date.now() < entry.expiresAt) {
            return entry.value;
        }

        const value = await this.#loader(key, lang);

        this.#sweepExpired();
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
     * Removes every entry whose TTL has elapsed.
     */
    #sweepExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.#cache) {
            if (now >= entry.expiresAt) {
                this.#cache.delete(key);
            }
        }
    }

    /**
     * Evicts the cache entry for a specific key+language pair.
     */
    invalidateEntry(key: string, language: string | LanguageCode): void {
        this.#cache.delete(`${key}:${String(language)}`);
    }
}
