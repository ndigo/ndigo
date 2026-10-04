/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContentSource } from './content';
import { LanguageCode } from './language-code';
import * as LanguageCodes from './language-codes';

/**
 * Parses the first language tag from an `Accept-Language` header value.
 *
 * @param header - The raw `Accept-Language` header value.
 * @returns The primary language tag, or `undefined`.
 *
 * @example
 * ```ts
 * parseAcceptLanguage('fr-CH, fr;q=0.9, en;q=0.8'); // 'fr-CH'
 * parseAcceptLanguage('en-US,en;q=0.5');              // 'en-US'
 * ```
 */
export const parseAcceptLanguage = (header: string): string | undefined => {
    return header.split(',')[0]?.split(';')[0]?.trim() || undefined;
};

/**
 * Content source that resolves content using Accept-Language negotiation.
 *
 * Parses the `Accept-Language` header from a request to determine the preferred
 * language, then resolves content from a delegate source. This bridges
 * `@blue/content` content sources with HTTP request-level language negotiation.
 *
 * @example
 * ```ts
 * const source = new StaticContentSource({
 *   title: { en: 'Hello', fr: 'Bonjour' },
 * });
 * const negotiator = new NegotiatingContentSource(source, 'en');
 *
 * negotiator.getContent('title', 'fr-CH, fr;q=0.9, en;q=0.8');
 * // → 'Bonjour' (resolves fr-CH → fr from the header)
 *
 * negotiator.getContent('title', 'de');
 * // → 'Hello' (falls back to default language 'en')
 * ```
 */
export class NegotiatingContentSource implements ContentSource {
    #source: ContentSource;
    #defaultLanguage: string;

    /**
     * Creates a negotiating content source.
     *
     * @param source - The underlying content source providing translations.
     * @param defaultLanguage - Fallback language when the header cannot be parsed.
     */
    constructor(source: ContentSource, defaultLanguage: string | LanguageCode = LanguageCodes.EN) {
        this.#source = source;
        this.#defaultLanguage = String(defaultLanguage);
    }

    /**
     * Resolves content using the language from the Accept-Language header.
     *
     * The `language` parameter is treated as a raw `Accept-Language` header value.
     * The first language tag is parsed and used for content resolution.
     * Region subtags (e.g. `fr-CH`) are stripped to the base language (`fr`)
     * before looking up content.
     *
     * @param key - The content key to resolve.
     * @param language - An `Accept-Language` header value or bare language code.
     * @returns The translated content, or the key when no translation is found.
     */
    async getContent(key: string, language: string | LanguageCode): Promise<string> {
        const lang = String(language);
        let resolved = lang.includes(',') ? (parseAcceptLanguage(lang) ?? this.#defaultLanguage) : lang;

        // Strip region subtag (e.g. fr-CH → fr) for content lookup
        const baseLang = resolved.split('-')[0];
        if (baseLang !== resolved) {
            const result = await this.#source.getContent(key, baseLang);
            if (result !== key) {
                return result;
            }
        }

        const result = await this.#source.getContent(key, resolved);
        if (result !== key) {
            return result;
        }

        // Try the default language as a final fallback
        if (resolved !== this.#defaultLanguage) {
            return this.#source.getContent(key, this.#defaultLanguage);
        }

        return key;
    }

    /**
     * The default language configured for this source.
     */
    get defaultLanguage(): string {
        return this.#defaultLanguage;
    }
}
