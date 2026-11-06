/**
 */
import { ContentSource } from './content';
import { LanguageCode } from './language-code';
import { Theme, ThemeResolver } from './theme';

/**
 * Merges multiple content sources in priority order.
 *
 * `getContent` tries each source in order and returns the first result that
 * is not identical to the requested key (i.e. a real translation was found).
 * Falls back to the key itself when all sources return the key unchanged.
 */
export class CompositeContentSource implements ContentSource {
    #sources: ContentSource[];

    /**
     * Creates a composite content source.
     *
     * @param sources - Sources ordered by priority, highest first.
     */
    constructor(sources: ContentSource[]) {
        if (!sources.length) {
            throw new TypeError('CompositeContentSource requires at least one source');
        }
        this.#sources = sources;
    }

    /**
     * Resolves the first real translation across all sources.
     *
     * @param key - The content key.
     * @param language - The requested language code.
     * @returns The first translated value, or the key when none is found.
     */
    async getContent(key: string, language: string | LanguageCode): Promise<string> {
        for (const source of this.#sources) {
            // oxlint-disable-next-line no-await-in-loop -- sources resolve in priority order with first-match-wins; parallelizing would change which translation wins.
            const result = await source.getContent(key, language);
            if (result !== key) {
                return result;
            }
        }
        return key;
    }
}

/**
 * Chains multiple theme resolvers in priority order.
 *
 * `getTheme` tries each resolver in order and returns the first successful
 * result. Throws when all resolvers fail to resolve the theme.
 */
export class CompositeThemeResolver implements ThemeResolver {
    #resolvers: ThemeResolver[];

    /**
     * Creates a composite theme resolver.
     *
     * @param resolvers - Resolvers ordered by priority, highest first.
     */
    constructor(resolvers: ThemeResolver[]) {
        if (!resolvers.length) {
            throw new TypeError('CompositeThemeResolver requires at least one resolver');
        }
        this.#resolvers = resolvers;
    }

    /**
     * Resolves the first successfully found theme across all resolvers.
     *
     * @param name - Optional theme name.
     * @returns The first resolved theme.
     * @throws {TypeError} When no resolver can provide the theme.
     */
    getTheme(name?: string): Theme {
        for (const resolver of this.#resolvers) {
            try {
                const theme = resolver.getTheme(name);
                // When a specific name was requested, only accept an exact match.
                // Resolvers that don't have the theme fall back to their default,
                // so we skip those and try the next resolver.
                if (!name || theme.name === name) {
                    return theme;
                }
            } catch {
                // try next resolver
            }
        }
        throw new TypeError(`No resolver could provide theme: "${name ?? 'default'}"`);
    }
}
