/**
 * Composite content and theme sources that delegate across a list.
 */
import { ContentSource } from './content';
import { LanguageCode } from './language-code';
import { Theme, ThemeSource } from './theme';

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
 * Chains multiple theme sources in priority order.
 *
 * `getTheme` tries each source in order and returns the first successful
 * result. Throws when all sources fail to resolve the theme.
 */
export class CompositeThemeSource implements ThemeSource {
    #sources: ThemeSource[];

    /**
     * Creates a composite theme source.
     *
     * @param sources - Sources ordered by priority, highest first.
     */
    constructor(sources: ThemeSource[]) {
        if (!sources.length) {
            throw new TypeError('CompositeThemeSource requires at least one theme source');
        }
        this.#sources = sources;
    }

    /**
     * Resolves the first successfully found theme across all sources.
     *
     * @param name - Optional theme name.
     * @returns The first resolved theme.
     * @throws When no source can provide the theme.
     */
    getTheme(name?: string): Theme {
        for (const source of this.#sources) {
            try {
                const theme = source.getTheme(name);
                // When a specific name was requested, only accept an exact match.
                // Sources that don't have the theme fall back to their default,
                // so we skip those and try the next source.
                if (!name || theme.name === name) {
                    return theme;
                }
            } catch {
                // try next source
            }
        }
        throw new TypeError(`No theme source could provide theme: "${name ?? 'default'}"`);
    }
}
