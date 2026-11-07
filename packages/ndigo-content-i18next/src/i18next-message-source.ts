/**
 * i18next-backed message source for localized content.
 */
import { createInstance, i18n, Resource, TFunction } from 'i18next';
import { LanguageCode, MessageParams, MessageSource, normalizeLocale } from '@ndigo/content';

/**
 * Options for constructing an {@link I18nextMessageSource}.
 */
export interface I18nextMessageSourceOptions {
    /**
     * Static resource bundles (namespaces keyed by language) — the
     * synchronous path for SSR and tests.
     */
    resources?: Resource;
    /**
     * The active language when no per-call language is given.
     */
    language?: string | LanguageCode;
    /**
     * Fallback language or ordered fallback chain.
     */
    fallbackLanguage?: string | LanguageCode | Array<string | LanguageCode>;
    /**
     * Lazy-loading backend instance (e.g. `i18next-http-backend`).
     */
    backend?: object;
    /**
     * Namespaces to load.
     */
    ns?: string[];
    /**
     * The default namespace.
     */
    defaultNS?: string;
}

/**
 * A {@link MessageSource} implemented over an i18next instance.
 *
 * i18next owns resource storage, interpolation, plurals (via
 * `Intl.PluralRules`), contexts, and fallback chains; this adapter maps the
 * Ndigo contract onto that surface. Missing messages fall back to the key.
 *
 * Each instance owns its i18next instance (`createInstance()`) — no global
 * singleton, safe for isomorphic use.
 *
 * @example
 * ```ts
 * const messages = new I18nextMessageSource({
 *     resources: {
 *         en: { translation: { greeting: 'Hello {{name}}!', items_one: 'one item', items_other: '{{count}} items' } },
 *         fr: { translation: { greeting: 'Bonjour {{name}} !' } },
 *     },
 *     language: 'en',
 *     fallbackLanguage: 'en',
 * });
 * await messages.getMessage('greeting', { values: { name: 'Ada' } });          // 'Hello Ada!'
 * await messages.getMessage('items', { count: 3 });                            // '3 items'
 * await messages.getMessage('greeting', { values: { name: 'Ada' } }, 'fr');    // 'Bonjour Ada !'
 * ```
 */
export class I18nextMessageSource implements MessageSource {
    /**
     * The underlying i18next instance (escape hatch for advanced use).
     */
    readonly instance: i18n;

    #fixedTByLanguage = new Map<string, TFunction>();

    /** Cap on cached per-language translation functions. */
    static readonly #MAX_FIXED_T = 64;

    /**
     * Creates a message source over i18next.
     *
     * @param options - i18next configuration mapped onto the Ndigo contract.
     */
    constructor(options: I18nextMessageSourceOptions = {}) {
        const { resources, language, fallbackLanguage, backend, ns, defaultNS } = options;

        this.instance = createInstance();
        // initAsync: false + static resources make getMessage available
        // synchronously (SSR path); backend-loaded namespaces resolve lazily.
        // ns/defaultNS only when provided — explicit undefined breaks i18next's
        // default-namespace ('translation') resolution.
        void this.instance
            .init({
                resources,
                lng: language === undefined ? undefined : String(language),
                fallbackLng:
                    fallbackLanguage === undefined
                        ? undefined
                        : Array.isArray(fallbackLanguage)
                          ? fallbackLanguage.map(String)
                          : String(fallbackLanguage),
                returnEmptyString: false,
                initAsync: false,
                ...(ns ? { ns } : {}),
                ...(defaultNS ? { defaultNS } : {}),
                ...(backend ? { backend } : {}),
            })
            .catch(() => {
                // init failures surface as missing keys via the key fallback.
            });
    }

    /**
     * The currently active language.
     */
    get language(): string | undefined {
        return this.instance.language;
    }

    /**
     * Resolves and formats the message for the requested key.
     *
     * @param key - The message key to resolve (dot notation nests; plural and
     *   context variants use i18next `_one`/`_other`/`_male`-style suffixes).
     * @param params - Interpolation values, plural count, and context.
     * @param language - Language override; the active language when omitted.
     * @returns The formatted message, or the key itself when missing.
     */
    async getMessage(key: string, params?: MessageParams, language?: string | LanguageCode): Promise<string> {
        const t = language === undefined ? this.instance.t : this.#fixedT(language);

        return t(key, {
            ...params?.values,
            ...(params?.count !== undefined ? { count: params.count } : {}),
            ...(params?.context !== undefined ? { context: params.context } : {}),
        });
    }

    /**
     * Switches the active language.
     *
     * @param language - The language to activate.
     */
    async changeLanguage(language: string | LanguageCode): Promise<void> {
        await this.instance.changeLanguage(String(language));
        this.#fixedTByLanguage.clear();
    }

    /**
     * Preloads resources for the given languages (no-op for languages
     * already provided as static resources).
     *
     * @param languages - The languages to load.
     */
    async preload(languages: Array<string | LanguageCode>): Promise<void> {
        await this.instance.loadLanguages(languages.map(String));
    }

    #fixedT(language: string | LanguageCode): TFunction {
        // Normalize first: junk languages (request-derived values) collapse
        // onto the instance language, keeping the cache key space small.
        const resolvedLanguage = normalizeLocale(String(language)) ?? this.instance.language ?? String(language);
        let t = this.#fixedTByLanguage.get(resolvedLanguage);
        if (!t) {
            t = this.instance.getFixedT(resolvedLanguage);
            if (this.#fixedTByLanguage.size >= I18nextMessageSource.#MAX_FIXED_T) {
                this.#fixedTByLanguage.clear();
            }
            this.#fixedTByLanguage.set(resolvedLanguage, t);
        }
        return t;
    }
}
