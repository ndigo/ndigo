/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContentSource } from './content';

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
 * BCP 47-ish shape for a language tag: a 2–8 letter primary subtag followed
 * by 1–8 alphanumeric extension subtags. This is deliberately stricter
 * than `Intl` (which silently accepts near-anything): quotable and
 * whitespace characters — `"`, `<`, `>`, `'`, `&`, control chars — never
 * pass, so a validated value is safe in generated markup and as a cache
 * key.
 */
const languageTagPattern = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;

/**
 * Cap on tag length — 8 primary + 8×(8+1) extension chars worst case is
 * 80; 64 keeps room for real tags while bounding attacker-supplied input.
 */
const MAX_LOCALE_LENGTH = 64;

/**
 * Validates and canonicalizes a language tag.
 *
 * Rejects non-strings, empty/overlong values, tags with characters outside
 * the BCP 47 alphabet (quotes, whitespace, angle brackets), and tags the
 * platform's `Intl` implementation refuses. Returns the canonical form
 * (`EN-us` → `en-US`) or `undefined` when the value is not a usable tag.
 *
 * @param value - The candidate language tag.
 * @returns The canonical tag, or `undefined` when unusable.
 */
export const normalizeLocale = (value: unknown): string | undefined => {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_LOCALE_LENGTH) {
        return undefined;
    }
    if (!languageTagPattern.test(value)) {
        return undefined;
    }
    try {
        return Intl.getCanonicalLocales(value)[0];
    } catch {
        return undefined;
    }
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
    constructor(source: ContentSource, defaultLanguage = 'en') {
        this.#source = source;
        this.#defaultLanguage = defaultLanguage;
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
    async getContent(key: string, language: string): Promise<string> {
        let lang = language.includes(',') ? (parseAcceptLanguage(language) ?? this.#defaultLanguage) : language;

        // Strip region subtag (e.g. fr-CH → fr) for content lookup
        const baseLang = lang.split('-')[0];
        if (baseLang !== lang) {
            const result = await this.#source.getContent(key, baseLang);
            if (result !== key) {
                return result;
            }
        }

        const result = await this.#source.getContent(key, lang);
        if (result !== key) {
            return result;
        }

        // Try the default language as a final fallback
        if (lang !== this.#defaultLanguage) {
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
