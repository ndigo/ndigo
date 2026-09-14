/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContentSource } from './content';

/**
 * Content source that merges multiple sources in priority order.
 *
 * Higher-priority sources override values from lower-priority sources.
 * This enables theme composition — a base theme provides defaults and
 * an overriding theme only needs to supply the values it changes.
 *
 * @example
 * ```ts
 * const base = new StaticContentSource({
 *   title: { en: 'My App', fr: 'Mon App' },
 *   tagline: { en: 'Welcome', fr: 'Bienvenue' },
 * });
 * const override = new StaticContentSource({
 *   tagline: { en: 'Hello!' },
 * });
 *
 * const merged = new PriorityContentSource([override, base]);
 * merged.getContent('title', 'en');  // 'My App'  (from base)
 * merged.getContent('tagline', 'en'); // 'Hello!'  (from override)
 * ```
 */
export class PriorityContentSource implements ContentSource {
    #sources: ContentSource[];

    /**
     * Creates a priority-ordered content source.
     *
     * @param sources - Sources ordered by priority, highest first.
     *                  The first source with a non-trivial translation wins.
     * @throws {TypeError} When no sources are provided.
     */
    constructor(sources: ContentSource[]) {
        if (!sources.length) {
            throw new TypeError('PriorityContentSource requires at least one source');
        }
        this.#sources = sources;
    }

    /**
     * Resolves content by trying each source in priority order.
     *
     * Returns the first value that differs from the requested key,
     * meaning a real translation was found. Falls back to the key
     * itself when no source has a translation.
     *
     * @param key - The content key.
     * @param language - The requested language code.
     * @returns The translated value from the highest-priority source, or the key.
     */
    getContent(key: string, language: string): string {
        for (const source of this.#sources) {
            const result = source.getContent(key, language);
            if (result !== key) {
                return result;
            }
        }
        return key;
    }
}
