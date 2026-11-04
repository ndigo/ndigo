/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { like } from '@ndigo/util/types';
import { Constructable } from '@ndigo/core';
import { likeAwareAnd, Aware, AsAware } from '@ndigo/factory';
import { LanguageCode } from './language-code';
import * as LanguageCodes from './language-codes';

/**
 * Resolves localized content for a given key and language.
 */
export interface ContentSource {
    /**
     * Gets translated content for the requested key and language.
     *
     * Methods are async by default; implementations may be synchronous
     * under the hood. Resolves to the content string, or the key itself
     * when no translation exists.
     *
     * @param key - The content key to resolve.
     * @param language - The requested language code.
     * @returns A promise of the resolved content string.
     */
    getContent(key: string, language: string | LanguageCode): Promise<string>;
}

/**
 * Nested dictionary of content keyed by content id and language code.
 */
export type ContentDictionary = Record<string, Record<string, string>>;

/**
 * In-memory content source with language fallback support.
 */
export class StaticContentSource implements ContentSource {
    #content: ContentDictionary;
    #defaultLanguage: string;

    /**
     * Creates an in-memory content source.
     *
     * @param content - Localized content keyed by content id and language.
     * @param defaultLanguage - Fallback language used when a translation is missing.
     */
    constructor(content: ContentDictionary = {}, defaultLanguage: string | LanguageCode = LanguageCodes.EN) {
        this.#content = content;
        this.#defaultLanguage = String(defaultLanguage);
    }

    /**
     * Resolves content with a language fallback to the default language and then the key itself.
     *
     * Async by contract (see {@link ContentSource}); the lookup itself is
     * synchronous, so the promise resolves on the next microtask.
     *
     * @param key - The content key to resolve.
     * @param language - The requested language code.
     * @returns The localized content or the key when no translation exists.
     */
    async getContent(key: string, language: string | LanguageCode): Promise<string> {
        const lang = String(language);
        const entry = this.#content[key] || {};

        if (typeof entry[lang] === 'string') {
            return entry[lang];
        }

        if (typeof entry[this.#defaultLanguage] === 'string') {
            return entry[this.#defaultLanguage];
        }

        return key;
    }

    /**
     * Checks whether content exists for the requested key in the given language or default language.
     *
     * @param key - The content key to look up.
     * @param language - The requested language code.
     * @returns `true` when a translation is available.
     */
    hasContent(key: string, language: string | LanguageCode): boolean {
        const lang = String(language);
        const entry = this.#content[key] || {};
        return typeof entry[lang] === 'string' || typeof entry[this.#defaultLanguage] === 'string';
    }
}

/**
 * Marks an object that can receive a content source.
 */
export interface ContentSourceAware extends Aware {
    /**
     * Sets the content source used by the receiver.
     *
     * @param contentSource - The content source to attach.
     */
    setContentSource(contentSource: ContentSource): void;
}

/**
 * Mixes content-source awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a content source.
 */
export const AsContentSourceAware = <T extends Constructable>(superclass: T): Constructable<ContentSourceAware> & T =>
    class extends AsAware(superclass) implements ContentSourceAware {
        contentSource: ContentSource | null = null;

        /**
         * Attaches a content source to the instance.
         *
         * @param contentSource - The content source to store.
         */
        setContentSource(contentSource: ContentSource): void {
            Reflect.defineProperty(this, 'contentSource', {
                value: contentSource,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like a content source.
 *
 * @param value - The value to be tested.
 * @returns Whether the value matches the content source shape.
 */
export const likeContentSource = like({ getContent: Function }) as (value: unknown) => value is ContentSource;

/**
 * Tests whether a value looks like content-source-aware state.
 *
 * @param value - The value to be tested.
 * @returns Whether the value can receive a content source.
 */
export const likeContentSourceAware = likeAwareAnd(like({ setContentSource: Function })) as (
    value: unknown
) => value is ContentSourceAware;
